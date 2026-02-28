import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connect } from '../../lib/db.js';
import User from '../../lib/models/User.js';
import PendingPasswordReset from '../../lib/models/PendingPasswordReset.js';

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
  } catch (err) {
    console.error('POST /api/users/reset-password error', err);
    return res.status(500).send('Failed to reset password');
  }
}
