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

## Authentication flow

- Signup is immediate via `POST /api/users/signup`.
- Password reset starts via `POST /api/users/request-password-reset`.
- Reset completion uses `POST /api/users/reset-password` with the issued reset session token.

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
