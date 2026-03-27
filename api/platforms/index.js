import { connect } from '../../lib/db.js';
import Platform from '../../lib/models/Platform.js';

function toCaseInsensitiveExactRegex(value) {
  return new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

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
      const generation = (req.query.generation || '').toString().trim();
      const sort = (req.query.sort || 'asc').toString().trim().toLowerCase();
      const sortDirection = sort === 'desc' ? -1 : 1;
      const queryText = q.trim();
      const filter = queryText ? { $text: { $search: queryText } } : {};
      if (generation && generation.toLowerCase() !== 'all') {
        filter.generation = toCaseInsensitiveExactRegex(generation);
      }
      const platforms = await Platform.find(filter).select('_id name generation').sort({ name: sortDirection }).limit(500).lean();
      return res.status(200).json(platforms.map(p => ({ _id: p._id.toString(), name: p.name, generation: p.generation })));
    } catch (err) {
      console.error('GET /api/platforms error', err);
      return res.status(500).send('Failed to fetch platforms');
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
