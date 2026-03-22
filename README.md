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
- SMTP credentials (for email OTP features)

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
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@example.com
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
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
3. Deploy using your platform's CLI or Git integration
4. Update the frontend API base URL to point to your deployed backend

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NODE_ENV` | Yes | `development` or `production` |
| `SMTP_HOST` | Yes | SMTP server hostname |
| `SMTP_PORT` | Yes | SMTP server port (typically `587` or `465`) |
| `SMTP_SECURE` | Yes | `true` for SSL, `false` for TLS |
| `SMTP_USER` | Yes | Email address for authentication |
| `SMTP_PASS` | Yes | Email password or app-specific password |
| `SMTP_FROM` | No | Sender email address (defaults to `SMTP_USER`) |

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

# Project Structure

## Frontend (`/src`)
- React + TypeScript application using Vite
- Pages: Login, SignUp, Games, Platforms, Threads discussion
- Components: Header, Footer, authentication handlers
- Auth flows: Email OTP verification, password reset

## API Routes (`/api`)
- `/users` - Authentication (signup, login, OTP verification, password reset)
- `/games` - Game listing and management
- `/platforms` - Gaming platforms
- `/threads` - Discussion threads and messaging

## Database Models (`/lib/models`)
- User.js - User accounts and authentication
- Thread.js - Discussion threads
- Message.js - Thread messages
- Game.js - Game information
- Platform.js - Platform information
- PendingSignup.js - OTP signup records
- PendingPasswordReset.js - Password reset tokens

# Troubleshooting

## Backend Won't Connect
- Verify `MONGODB_URI` is correct and accessible
- Check that your IP is whitelisted in MongoDB Atlas (if using cloud)
- Ensure SMTP credentials are valid

## OTP Emails Not Sending
- Verify `SMTP_*` environment variables are set correctly
- Some email providers require app-specific passwords (Gmail, Outlook)
- Check that your hosting provider allows outbound SMTP connections
- In development without SMTP, the API returns `devOtp` in the response for testing

## Frontend Can't Reach Backend
- Verify the backend is running and accessible
- Check CORS settings on the backend
- Update frontend API URL to match your backend deployment URL
