export default function handler(req, res) {
  const hasMongo = Boolean(process.env.MONGODB_URI);
  const len = process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0;
  return res.status(200).json({ hasMongoEnv: hasMongo, mongoUriLength: len });
}
