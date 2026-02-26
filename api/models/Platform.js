import mongoose from 'mongoose';

const PlatformSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  generation: { type: String },
});

const Platform = mongoose.models.Platform || mongoose.model('Platform', PlatformSchema, 'Platforms');
export default Platform;
