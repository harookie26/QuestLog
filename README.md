# Local Development

## Frontend Only (No Backend)

```bash
npm install
npm run build
npm run dev
```

**Note:** `/server` is deprecated. Local builds run without database access for frontend-only testing.

## Full Stack Local Setup

To run with a working backend and database:

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas connection string)

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
npm install
```

2. Create a `.env.local` file in the `/server` directory with:
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
npm start
```

### Frontend Setup

In a new terminal, from the root directory:

```bash
npm install
npm run dev
```

The frontend will connect to your local backend API.

# Deployment

## Frontend Deployment (Vercel)

The frontend is automatically deployed to Vercel for production.

Current deployment: [QuestLog](https://questlog-test.vercel.app/)

### To Deploy Frontend:

1. Push changes to the `main` branch on GitHub
2. Vercel automatically builds and deploys
3. Set environment variables in Vercel dashboard if needed

## Backend/API Deployment

For production backend deployment:

### Recommended Platforms:
- **Railway** (recommended for this project)
- **Render**
- **AWS EC2/Heroku**
- **Azure App Service**

### General Deployment Steps:

1. Prepare your backend code in the `/server` directory
2. Set environment variables on your hosting platform:
   - `MONGODB_URI` - Production MongoDB Atlas connection
   - `NODE_ENV=production`
3. Deploy using your platform's CLI or Git integration
4. Update the frontend API base URL to point to your deployed backend

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NODE_ENV` | Yes | `development` or `production` |
| `JWT_SECRET` (or `SESSION_SECRET`) | Yes (production) | Secret used to sign/verify session JWT cookies |
| `SESSION_COOKIE_NAME` | No | Cookie name for auth session (default: `questlog_session`) |
| `SESSION_TOKEN_TTL_SECONDS` | No | Session token TTL for non-persistent login (default: 8 hours) |
| `SESSION_PERSISTENT_TOKEN_TTL_SECONDS` | No | Session token TTL for keep-signed-in login (default: 30 days) |
| `CORS_ORIGIN` | Recommended | Allowed origin for cross-origin API calls when needed |

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

## Frontend Can't Reach Backend
- Verify the backend is running and accessible
- Check CORS settings on the backend
- Update frontend API URL to match your backend deployment URL
