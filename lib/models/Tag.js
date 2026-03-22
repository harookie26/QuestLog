import mongoose from 'mongoose';

const TagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

TagSchema.index({ name: 'text' });

const Tag = mongoose.models.Tag || mongoose.model('Tag', TagSchema, 'Tags');
export default Tag;