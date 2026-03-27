import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connect } from '../../lib/db.js';
import User from '../../lib/models/User.js';
import PendingSignup from '../../lib/models/PendingSignup.js';
import PendingPasswordReset from '../../lib/models/PendingPasswordReset.js';
import { sendPasswordResetOtpEmail, sendSignupOtpEmail } from '../../lib/otpEmail.js';

const OTP_EXPIRY_MINUTES = 10;
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MS = RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000;

function toCaseInsensitiveExactRegex(value) {
  return new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

function generateSixDigitOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function getAction(req) {
  const raw = req?.query?.action;
  if (Array.isArray(raw)) return String(raw[0] || '').trim();
  return String(raw || '').trim();
}

function requireStrictEmailDelivery() {
  return process.env.VERCEL_ENV === 'production' || process.env.STRICT_EMAIL_DELIVERY === 'true';
}

async function handleLogin(req, res) {
  const { identifier, password } = req.body || {};

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

  return res.status(200).json({
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role || 'Member'
  });
}

async function handleSendOtp(req, res) {
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

  const otpCode = generateSixDigitOtp();
  const otpHash = await bcrypt.hash(otpCode, 10);
  const hashedPassword = await bcrypt.hash(String(password), 10);
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await PendingSignup.updateOne(
    { email: cleanEmail },
    {
      $set: {
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        birthdate: parsedBirthdate,
        gender: gender ? String(gender) : undefined,
        otpHash,
        otpExpiresAt,
        failedAttempts: 0,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  const emailResult = await sendSignupOtpEmail({
    toEmail: cleanEmail,
    otpCode,
    expiresMinutes: OTP_EXPIRY_MINUTES
  });

  const payload = {
    message: 'Verification code sent',
    expiresAt: otpExpiresAt
  };

  if (!emailResult.delivered && requireStrictEmailDelivery()) {
    return res.status(503).send('Email delivery failed. Please verify SMTP configuration and provider limits.');
  }

  if (!emailResult.delivered && !requireStrictEmailDelivery()) {
    payload.devOtp = otpCode;
    payload.note = `Email delivery failed (${emailResult.reason || 'unknown'}). Use devOtp for local testing.`;
  }

  return res.status(200).json(payload);
}

async function handleVerifyOtp(req, res) {
  const { email, otp } = req.body || {};

  if (!email || !String(email).trim()) return res.status(400).send('email is required');
  if (!otp || !String(otp).trim()) return res.status(400).send('otp is required');

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanOtp = String(otp).trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    return res.status(400).send('otp must be a 6-digit code');
  }

  const pending = await PendingSignup.findOne({ email: toCaseInsensitiveExactRegex(cleanEmail) });

  if (!pending) {
    return res.status(404).send('No pending signup found. Request a new code.');
  }

  if (pending.otpExpiresAt.getTime() < Date.now()) {
    await PendingSignup.deleteOne({ _id: pending._id });
    return res.status(400).send('Verification code expired. Request a new code.');
  }

  if (pending.failedAttempts >= MAX_OTP_ATTEMPTS) {
    await PendingSignup.deleteOne({ _id: pending._id });
    return res.status(429).send('Too many failed attempts. Request a new code.');
  }

  const otpMatches = await bcrypt.compare(cleanOtp, pending.otpHash);
  if (!otpMatches) {
    await PendingSignup.updateOne({ _id: pending._id }, { $inc: { failedAttempts: 1 }, $set: { updatedAt: new Date() } });
    return res.status(401).send('Invalid verification code');
  }

  const existingUser = await User.findOne({
    $or: [
      { username: toCaseInsensitiveExactRegex(pending.username) },
      { email: toCaseInsensitiveExactRegex(cleanEmail) }
    ]
  }).lean();

  if (existingUser) {
    await PendingSignup.deleteOne({ _id: pending._id });
    return res.status(409).send('username or email already exists');
  }

  const userToInsert = {
    username: pending.username,
    email: cleanEmail,
    password: pending.password,
    role: 'Member',
    birthdate: pending.birthdate,
    gender: pending.gender,
    createdAt: new Date()
  };

  const created = await User.collection.insertOne(userToInsert);
  await PendingSignup.deleteOne({ _id: pending._id });

  return res.status(201).json({
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

  const otpCode = generateSixDigitOtp();
  const otpHash = await bcrypt.hash(otpCode, 10);
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await PendingPasswordReset.updateOne(
    { email: cleanEmail },
    {
      $set: {
        userId: user._id,
        email: cleanEmail,
        otpHash,
        otpExpiresAt,
        failedAttempts: 0,
        expiresAt: otpExpiresAt,
        updatedAt: new Date()
      },
      $unset: {
        resetTokenHash: 1,
        resetTokenExpiresAt: 1
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  const emailResult = await sendPasswordResetOtpEmail({
    toEmail: cleanEmail,
    otpCode,
    expiresMinutes: OTP_EXPIRY_MINUTES
  });

  const payload = {
    message: 'Password reset code sent',
    expiresAt: otpExpiresAt
  };

  if (!emailResult.delivered && requireStrictEmailDelivery()) {
    return res.status(503).send('Email delivery failed. Please verify SMTP configuration and provider limits.');
  }

  if (!emailResult.delivered && !requireStrictEmailDelivery()) {
    payload.devOtp = otpCode;
    payload.note = `Email delivery failed (${emailResult.reason || 'unknown'}). Use devOtp for local testing.`;
  }

  return res.status(200).json(payload);
}

async function handleVerifyPasswordResetOtp(req, res) {
  const { email, otp } = req.body || {};

  if (!email || !String(email).trim()) return res.status(400).send('email is required');
  if (!otp || !String(otp).trim()) return res.status(400).send('otp is required');

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanOtp = String(otp).trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    return res.status(400).send('otp must be a 6-digit code');
  }

  const pending = await PendingPasswordReset.findOne({ email: toCaseInsensitiveExactRegex(cleanEmail) });

  if (!pending) {
    return res.status(404).send('No pending password reset found. Request a new code.');
  }

  if (pending.otpExpiresAt.getTime() < Date.now()) {
    await PendingPasswordReset.deleteOne({ _id: pending._id });
    return res.status(400).send('Verification code expired. Request a new code.');
  }

  if (pending.failedAttempts >= MAX_OTP_ATTEMPTS) {
    await PendingPasswordReset.deleteOne({ _id: pending._id });
    return res.status(429).send('Too many failed attempts. Request a new code.');
  }

  const otpMatches = await bcrypt.compare(cleanOtp, pending.otpHash);
  if (!otpMatches) {
    await PendingPasswordReset.updateOne(
      { _id: pending._id },
      { $inc: { failedAttempts: 1 }, $set: { updatedAt: new Date() } }
    );
    return res.status(401).send('Invalid verification code');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await PendingPasswordReset.updateOne(
    { _id: pending._id },
    {
      $set: {
        resetTokenHash: sha256(resetToken),
        resetTokenExpiresAt,
        expiresAt: resetTokenExpiresAt,
        updatedAt: new Date()
      }
    }
  );

  return res.status(200).json({
    message: 'Verification successful',
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
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await connect();
  } catch (err) {
    console.error('DB connect error', err);
    return res.status(500).send('Database connection error');
  }

  const action = getAction(req);

  try {
    if (action === 'login') return await handleLogin(req, res);
    if (action === 'send-otp') return await handleSendOtp(req, res);
    if (action === 'verify-otp') return await handleVerifyOtp(req, res);
    if (action === 'request-password-reset') return await handleRequestPasswordReset(req, res);
    if (action === 'verify-password-reset-otp') return await handleVerifyPasswordResetOtp(req, res);
    if (action === 'reset-password') return await handleResetPassword(req, res);
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error(`POST /api/users/${action} error`, err);
    return res.status(500).send('Request failed');
  }
}