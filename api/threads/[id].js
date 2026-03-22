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
    if (typeof item !== 'string') continue;
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
    } catch (err) {
      console.error('PUT /api/threads/:id error', err);
      return res.status(500).send('Failed to update thread');
    }
  }

  if (req.method === 'DELETE') {
    try {
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
    } catch (err) {
      console.error('DELETE /api/threads/:id error', err);
      return res.status(500).send('Failed to delete thread');
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
