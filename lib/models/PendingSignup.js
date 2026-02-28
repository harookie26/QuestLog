import mongoose from 'mongoose';

const PendingSignupSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  password: { type: String, required: true },
  birthdate: { type: Date },
  gender: { type: String },
  otpHash: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true },
  failedAttempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PendingSignupSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingSignup =
  mongoose.models.PendingSignup || mongoose.model('PendingSignup', PendingSignupSchema, 'PendingSignups');

export default PendingSignup;
