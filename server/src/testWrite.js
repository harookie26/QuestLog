require('dotenv').config();
const mongoose = require('mongoose');
const Thread = require('./models/Thread');

const MONGODB_URI = process.env.MONGODB_URI;

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: 'GDAPDEV_grp' });
    console.log('Mongoose connected');
    const t = new Thread({ title: 'test-write-script', game: 'test', platform: 'pc', body: 'test write' });
    const saved = await t.save();
    console.log('Saved document:', saved);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Write test error:', err);
    process.exitCode = 1;
  }
})();
