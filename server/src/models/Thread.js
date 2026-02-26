const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  game: String,
  platform: String,
  body: String,
  author: String,
  createdAt: { type: Date, default: Date.now }
});

// Use the existing Atlas collection name 'QuestLog' so your sample data is readable
module.exports = mongoose.model('Thread', ThreadSchema, 'QuestLog');
