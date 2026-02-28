import { connect } from '../../lib/db.js';
import Game from '../../lib/models/Game.js';

export default async function handler(req, res) {
  try {
    await connect();
  } catch (err) {
    console.error('DB connect error', err);
    return res.status(500).send('Database connection error');
  }

  if (req.method === 'GET') {
    try {
      const q = (req.query.q || '').toString();
      const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
      const games = await Game.find(filter).sort('name').limit(500);
      return res.status(200).json(games.map(g => ({ _id: g._id.toString(), name: g.name })));
    } catch (err) {
      console.error('GET /api/games error', err);
      return res.status(500).send('Failed to fetch games');
    }
  }

  if (req.method === 'POST') {
    try {
      const { name } = req.body || {};
      if (!name || !name.trim()) return res.status(400).send('name is required');
      const clean = name.trim();
      // try find existing
      let existing = await Game.findOne({ name: new RegExp('^' + clean + '$', 'i') });
      if (existing) return res.status(409).json({ _id: existing._id.toString(), name: existing.name, message: 'already exists' });
      const created = await Game.collection.insertOne({ name: clean, createdAt: new Date() });
      return res.status(201).json({ _id: created.insertedId.toString(), name: clean });
    } catch (err) {
      console.error('POST /api/games error', err);
      return res.status(500).send('Failed to create game');
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
