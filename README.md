# Local Development

## Frontend Only (No Backend)

```bash
npm install
npm run build
npm run dev
```

**Note:** `/server` is deprecated. Local builds run without database access for frontend-only testing.

## Full Stack Local Setup

To run with a working backend and database in development:

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas connection string)

### Backend Setup

1. Navigate to the server directory:

```bash
cd server
npm install
```

2. Create a `.env` file in the `/server` directory with:

```
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

3. (Optional) Seed the database:

```bash
npm run seed
```

4. Start the backend server:

```bash
npm run dev
```

### Frontend Setup

In a new terminal, from the root directory:

```bash
npm install
npm run dev
```

The frontend (Vite on port 5173) proxies `/api/*` calls to the local backend on port 3000.

**Important:** `/server` is deprecated for production deployment. Keep it only for local development and migration support.

# Deployment

## Full-Stack Deployment (Vercel)

Production uses a single Vercel project for both frontend and backend.

Current deployment: [QuestLog](https://questlog-test.vercel.app/)

### Production Architecture

- Frontend: Vite/React static app served by Vercel
- Backend API: Vercel Serverless Functions in `/api`
- Database: MongoDB via `MONGODB_URI`

You do not need a separate backend host for this project.

### API Routing Flow

1. Client calls `/api/...`
2. `vercel.json` rewrites `/api/:path*` to `/api/dispatch`
3. `api/dispatch.js` resolves and forwards to route handlers under `/api/*`
4. Route handlers read/write MongoDB using shared backend utilities

### Deploy to Production

1. Push changes to the `main` branch on GitHub
2. Vercel automatically runs the frontend build and deploys API functions from `/api`
3. Set production environment variables in the Vercel dashboard

### First-Time Vercel Setup

1. Import the GitHub repository into Vercel
2. Add production environment variables (see below)
3. Deploy

### Environment Variables Reference

Use these variables in production (Vercel) and local development as applicable.

| Variable                               | Required               | Description                                                            |
| -------------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `MONGODB_URI`                          | Yes                    | MongoDB connection string                                              |
| `NODE_ENV`                             | Yes                    | `development` or `production`                                          |
| `JWT_SECRET` (or `SESSION_SECRET`)     | Yes (production)       | Secret used to sign/verify session JWT cookies                         |
| `SESSION_COOKIE_NAME`                  | No                     | Cookie name for auth session (default: `questlog_session`)             |
| `SESSION_TOKEN_TTL_SECONDS`            | No                     | Session token TTL for non-persistent login (default: 8 hours)          |
| `SESSION_PERSISTENT_TOKEN_TTL_SECONDS` | No                     | Session token TTL for keep-signed-in login (default: 30 days)          |
| `PORT`                                 | No (local server only) | Express local server port (default: `5000`, set `3000` for Vite proxy) |

### Environment by Context

- Local full stack (`/server/.env`): `MONGODB_URI`, `NODE_ENV=development`, `PORT=3000`
- Vercel production: `MONGODB_URI`, `NODE_ENV=production`, `JWT_SECRET` (required)

### Session Security Notes

- Do not deploy with the development fallback secret in `lib/auth/session.js`.
- In production, set a strong `JWT_SECRET` (or `SESSION_SECRET`) in your hosting environment.
- Auth uses an `HttpOnly` cookie, so the browser cannot read token contents from JavaScript.

## Authentication flow

This project now uses JWT-based session cookies for authentication.

### Auth Endpoints

- `POST /api/users/login`
  - Validates credentials.
  - Sets an `HttpOnly` session cookie.
  - Accepts `keepSignedIn` in the request body to choose persistent vs session cookie behavior.
- `GET /api/users/me`
  - Returns the authenticated user from the session cookie.
  - Returns `401` if not authenticated.
- `POST /api/users/logout`
  - Clears the session cookie.
- `POST /api/users/signup`
  - Creates a new account.
- `POST /api/users/request-password-reset`
  - Starts password reset flow and returns a reset token for the reset page flow.
- `POST /api/users/reset-password`
  - Completes password reset with the issued reset token.

### Session Behavior

- If `keepSignedIn` is `false`, login creates a session cookie (ends when browser session ends).
- If `keepSignedIn` is `true`, login creates a persistent cookie using `SESSION_PERSISTENT_TOKEN_TTL_SECONDS`.
- Frontend restores auth state via `GET /api/users/me` during app load.

### Authorization Model

- Protected write operations now derive identity from the verified session cookie.
- API routes no longer trust client-supplied `currentUser`/`author` values for authorization decisions.

# Project Structure

## Frontend (`/src`)

- React + TypeScript application using Vite
- Pages: Login, SignUp, Games, Platforms, Threads discussion
- Components: Header, Footer, authentication handlers
- Auth flows: direct signup, password reset

## API Routes (`/api`)

- `/users` - Authentication (signup, login, password reset)
- `/games` - Game listing and management
- `/platforms` - Gaming platforms
- `/tags` - Thread tags and taxonomy
- `/threads` - Discussion threads and messaging

## Database Models (`/lib/models`)

- User.js - User accounts and authentication
- Thread.js - Discussion threads
- Message.js - Thread messages
- Game.js - Game information
- Platform.js - Platform information
- PendingPasswordReset.js - Password reset tokens

# Troubleshooting

## Backend Won't Connect

- Verify `MONGODB_URI` is correct and accessible
- Check that your IP is whitelisted in MongoDB Atlas (if using cloud)

## Frontend Can't Reach Backend (Local)

- Verify backend is running on `http://localhost:3000`
- Verify frontend is running with Vite on port `5173`
- Verify `vite.config.ts` proxy for `/api` points to `http://localhost:3000`

## Frontend/API Issues in Production

- Verify Vercel environment variables are set (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`)
- Verify latest deploy includes `vercel.json` rewrite from `/api/:path*` to `/api/dispatch`
- Check Vercel function logs for route-handler errors
