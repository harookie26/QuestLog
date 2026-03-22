import { connect } from '../../../lib/db.js';
import Message from '../../../lib/models/Message.js';
import Thread from '../../../lib/models/Thread.js';
import mongoose from 'mongoose';

function normalizeUser(value) {
  return String(value || '').trim().toLowerCase();
}

function getCurrentUser(req) {
  return normalizeUser(req?.body?.currentUser || req?.query?.currentUser || '');
}

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
      const candidates = [id];
      if (mongoose.Types.ObjectId.isValid(id)) {
        candidates.push(new mongoose.Types.ObjectId(id));
      }

      const messages = await Message.find({
        $or: [
          { thread: { $in: candidates } },
          { threadId: { $in: candidates } }
        ]
      })
        .select('_id thread threadId body author createdAt')
        .sort({ createdAt: -1 })
        .lean();

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

  if (req.method === 'PUT') {
    try {
      const messageId = String(req?.query?.messageId || req?.body?.messageId || '').trim();
      if (!messageId) return res.status(400).json({ error: 'messageId is required' });

      const body = String(req?.body?.body || '').trim();
      if (!body) return res.status(400).json({ error: 'body is required' });

      const currentUser = getCurrentUser(req);
      if (!currentUser) return res.status(401).json({ error: 'currentUser is required' });

      const msg = await Message.findById(messageId).lean();
      if (!msg) return res.status(404).json({ error: 'Message not found' });

      const owner = normalizeUser(msg.author);
      if (!owner || owner !== currentUser) {
        return res.status(403).json({ error: 'Only the reply owner can edit this reply' });
      }

      const updated = await Message.findByIdAndUpdate(
        messageId,
        { body },
        { new: true }
      )
        .select('_id thread threadId body author createdAt')
        .lean();

      return res.status(200).json(updated);
    } catch (err) {
      console.error('PUT messages error', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const messageId = String(req?.query?.messageId || req?.body?.messageId || '').trim();
      if (!messageId) return res.status(400).json({ error: 'messageId is required' });

      const currentUser = getCurrentUser(req);
      if (!currentUser) return res.status(401).json({ error: 'currentUser is required' });

      const msg = await Message.findById(messageId).lean();
      if (!msg) return res.status(404).json({ error: 'Message not found' });

      const owner = normalizeUser(msg.author);
      if (!owner || owner !== currentUser) {
        return res.status(403).json({ error: 'Only the reply owner can delete this reply' });
      }

      await Message.findByIdAndDelete(messageId);
      return res.status(204).end();
    } catch (err) {
      console.error('DELETE messages error', err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
