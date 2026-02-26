require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const threadsRouter = require('./routes/threads');

const app = express();
// Basic request logging to help debug 4xx/5xx responses
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url, 'body=', req.body ? '[present]' : '[empty]');
  next();
});

// Relaxed CORS for local development; set specific origin in production
app.use(cors({ origin: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());

app.use('/api/threads', threadsRouter);

// Global error handler to ensure JSON responses and logging
app.use((err, req, res, next) => {
  console.error('Unhandled error', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(err && err.status ? err.status : 500).json({ error: err && err.message ? err.message : 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
.then(()=> {
  console.log('MongoDB connected');
  app.listen(PORT, ()=> console.log(`Server listening ${PORT}`));
})
.catch(err => {
  console.error('MongoDB connection error', err);
  process.exit(1);
});
