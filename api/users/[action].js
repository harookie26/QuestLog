import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connect } from '../../lib/db.js';
import User from '../../lib/models/User.js';
import PendingPasswordReset from '../../lib/models/PendingPasswordReset.js';
import { clearSessionCookie, getSessionUser, setSessionCookie } from '../../lib/auth/session.js';

const RESET_TOKEN_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MS = RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000;

function toCaseInsensitiveExactRegex(value) {
  return new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function getAction(req) {
  const raw = req?.query?.action;
  if (Array.isArray(raw)) return String(raw[0] || '').trim();
  return String(raw || '').trim();
}

async function handleLogin(req, res) {
  const { identifier, password, keepSignedIn } = req.body || {};

  if (!identifier || !String(identifier).trim()) return res.status(400).send('username or email is required');
  if (!password || !String(password).trim()) return res.status(400).send('password is required');

  const cleanIdentifier = String(identifier).trim();

  const user = await User.findOne({
    $or: [
      { username: toCaseInsensitiveExactRegex(cleanIdentifier) },
      { email: toCaseInsensitiveExactRegex(cleanIdentifier.toLowerCase()) }
    ]
  }).lean();

  if (!user) {
    return res.status(401).send('Invalid credentials');
  }

  const matches = await bcrypt.compare(String(password), user.password);
  if (!matches) {
    return res.status(401).send('Invalid credentials');
  }

  const authUser = setSessionCookie(res, user, Boolean(keepSignedIn));

  return res.status(200).json(authUser);
}

async function handleMe(req, res) {
  const authUser = getSessionUser(req);
  if (!authUser) {
    return res.status(401).send('Not authenticated');
  }

  return res.status(200).json(authUser);
}

async function handleLogout(req, res) {
  clearSessionCookie(res);
  return res.status(200).json({ message: 'Logged out' });
}

async function handleSignup(req, res) {
  const { username, email, password, birthdate, gender } = req.body || {};

  if (!username || !String(username).trim()) return res.status(400).send('username is required');
  if (!email || !String(email).trim()) return res.status(400).send('email is required');
  if (!password || !String(password).trim()) return res.status(400).send('password is required');

  const cleanUsername = String(username).trim();
  const cleanEmail = String(email).trim().toLowerCase();

  const existingUser = await User.findOne({
    $or: [
      { username: toCaseInsensitiveExactRegex(cleanUsername) },
      { email: toCaseInsensitiveExactRegex(cleanEmail) }
    ]
  }).lean();

  if (existingUser) {
    return res.status(409).send('username or email already exists');
  }

  let parsedBirthdate;
  if (birthdate) {
    parsedBirthdate = new Date(birthdate);
    if (Number.isNaN(parsedBirthdate.getTime())) {
      return res.status(400).send('birthdate is invalid');
    }
  }

  const hashedPassword = await bcrypt.hash(String(password), 10);
  const userToInsert = {
    username: cleanUsername,
    email: cleanEmail,
    password: hashedPassword,
    role: 'Member',
    birthdate: parsedBirthdate,
    gender: gender ? String(gender) : undefined,
    createdAt: new Date()
  };

  const created = await User.collection.insertOne(userToInsert);

  return res.status(201).json({
    message: 'Profile created successfully',
    _id: created.insertedId.toString(),
    username: userToInsert.username,
    email: userToInsert.email,
    role: userToInsert.role,
    birthdate: userToInsert.birthdate || null,
    gender: userToInsert.gender || null,
    createdAt: userToInsert.createdAt
  });
}

async function handleRequestPasswordReset(req, res) {
  const { email } = req.body || {};

  if (!email || !String(email).trim()) {
    return res.status(400).send('email is required');
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: toCaseInsensitiveExactRegex(cleanEmail) }).lean();

  if (!user) {
    return res.status(404).send('No account found for this email.');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await PendingPasswordReset.updateOne(
    { email: cleanEmail },
    {
      $set: {
        userId: user._id,
        email: cleanEmail,
        resetTokenHash: sha256(resetToken),
        resetTokenExpiresAt,
        expiresAt: resetTokenExpiresAt,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  return res.status(200).json({
    message: 'Password reset session started',
    email: cleanEmail,
    resetToken,
    resetTokenExpiresAt
  });
}

async function handleResetPassword(req, res) {
  const { email, resetToken, newPassword, confirmPassword } = req.body || {};

  if (!email || !String(email).trim()) return res.status(400).send('email is required');
  if (!resetToken || !String(resetToken).trim()) return res.status(400).send('reset token is required');
  if (!newPassword || !String(newPassword).trim()) return res.status(400).send('new password is required');
  if (!confirmPassword || !String(confirmPassword).trim()) return res.status(400).send('confirm password is required');

  if (String(newPassword) !== String(confirmPassword)) {
    return res.status(400).send('Passwords do not match.');
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanResetToken = String(resetToken).trim();

  const pending = await PendingPasswordReset.findOne({ email: toCaseInsensitiveExactRegex(cleanEmail) });
  if (!pending || !pending.resetTokenHash || !pending.resetTokenExpiresAt) {
    return res.status(400).send('No active password reset session. Request a new code.');
  }

  if (pending.resetTokenExpiresAt.getTime() < Date.now()) {
    await PendingPasswordReset.deleteOne({ _id: pending._id });
    return res.status(400).send('Password reset session expired. Request a new code.');
  }

  if (sha256(cleanResetToken) !== pending.resetTokenHash) {
    return res.status(401).send('Invalid password reset session.');
  }

  const user = await User.findOne({ email: toCaseInsensitiveExactRegex(cleanEmail) });
  if (!user) {
    await PendingPasswordReset.deleteOne({ _id: pending._id });
    return res.status(404).send('No account found for this email.');
  }

  const sameAsCurrent = await bcrypt.compare(String(newPassword), user.password);
  if (sameAsCurrent) {
    return res.status(400).send('New password must be different from your current password.');
  }

  const hashedPassword = await bcrypt.hash(String(newPassword), 10);
  user.password = hashedPassword;
  await user.save();

  await PendingPasswordReset.deleteOne({ _id: pending._id });

  return res.status(200).json({ message: 'Password reset successful' });
}

export default async function handler(req, res) {
  const requestOrigin = req?.headers?.origin;
  const corsOrigin = process.env.CORS_ORIGIN || requestOrigin || '*';
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  if (corsOrigin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const action = getAction(req);
  const isGetMe = req.method === 'GET' && action === 'me';
  const isAllowedPost = req.method === 'POST';

  if (!isGetMe && !isAllowedPost) {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await connect();
  } catch (err) {
    console.error('DB connect error', err);
    return res.status(500).send('Database connection error');
  }

  try {
    if (action === 'me') return await handleMe(req, res);
    if (action === 'logout') return await handleLogout(req, res);
    if (action === 'login') return await handleLogin(req, res);
    if (action === 'signup') return await handleSignup(req, res);
    if (action === 'request-password-reset') return await handleRequestPasswordReset(req, res);
    if (action === 'reset-password') return await handleResetPassword(req, res);
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error(`POST /api/users/${action} error`, err);
    return res.status(500).send('Request failed');
  }
}