import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
  body: { type: String, required: true },
  author: String,
  createdAt: { type: Date, default: Date.now }
});

MessageSchema.index({ thread: 1, createdAt: -1 });

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema, 'ThreadMessages');
export default Message;
