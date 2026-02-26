const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Message = require('../models/Message');

router.get('/', async (req, res) => {
  try {
    const threads = await Thread.find().sort('-createdAt');
    res.json(threads);
  } catch (err) {
    console.error('GET /api/threads error', err);
    res.status(500).send('Failed to fetch threads');
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('POST /api/threads payload:', req.body);
    // basic validation
    if (!req.body || !req.body.title) return res.status(400).send('title is required');
    // Insert a single document directly into the underlying collection
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
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/threads error', err);
    // Surface some permission-like errors that might come from middleware or external services
    if (err && err.name === 'MongoError' && err.code === 13) {
      // 13 is MongoDB 'Unauthorized' in some contexts
      return res.status(403).send('Database permission denied');
    }
    res.status(500).send('Failed to create thread');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const t = await Thread.findById(req.params.id);
    if (!t) return res.status(404).send('Not found');
    res.json(t);
  } catch (err) {
    console.error('GET /api/threads/:id error', err);
    res.status(500).send('Failed to fetch thread');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const t = await Thread.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) return res.status(404).send('Not found');
    res.json(t);
  } catch (err) {
    console.error('PUT /api/threads/:id error', err);
    res.status(500).send('Failed to update thread');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Thread.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('DELETE /api/threads/:id error', err);
    res.status(500).send('Failed to delete thread');
  }
});

// Messages for a thread
router.get('/:id/messages', async (req, res) => {
  try {
    const msgs = await Message.find({ thread: req.params.id }).sort('createdAt');
    res.json(msgs);
  } catch (err) {
    console.error('GET /api/threads/:id/messages error', err);
    res.status(500).send('Failed to fetch messages');
  }
});

router.post('/:id/messages', async (req, res) => {
  try {
    console.log('POST /api/threads/:id/messages payload:', req.params.id, req.body)
    if (!req.body || !req.body.body) return res.status(400).send('body is required');
    const doc = {
      thread: req.params.id,
      body: req.body.body,
      author: req.body.author || null,
      createdAt: new Date()
    };
    // Use Mongoose model create so types are cast (thread -> ObjectId) and middleware/schema apply
    const createdDoc = await Message.create(doc);
    console.log('Created message _id:', createdDoc._id)
    // return a plain object similar to previous behavior
    const created = { _id: createdDoc._id.toString(), thread: createdDoc.thread.toString(), body: createdDoc.body, author: createdDoc.author || null, createdAt: createdDoc.createdAt };
    res.status(201).json(created);
  } catch (err) {
    console.error('POST /api/threads/:id/messages error', err);
    res.status(500).send('Failed to create message');
  }
});

module.exports = router;
