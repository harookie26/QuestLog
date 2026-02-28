import { connect } from '../../lib/db.js';

export default async function handler(req, res) {
  try {
    await connect();
  } catch (err) {
    console.error('DB connect error', err);
    return res.status(500).send('Database connection error');
  }

  if (req.method === 'POST') {
    return res.status(410).json({
      message: 'Direct signup is disabled. Use /api/users/send-otp and /api/users/verify-otp.'
    });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
