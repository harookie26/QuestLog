import mongoose from 'mongoose';

const ThreadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  game: { type: String },
  platform: { type: String },
  body: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Thread = mongoose.models.Thread || mongoose.model('Thread', ThreadSchema, 'QuestLog');
export default Thread;
