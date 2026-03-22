import mongoose from 'mongoose';
import { connect } from '../../lib/db.js';
import Thread from '../../lib/models/Thread.js';
import Message from '../../lib/models/Message.js';
import Tag from '../../lib/models/Tag.js';

const VALID_CATEGORIES = new Set(['Recommendation', 'Question', 'Bug Report']);

function normalizeUser(value) {
  return String(value || '').trim().toLowerCase();
}

function getCurrentUser(req) {
  return normalizeUser(req?.body?.currentUser || req?.query?.currentUser || '');
}

function normalizeCategory(value) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return VALID_CATEGORIES.has(trimmed) ? trimmed : undefined;
}

function normalizeTags(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const tags = [];
  for (const item of value) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(trimmed);
  }
  return tags;
}

async function persistTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return;
  for (const tag of tags) {
    const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await Tag.findOne({ name: new RegExp(`^${escaped}$`, 'i') }).select('_id').lean();
    if (!existing) {
      await Tag.collection.insertOne({ name: tag, createdAt: new Date() });
    }
  }
}

function getSlugParts(req) {
  const raw = req?.query?.slug;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((part) => String(part));
  return [String(raw)];
}

async function handleThreadsRoot(req, res) {
  if (req.method === 'GET') {
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
        .select('_id title game category tags')
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      return res.status(200).json(threads.map((t) => ({
        _id: t._id.toString(),
        title: t.title,
        game: t.game,
        category: t.category,
        tags: Array.isArray(t.tags) ? t.tags : []
      })));
    }

    const threads = await Thread.find()
      .select('_id title game platform category tags body author createdAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean();
    return res.status(200).json(threads);
  }

  if (req.method === 'POST') {
    if (!req.body || !req.body.title) return res.status(400).send('title is required');
    const category = normalizeCategory(req.body.category);
    if (!category) return res.status(400).send('category must be one of Recommendation, Question, or Bug Report');
    const tags = normalizeTags(req.body.tags);
    const doc = {
      title: req.body.title,
      game: req.body.game,
      platform: req.body.platform,
      category,
      tags,
      body: req.body.body,
      author: req.body.author || null,
      createdAt: new Date()
    };
    await persistTags(tags);
    const result = await Thread.collection.insertOne(doc);
    const created = { _id: result.insertedId.toString(), ...doc };
    return res.status(201).json(created);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

async function handleThreadById(req, res, id) {
  if (!id) return res.status(400).json({ error: 'Missing id' });

  if (req.method === 'GET') {
    const thread = await Thread.findById(id).lean();
    if (!thread) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(thread);
  }

  if (req.method === 'PUT') {
    const thread = await Thread.findById(id).lean();
    if (!thread) return res.status(404).send('Not found');

    const currentUser = getCurrentUser(req);
    const owner = normalizeUser(thread.author);
    if (!currentUser) return res.status(401).send('currentUser is required');
    if (!owner || owner !== currentUser) return res.status(403).send('Only the thread owner can edit this thread');

    const payload = req.body || {};
    if (payload.category !== undefined && !normalizeCategory(payload.category)) {
      return res.status(400).send('category must be one of Recommendation, Question, or Bug Report');
    }

    const updates = {
      ...(typeof payload.title === 'string' ? { title: payload.title.trim() } : {}),
      ...(typeof payload.body === 'string' ? { body: payload.body.trim() } : {}),
      ...(typeof payload.game === 'string' ? { game: payload.game.trim() } : {}),
      ...(typeof payload.platform === 'string' ? { platform: payload.platform.trim() } : {}),
      ...(typeof payload.category === 'string' ? { category: normalizeCategory(payload.category) } : {}),
      ...(payload.tags !== undefined ? { tags: normalizeTags(payload.tags) } : {})
    };

    if (Object.keys(updates).length === 0) {
      return res.status(400).send('No valid fields to update');
    }

    if (updates.tags) {
      await persistTags(updates.tags);
    }

    const updated = await Thread.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).send('Not found');
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    const thread = await Thread.findById(id).lean();
    if (!thread) return res.status(404).send('Not found');

    const currentUser = getCurrentUser(req);
    const owner = normalizeUser(thread.author);
    if (!currentUser) return res.status(401).send('currentUser is required');
    if (!owner || owner !== currentUser) return res.status(403).send('Only the thread owner can delete this thread');

    await Thread.findByIdAndDelete(id);
    await Message.deleteMany({
      $or: [
        { thread: id },
        { threadId: id }
      ]
    });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

async function handleThreadMessages(req, res, id) {
  if (!id) return res.status(400).json({ error: 'Missing id' });

  if (req.method === 'GET') {
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

    return res.status(200).json(messages || []);
  }

  if (req.method === 'POST') {
    const { body, author } = req.body || {};
    if (!body) return res.status(400).json({ error: 'Missing body' });

    const threadExists = await Thread.exists({ _id: id });
    if (!threadExists) return res.status(404).json({ error: 'Thread not found' });

    const payload = { thread: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id, body, author };
    const createdDoc = await Message.create(payload);
    const created = {
      _id: createdDoc._id.toString(),
      thread: createdDoc.thread ? createdDoc.thread.toString() : payload.thread,
      body: createdDoc.body,
      author: createdDoc.author || null,
      createdAt: createdDoc.createdAt
    };
    return res.status(201).json(created);
  }

  if (req.method === 'PUT') {
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
  }

  if (req.method === 'DELETE') {
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
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default async function handler(req, res) {
  try {
    await connect();
  } catch (err) {
    console.error('DB connect error', err);
    return res.status(500).send('Database connection error');
  }

  const slug = getSlugParts(req);

  try {
    if (slug.length === 0) {
      return await handleThreadsRoot(req, res);
    }

    if (slug.length === 1) {
      return await handleThreadById(req, res, slug[0]);
    }

    if (slug.length === 2 && slug[1] === 'messages') {
      return await handleThreadMessages(req, res, slug[0]);
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('Threads route error', err);
    return res.status(500).send('Request failed');
  }
}
