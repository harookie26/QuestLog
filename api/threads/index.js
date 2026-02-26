import { connect } from '../../api/db.js';
import Thread from '../../api/models/Thread.js';

export default async function handler(req, res) {
  await connect();

  if (req.method === 'GET') {
    try {
      const threads = await Thread.find().sort({ createdAt: -1 });
      return res.status(200).json(threads);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, game, platform, body } = req.body;
      const created = await Thread.create({ title, game, platform, body });
      return res.status(201).json(created);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
