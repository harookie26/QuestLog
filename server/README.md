# Server (Express + Mongoose)

Quick setup for the backend that provides `/api/threads` CRUD endpoints.

1) Create a `.env` file in `server/` (do NOT commit it). Example keys are in `.env.example`.

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/mydb?retryWrites=true&w=majority
PORT=5000
```

2) Install and run (you may already have installed deps):

```bash
cd server
npm install
npm run dev   # runs nodemon src/index.js
```

3) Frontend (Vite) is configured to proxy `/api` to `http://localhost:5000`.

4) Example fetch usage from your React app:

```ts
// POST new thread
await fetch('/api/threads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Hello', body: 'First post', author: 'me' })
});

// GET threads
const res = await fetch('/api/threads');
const threads = await res.json();
```

5) Security & deployment notes
- Add `server/.env` to `.gitignore` (already done).
- Use environment variables in your hosting provider (Render/Heroku/Render/Vercel serverless, etc.).
- Don't expose Atlas with an open IP whitelist in production.
