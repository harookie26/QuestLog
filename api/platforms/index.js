import { connect } from '../../lib/db.js';
import Platform from '../../lib/models/Platform.js';

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
      const platforms = await Platform.find(filter).sort('name').limit(500);
      return res.status(200).json(platforms.map(p => ({ _id: p._id.toString(), name: p.name, generation: p.generation })));
    } catch (err) {
      console.error('GET /api/platforms error', err);
      return res.status(500).send('Failed to fetch platforms');
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
