require('dotenv').config();
const mongoose = require('mongoose');
const Thread = require('./models/Thread');

const MONGODB_URI = process.env.MONGODB_URI;

async function main(){
  if(!MONGODB_URI) throw new Error('MONGODB_URI not set in .env');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected for seeding');

  const sample = {
    title: 'Sample',
    game: 'Elden Ring',
    platform: 'PC',
    body: 'This is a sample thread.'
  };

  const doc = new Thread(sample);
  await doc.save();
  console.log('Inserted sample document:', doc._id);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
