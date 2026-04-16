# QuestLog

QuestLog is a full-stack discussion platform for games, platforms, and community threads.

Production is deployed as a single Vercel project:
[https://questlog-test.vercel.app/](https://questlog-test.vercel.app/)

## Overview

The repository contains:

- A Vite + React + TypeScript frontend in `/src`
- Serverless API routes in `/api` (deployed on Vercel)
- Shared backend utilities and models in `/lib`
- A legacy Express server in `/server` for local compatibility only

## Architecture

### Production Architecture

- Frontend is built by Vite and served by Vercel
- API is served by Vercel Serverless Functions under `/api`
- Data is stored in MongoDB via `MONGODB_URI`

### API Routing Flow

1. Client requests `/api/...`
2. `vercel.json` rewrites to `/api/dispatch`
3. `api/dispatch.js` resolves the target route module
4. Route handlers execute business logic and DB operations through `/lib`

### Local Architecture

- Frontend dev server runs on port `5173` (Vite)
- Vite proxies `/api/*` to `http://localhost:3000`
- Optional legacy backend (`/server`) can be run locally

## Local Development

### Prerequisites

- Node.js 18+
- npm
- MongoDB connection string (for full-stack local mode)

### Option A: Frontend-Only (Fastest)

Use this when working only on UI behavior.

```bash
npm install
npm run dev
```

Optional build verification:

```bash
npm run build
npm run preview
```

Notes:

- In frontend-only mode, API calls to `/api/*` require a backend target
- If no backend is running on port `3000`, API requests from the UI will fail

### Option B: Full-Stack Local (Legacy Compatibility Path)

The `/server` folder is legacy and should not be used for production deployment.
It remains available for local compatibility/testing.

1. Install backend dependencies:

```bash
cd server
npm install
```

2. Create `server/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
PORT=3000
```

3. Optional: seed local data:

```bash
npm run seed
```

4. Start legacy backend:

```bash
npm run dev
```

5. In a second terminal (repository root), run frontend:

```bash
npm install
npm run dev
```

## Scripts

### Root (`package.json`)

- `npm run dev` - Start Vite dev server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview built frontend locally

### Legacy Server (`server/package.json`)

- `npm run dev` - Start legacy Express server with nodemon
- `npm run start` - Start legacy Express server
- `npm run seed` - Seed sample data

## Environment Variables

| Variable                               | Required          | Context                           | Default                                          | Purpose                                                         |
| -------------------------------------- | ----------------- | --------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| `MONGODB_URI`                          | Yes               | Serverless API + legacy `/server` | None                                             | MongoDB connection string                                       |
| `NODE_ENV`                             | Yes               | Local + production                | Runtime-defined                                  | Controls secure-cookie behavior (`production` enables `Secure`) |
| `JWT_SECRET`                           | Yes (production)  | Serverless API + auth             | Falls back to `SESSION_SECRET`; then dev default | JWT signing secret for session cookies                          |
| `SESSION_SECRET`                       | Optional fallback | Serverless API + auth             | None                                             | Backward-compatible fallback secret                             |
| `SESSION_COOKIE_NAME`                  | No                | Serverless API + auth             | `questlog_session`                               | Session cookie name                                             |
| `SESSION_TOKEN_TTL_SECONDS`            | No                | Serverless API + auth             | `28800` (8h)                                     | Non-persistent session TTL                                      |
| `SESSION_PERSISTENT_TOKEN_TTL_SECONDS` | No                | Serverless API + auth             | `2592000` (30d)                                  | Keep-signed-in session TTL                                      |
| `CORS_ORIGIN`                          | No                | Users auth action routes          | Request origin or `*`                            | CORS origin override                                            |
| `PORT`                                 | No                | Legacy `/server` only             | `5000`                                           | Express listening port (set to `3000` to match Vite proxy)      |

### Recommended Production Baseline

- Set a strong `JWT_SECRET`
- Set `MONGODB_URI` to production database
- Keep `NODE_ENV=production`

## Authentication and Sessions

QuestLog uses signed JWT session cookies.

### Session Behavior

- Cookie is `HttpOnly` and `SameSite=Lax`
- Cookie is `Secure` only when `NODE_ENV=production`
- `keepSignedIn=true` issues a persistent cookie
- `keepSignedIn=false` issues a non-persistent session cookie

### Core Auth Endpoints

- `POST /api/users/login`
- `GET /api/users/me`
- `POST /api/users/logout`
- `POST /api/users/signup`
- `POST /api/users/request-password-reset`
- `POST /api/users/reset-password`

Password reset sessions currently use a short-lived token window (`10` minutes).

## API Summary

This section is intentionally high-level. For implementation details, inspect route handlers in `/api`.

### Users

- `POST /api/users/login|signup|request-password-reset|reset-password|logout`
- `GET /api/users/me`
- `GET|PUT|DELETE /api/users/profile`
- `POST /api/users/interaction`

### Threads and Messages

- `GET|POST /api/threads`
- `GET|PUT|DELETE /api/threads/:id`
- `GET|POST|PUT|DELETE /api/threads/:id/messages`

### Catalog Data

- `GET|POST /api/games`
- `GET /api/platforms`
- `GET|POST /api/tags`

## Authorization Model (Current Behavior)

- Creating threads/messages requires authentication
- Editing a thread requires thread owner identity
- Deleting a thread requires `Administrator`
- Editing a message requires message owner identity
- Deleting a message allows owner, `Moderator`, or `Administrator`
- Profile update/delete requires self or admin permissions

## Security Considerations

1. `JWT_SECRET` must be set in production.
2. `lib/auth/session.js` includes a development fallback secret (`dev-only-insecure-secret-change-me`) when no secret is configured. This is unsafe for production.
3. Cookies are `HttpOnly`, which protects against JavaScript token reads, but CSRF strategy should still be considered for state-changing routes.
4. Apply standard production controls at platform level (rate limits, monitoring, log review, and abuse detection).

## Deployment (Vercel)

### First-Time Setup

1. Import this repository into Vercel
2. Configure required environment variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`)
3. Deploy

### Ongoing Deployment

1. Push to `main`
2. Vercel builds frontend and deploys API functions from `/api`
3. Verify runtime behavior in Vercel logs

## Repository Structure

```text
src/                  Frontend app (React + TypeScript)
api/                  Vercel serverless route handlers
lib/                  Shared DB/auth/model code used by API handlers
server/               Legacy Express backend for local compatibility only
```

## Troubleshooting

### MongoDB Connection Errors

- Confirm `MONGODB_URI` is present and valid
- Confirm Atlas/network access rules allow your environment
- Verify the function/server process can reach MongoDB

### Frontend Cannot Reach API Locally

- Confirm frontend runs on `http://localhost:5173`
- Confirm backend target is running on `http://localhost:3000`
- Confirm `vite.config.ts` proxy points to `http://localhost:3000`
- If using legacy server defaults (`5000`), set `PORT=3000` in `server/.env`

### Auth Issues in Production

- Confirm `JWT_SECRET` is set
- Confirm `NODE_ENV=production`
- Confirm cookies are not blocked by domain/protocol mismatch
- Inspect Vercel function logs for route-level failures
