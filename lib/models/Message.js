import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
  body: { type: String, required: true },
  author: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema, 'ThreadMessages');
export default Message;
