import bcrypt from 'bcryptjs';
import { connect } from '../../lib/db.js';
import User from '../../lib/models/User.js';
import PendingSignup from '../../lib/models/PendingSignup.js';
import { sendSignupOtpEmail } from '../../lib/otpEmail.js';

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

    if (!emailResult.delivered && process.env.NODE_ENV === 'production') {
      return res.status(503).send('Email delivery is not configured. Please configure SMTP settings.');
    }

    if (!emailResult.delivered && process.env.NODE_ENV !== 'production') {
      payload.devOtp = otpCode;
      payload.note = 'SMTP is not configured. Use devOtp for local testing.';
    }

    return res.status(200).json(payload);
  } catch (err) {
    console.error('POST /api/users/send-otp error', err);
    return res.status(500).send('Failed to send verification code');
  }
}
