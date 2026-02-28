import { connect } from '../db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

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
      email: user.email
    });
  } catch (err) {
    console.error('POST /api/users/login error', err);
    return res.status(500).send('Failed to log in');
  }
}
