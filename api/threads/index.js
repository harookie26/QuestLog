import { connect } from '../../api/db.js';
import Thread from '../../api/models/Thread.js';

export default async function handler(req, res) {
  try {
    await connect();
  } catch (err) {
    console.error('DB connect error', err);
    return res.status(500).send('Database connection error');
  }

  if (req.method === 'GET') {
    try {
      const threads = await Thread.find().sort('-createdAt');
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
