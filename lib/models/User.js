import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Administrator', 'Moderator', 'Member'],
    default: 'Member'
  },
  displayName: { type: String },
  name: { type: String },
  birthdate: { type: Date },
  gender: { type: String },
  address: { type: String },
  phone: { type: String },
  // simple numeric stats
  threadsJoined: { type: Number, default: 0 },
  threadsStarted: { type: Number, default: 0 },
  contributions: { type: Number, default: 0 },
  muffins: { type: Number, default: 0 },
  // interaction counters
  tagCounts: { type: Object, default: {} },
  categoryCounts: { type: Object, default: {} },
  // convenience lists
  topGames: { type: [String], default: [] },
  topThreads: { type: Array, default: [] },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema, 'Users');
export default User;
