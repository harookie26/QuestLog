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
