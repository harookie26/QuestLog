import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connect } from '../../lib/db.js';
import PendingPasswordReset from '../../lib/models/PendingPasswordReset.js';

const MAX_OTP_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MS = RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000;

function toCaseInsensitiveExactRegex(value) {
  return new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
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
  } catch (err) {
    console.error('POST /api/users/verify-password-reset-otp error', err);
    return res.status(500).send('Failed to verify password reset code');
  }
}
