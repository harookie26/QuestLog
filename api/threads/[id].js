import { connect } from '../../api/db.js';
import Thread from '../../api/models/Thread.js';

export default async function handler(req, res) {
  await connect();
  const { id } = req.query || req.params || {};
  if (!id) return res.status(400).json({ error: 'Missing id' });

  if (req.method === 'GET') {
    try {
      const thread = await Thread.findById(id).lean();
      if (!thread) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(thread);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
