import { connect } from '../../../../api/db.js';
import Message from '../../../../api/models/Message.js';
import Thread from '../../../../api/models/Thread.js';

export default async function handler(req, res) {
  await connect();
  const { id } = req.query || req.params || {};
  if (!id) return res.status(400).json({ error: 'Missing id' });

  if (req.method === 'GET') {
    try {
      const messages = await Message.find({ thread: id }).sort({ createdAt: -1 }).lean();
      return res.status(200).json(messages);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { body, author } = req.body || {};
      if (!body) return res.status(400).json({ error: 'Missing body' });
      // ensure thread exists (optional)
      const threadExists = await Thread.exists({ _id: id });
      if (!threadExists) return res.status(404).json({ error: 'Thread not found' });

      const created = await Message.create({ thread: id, body, author });
      return res.status(201).json(created);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
