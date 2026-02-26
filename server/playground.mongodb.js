// MongoDB playground for Threads
// Usage:
// 1. set environment variable MONGODB_URI (or edit the default below)
// 2. run: node server/playground.js

const mongoose = require('mongoose');
const path = require('path');

// load Thread model from server/src/models/Thread.js
const Thread = require(path.join(__dirname, 'src', 'models', 'Thread'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/questlog';

async function main() {
  console.log('Connecting to', MONGODB_URI);
  // Newer mongodb drivers ignore/forbid the legacy options `useNewUrlParser` and
  // `useUnifiedTopology`. Connect with defaults and pass options only when needed.
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // Create sample threads
  const samples = [
    { title: 'Best strategies for Elden Ring', game: 'Elden Ring', platform: 'PC', body: 'Share tips for beating Margit.' },
    { title: 'Speedrun tips', game: 'Celeste', platform: 'Switch', body: 'How to optimize wall-jumps?' },
    { title: 'Co-op mates wanted', game: 'Sea of Thieves', platform: 'Xbox', body: 'Looking for a steady duo for raids.' }
  ];

  console.log('Seeding sample threads...');
  // insertMany will not overwrite existing documents
  const inserted = await Thread.insertMany(samples);
  console.log(`Inserted ${inserted.length} threads.`);

  console.log('\nAll threads in DB:');
  const all = await Thread.find().sort({ createdAt: -1 }).lean();
  all.forEach((t, i) => {
    console.log(`\n[${i+1}] ${t.title} — ${t.game} / ${t.platform}\n${t.body}\n(id: ${t._id})`);
  });

  console.log('\nDemonstrating update: add suffix to first thread title');
  if (all.length) {
    const first = all[0];
    await Thread.updateOne({ _id: first._id }, { $set: { title: first.title + ' (updated)' } });
    const refreshed = await Thread.findById(first._id).lean();
    console.log('Updated:', refreshed.title);
  }

  console.log('\nCleaning up: removing the sample threads we created.');
  const titles = samples.map(s => s.title);
  const deleteResult = await Thread.deleteMany({ title: { $in: titles } });
  console.log(`Deleted ${deleteResult.deletedCount} sample threads.`);

  await mongoose.disconnect();
  console.log('Disconnected. Playground finished.');
}

main().catch(err => {
  console.error('Playground error:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
