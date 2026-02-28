import bcrypt from 'bcryptjs';
import { connect } from '../../lib/db.js';
import User from '../../lib/models/User.js';
import PendingSignup from '../../lib/models/PendingSignup.js';

const MAX_OTP_ATTEMPTS = 5;

function toCaseInsensitiveExactRegex(value) {
  return new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

export default async function handler(req, res) {
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

  try {
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
      birthdate: userToInsert.birthdate || null,
      gender: userToInsert.gender || null,
      createdAt: userToInsert.createdAt
    });
  } catch (err) {
    console.error('POST /api/users/verify-otp error', err);
    return res.status(500).send('Failed to verify code');
  }
}
