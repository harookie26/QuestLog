import { connect } from '../../../../api/db.js';
import Message from '../../../../api/models/Message.js';
import Thread from '../../../../api/models/Thread.js';
import mongoose from 'mongoose';

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
      let messages = await Message.find({ thread: id }).sort({ createdAt: -1 }).lean();
      if (!messages || messages.length === 0) {
        // try casting id to ObjectId
        try {
          const oid = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
          if (oid) messages = await Message.find({ thread: oid }).sort({ createdAt: -1 }).lean();
        } catch (e) {
          // ignore
        }
      }
      if (!messages || messages.length === 0) {
        // try alternate field names some existing data uses
        messages = await Message.find({ threadId: id }).sort({ createdAt: -1 }).lean();
        if ((!messages || messages.length === 0) && mongoose.Types.ObjectId.isValid(id)) {
          const oid = new mongoose.Types.ObjectId(id);
          messages = await Message.find({ threadId: oid }).sort({ createdAt: -1 }).lean();
        }
      }

      console.log(`Messages query for thread=${id} returned ${messages ? messages.length : 0}`);
      return res.status(200).json(messages || []);
    } catch (err) {
      console.error('GET messages error', err);
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

      let payload = { thread: id, body, author };
      // if thread id is a valid ObjectId, store as ObjectId to match existing docs
      if (mongoose.Types.ObjectId.isValid(id)) {
        payload.thread = new mongoose.Types.ObjectId(id);
      }
      const createdDoc = await Message.create(payload);
      console.log('Created message _id:', createdDoc._id);
      const created = { _id: createdDoc._id.toString(), thread: createdDoc.thread ? createdDoc.thread.toString() : payload.thread, body: createdDoc.body, author: createdDoc.author || null, createdAt: createdDoc.createdAt };
      return res.status(201).json(created);
    } catch (err) {
      console.error('POST messages error', err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
