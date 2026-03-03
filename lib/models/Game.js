import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

GameSchema.index({ name: 'text' });

const Game = mongoose.models.Game || mongoose.model('Game', GameSchema, 'Games');
export default Game;
