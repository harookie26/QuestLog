import mongoose from 'mongoose';

const PendingPasswordResetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  resetTokenHash: { type: String },
  resetTokenExpiresAt: { type: Date },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PendingPasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingPasswordReset =
  mongoose.models.PendingPasswordReset ||
  mongoose.model('PendingPasswordReset', PendingPasswordResetSchema, 'PendingPasswordResets');

export default PendingPasswordReset;
