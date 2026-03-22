import mongoose from 'mongoose';

const ThreadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  game: { type: String },
  platform: { type: String },
  category: { type: String, enum: ['Recommendation', 'Question', 'Bug Report'] },
  tags: [{ type: String }],
  author: { type: String },
  body: { type: String },
  createdAt: { type: Date, default: Date.now }
});

ThreadSchema.index({ createdAt: -1 });
ThreadSchema.index({ title: 'text', game: 'text', category: 'text', tags: 'text' });

const Thread = mongoose.models.Thread || mongoose.model('Thread', ThreadSchema, 'QuestLog');
export default Thread;
