# Vite + React + Tailwind TSX sample

This repository is prepared as a minimal Vite + React + Tailwind project using TypeScript and TSX files.

Quick start:

```bash
npm install
npm run dev
```

Build / preview:

```bash
npm run build
npm run preview
```

Files added:
- `vite.config.ts`, `tsconfig.json`, `postcss.config.cjs`, `tailwind.config.cjs`
- `src/main.tsx`, `src/App.tsx`, `src/index.css`

## Backend (optional)

A minimal Express + Mongoose backend is scaffolded in the `server/` folder. It exposes CRUD endpoints at `/api/threads`.

Quick steps:

1. Create `server/.env` from `server/.env.example` and set `MONGODB_URI`.
2. From the project root run:

```bash
cd server
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:5000` so your frontend can call `/api/threads` directly.

## Email OTP signup

Signup now uses a 6-digit email OTP with a 10-minute expiration.

Flow:

1. Frontend calls `POST /api/users/send-otp` with signup data.
2. API stores a pending signup record with a hashed OTP and expiry.
3. User enters the code.
4. Frontend calls `POST /api/users/verify-otp` to verify and create the account.

Environment variables for email sending:

- `MONGODB_URI`
- `SMTP_HOST`
- `SMTP_PORT` (example: `587`)
- `SMTP_SECURE` (`true` or `false`)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (optional)

If SMTP is not configured and `NODE_ENV` is not `production`, the API includes `devOtp` in the response for local testing.

Production note:

- In `production`, `POST /api/users/send-otp` now returns `503` when SMTP delivery is not configured/available.
- This prevents silent signup failures where no real verification email is sent.
