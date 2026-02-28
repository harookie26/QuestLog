import bcrypt from 'bcryptjs';
import { connect } from '../../lib/db.js';
import User from '../../lib/models/User.js';
import PendingPasswordReset from '../../lib/models/PendingPasswordReset.js';
import { sendPasswordResetOtpEmail } from '../../lib/otpEmail.js';

const OTP_EXPIRY_MINUTES = 10;
const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;

function toCaseInsensitiveExactRegex(value) {
  return new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

function generateSixDigitOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
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

    if (!emailResult.delivered && process.env.NODE_ENV === 'production') {
      return res.status(503).send('Email delivery is not configured. Please configure SMTP settings.');
    }

    if (!emailResult.delivered && process.env.NODE_ENV !== 'production') {
      payload.devOtp = otpCode;
      payload.note = 'SMTP is not configured. Use devOtp for local testing.';
    }

    return res.status(200).json(payload);
  } catch (err) {
    console.error('POST /api/users/request-password-reset error', err);
    return res.status(500).send('Failed to send password reset code');
  }
}
