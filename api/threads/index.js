import { connect } from '../../lib/db.js';
import Thread from '../../lib/models/Thread.js';

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
      const parsedLimit = Number.parseInt((req.query.limit || '').toString(), 10);
      const parsedPage = Number.parseInt((req.query.page || '').toString(), 10);
      const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 200) : 50;
      const page = Number.isFinite(parsedPage) ? Math.max(parsedPage, 1) : 1;
      const skip = (page - 1) * limit;
      const queryText = q.trim();

      if (queryText) {
        const filter = { $text: { $search: queryText } };
        const threads = await Thread.find(filter)
          .select('_id title game')
          .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();
        return res.status(200).json(threads.map(t => ({ _id: t._id.toString(), title: t.title, game: t.game })));
      }

      const threads = await Thread.find()
        .select('_id title game platform body author createdAt')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean();
      return res.status(200).json(threads);
    } catch (err) {
      console.error('GET /api/threads error', err);
      return res.status(500).send('Failed to fetch threads');
    }
  }

  if (req.method === 'POST') {
    try {
      console.log('POST /api/threads payload:', req.body);
      if (!req.body || !req.body.title) return res.status(400).send('title is required');
      const doc = {
        title: req.body.title,
        game: req.body.game,
        platform: req.body.platform,
        body: req.body.body,
        author: req.body.author || null,
        createdAt: new Date()
      };
      const result = await Thread.collection.insertOne(doc);
      const created = { _id: result.insertedId.toString(), ...doc };
      return res.status(201).json(created);
    } catch (err) {
      console.error('POST /api/threads error', err);
      if (err && err.name === 'MongoError' && err.code === 13) {
        return res.status(403).send('Database permission denied');
      }
      return res.status(500).send('Failed to create thread');
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
