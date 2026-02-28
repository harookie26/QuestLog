import { connect } from '../../lib/db.js';
import User from '../../lib/models/User.js';
import bcrypt from 'bcryptjs';

function toCaseInsensitiveExactRegex(value) {
  return new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

export default async function handler(req, res) {
  try {
    await connect();
  } catch (err) {
    console.error('DB connect error', err);
    return res.status(500).send('Database connection error');
  }

  if (req.method === 'POST') {
    try {
      const { username, email, password, birthdate, gender } = req.body || {};

      if (!username || !String(username).trim()) return res.status(400).send('username is required');
      if (!email || !String(email).trim()) return res.status(400).send('email is required');
      if (!password || !String(password).trim()) return res.status(400).send('password is required');

      const cleanUsername = String(username).trim();
      const cleanEmail = String(email).trim().toLowerCase();

      const existingUser = await User.findOne({
        $or: [
          { username: toCaseInsensitiveExactRegex(cleanUsername) },
          { email: toCaseInsensitiveExactRegex(cleanEmail) }
        ]
      });

      if (existingUser) {
        return res.status(409).send('username or email already exists');
      }

      let parsedBirthdate;
      if (birthdate) {
        parsedBirthdate = new Date(birthdate);
        if (Number.isNaN(parsedBirthdate.getTime())) {
          return res.status(400).send('birthdate is invalid');
        }
      }

      const hashedPassword = await bcrypt.hash(String(password), 10);

      const userToInsert = {
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        birthdate: parsedBirthdate,
        gender: gender ? String(gender) : undefined,
        createdAt: new Date()
      };

      const created = await User.collection.insertOne(userToInsert);

      return res.status(201).json({
        _id: created.insertedId.toString(),
        username: cleanUsername,
        email: cleanEmail,
        birthdate: parsedBirthdate || null,
        gender: gender || null,
        createdAt: userToInsert.createdAt
      });
    } catch (err) {
      console.error('POST /api/users error', err);
      return res.status(500).send('Failed to create user');
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
