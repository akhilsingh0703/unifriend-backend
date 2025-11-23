# Quick Start Guide

Get your UniFriend backend up and running in 5 minutes!

## Prerequisites

- Node.js >= 18.0.0
- Firebase project with Firestore enabled
- Firebase service account credentials

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file (you'll need the values)

## Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
JWT_SECRET=your-random-secret-key-here
PORT=3000
CORS_ORIGIN=http://localhost:9002
NODE_ENV=development
```

**Important:** 
- Replace `\n` in the private key with actual newlines, or keep it as `\n` (the code handles it)
- Use a strong random string for `JWT_SECRET`

## Step 4: Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

You should see:
```
✅ Firebase Admin SDK initialized successfully
🚀 UniFriend Backend API running on port 3000
📝 Environment: development
🔗 Health check: http://localhost:3000/health
```

## Step 5: Test the API

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### Get Universities (Public)

```bash
curl http://localhost:3000/api/universities
```

### Test with Authentication

1. Get a Firebase ID token from your frontend:
   ```javascript
   const auth = getAuth();
   const token = await auth.currentUser.getIdToken();
   ```

2. Use it in API calls:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:3000/api/auth/me
   ```

## Step 6: Update Frontend

See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) for detailed instructions.

Quick setup:
1. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

2. Update your API calls to use the backend instead of direct Firestore

## Common Issues

### Firebase Admin Not Initialized

**Error:** `Missing required Firebase Admin configuration`

**Solution:** Check your `.env` file has all required Firebase credentials.

### CORS Errors

**Error:** `Access to fetch at 'http://localhost:3000/api' from origin 'http://localhost:9002' has been blocked by CORS policy`

**Solution:** Make sure `CORS_ORIGIN` in `.env` matches your frontend URL exactly (including protocol and port).

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:** 
- Change `PORT` in `.env` to a different port (e.g., `3001`)
- Or stop the process using port 3000

### Invalid Token

**Error:** `Invalid or expired token`

**Solution:** 
- Make sure user is logged in
- Token might be expired, refresh it
- Check Firebase project ID matches

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [API_EXAMPLES.md](./API_EXAMPLES.md) for API usage examples
- See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for database structure
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

## Need Help?

- Check the logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure Firebase project has Firestore enabled
- Make sure service account has proper permissions

Happy coding! 🚀

