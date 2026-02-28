import { connect } from '../../lib/db.js';
import Thread from '../../lib/models/Thread.js';

export default async function handler(req, res) {
  try {
    await connect();
  } catch (err) {
    console.error('DB connect error', err);
    return res.status(500).send('Database connection error');
  }
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
  if (req.method === 'PUT') {
    try {
      const updated = await Thread.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).send('Not found');
      return res.status(200).json(updated);
    } catch (err) {
      console.error('PUT /api/threads/:id error', err);
      return res.status(500).send('Failed to update thread');
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Thread.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (err) {
      console.error('DELETE /api/threads/:id error', err);
      return res.status(500).send('Failed to delete thread');
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
