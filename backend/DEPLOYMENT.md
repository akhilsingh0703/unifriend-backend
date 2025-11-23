# Deployment Guide

This guide covers deploying the UniFriend backend to various platforms.

## Prerequisites

- Node.js >= 18.0.0
- Firebase project configured
- Service account credentials
- Git repository

---

## Option 1: Firebase Functions (Recommended)

Firebase Functions provides serverless hosting with automatic scaling.

### Setup

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase Functions:**
   ```bash
   cd backend
   firebase init functions
   ```
   - Select existing project
   - Choose JavaScript
   - Install dependencies: Yes

3. **Update `functions/package.json`:**
   ```json
   {
     "name": "functions",
     "scripts": {
       "serve": "firebase emulators:start --only functions",
       "shell": "firebase functions:shell",
       "start": "npm run shell",
       "deploy": "firebase deploy --only functions",
       "logs": "firebase functions:log"
     },
     "engines": {
       "node": "18"
     },
     "main": "index.js",
     "dependencies": {
       "express": "^4.18.2",
       "cors": "^2.8.5",
       "firebase-admin": "^12.2.0",
       "firebase-functions": "^4.5.0"
     }
   }
   ```

4. **Create `functions/index.js`:**
   ```javascript
   const functions = require('firebase-functions');
   const admin = require('firebase-admin');
   admin.initializeApp();
   
   // Import your Express app
   const app = require('./app');
   
   exports.api = functions.https.onRequest(app);
   ```

5. **Create `functions/app.js`:**
   - Copy your `backend/index.js` content
   - Remove the `app.listen()` part
   - Export the app: `module.exports = app;`

6. **Set Environment Variables:**
   ```bash
   firebase functions:config:set \
     firebase.project_id="your-project-id" \
     firebase.client_email="your-service-account@project.iam.gserviceaccount.com"
   
   # For private key, use secrets (Firebase Functions v2)
   firebase functions:secrets:set FIREBASE_PRIVATE_KEY
   ```

7. **Deploy:**
   ```bash
   firebase deploy --only functions
   ```

8. **Access your API:**
   ```
   https://us-central1-your-project.cloudfunctions.net/api
   ```

### Environment Variables in Firebase Functions

For Firebase Functions v2, use secrets:
```bash
firebase functions:secrets:set FIREBASE_PRIVATE_KEY
# Paste your private key when prompted
```

Access in code:
```javascript
const functions = require('firebase-functions/v2');
const { defineSecret } = require('firebase-functions/params');

const privateKey = defineSecret('FIREBASE_PRIVATE_KEY');
```

---

## Option 2: Google Cloud Run

Cloud Run provides containerized hosting with auto-scaling.

### Setup

1. **Create `Dockerfile`:**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   EXPOSE 3000
   
   CMD ["node", "index.js"]
   ```

2. **Create `.dockerignore`:**
   ```
   node_modules
   .env
   .git
   *.log
   ```

3. **Build and Deploy:**
   ```bash
   # Set project
   gcloud config set project your-project-id
   
   # Build image
   gcloud builds submit --tag gcr.io/your-project-id/unifriend-backend
   
   # Deploy to Cloud Run
   gcloud run deploy unifriend-backend \
     --image gcr.io/your-project-id/unifriend-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars "PORT=3000,NODE_ENV=production" \
     --set-secrets "FIREBASE_PRIVATE_KEY=firebase-private-key:latest"
   ```

4. **Set Secrets:**
   ```bash
   echo -n "your-private-key" | gcloud secrets create firebase-private-key --data-file=-
   ```

---

## Option 3: Railway

Railway provides simple deployment with automatic HTTPS.

### Setup

1. **Connect Repository:**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub repo

2. **Configure Environment Variables:**
   - Add all variables from `.env.example`
   - Railway automatically provides `PORT`

3. **Deploy:**
   - Railway auto-deploys on git push
   - Get your URL from Railway dashboard

---

## Option 4: Render

Render provides easy deployment with free tier.

### Setup

1. **Create `render.yaml`:**
   ```yaml
   services:
     - type: web
       name: unifriend-backend
       env: node
       buildCommand: npm install
       startCommand: node index.js
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 3000
   ```

2. **Deploy:**
   - Connect GitHub repo
   - Render auto-detects Node.js
   - Add environment variables in dashboard
   - Deploy

---

## Option 5: Heroku

### Setup

1. **Create `Procfile`:**
   ```
   web: node index.js
   ```

2. **Deploy:**
   ```bash
   heroku create unifriend-backend
   heroku config:set NODE_ENV=production
   heroku config:set FIREBASE_PROJECT_ID=your-project-id
   # Add all other env vars
   git push heroku main
   ```

---

## Environment Variables

Set these in your deployment platform:

### Required
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `JWT_SECRET`
- `PORT` (usually auto-set by platform)
- `NODE_ENV=production`

### Optional
- `CORS_ORIGIN` (your frontend URL)
- `FIREBASE_AUTH_URI`
- `FIREBASE_TOKEN_URI`

---

## Post-Deployment

### 1. Update CORS Origin

Update `CORS_ORIGIN` to your frontend URL:
```bash
# Example
CORS_ORIGIN=https://your-frontend.vercel.app
```

### 2. Test Health Endpoint

```bash
curl https://your-api-url.com/health
```

### 3. Update Frontend

Update your frontend API base URL:
```javascript
const API_BASE_URL = 'https://your-api-url.com/api';
```

### 4. Monitor Logs

```bash
# Firebase Functions
firebase functions:log

# Cloud Run
gcloud run services logs read unifriend-backend

# Railway
railway logs

# Render
# View in dashboard
```

---

## Security Checklist

- [ ] Environment variables set (never commit `.env`)
- [ ] CORS origin configured correctly
- [ ] Rate limiting enabled
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Firebase security rules updated
- [ ] Service account has minimal required permissions
- [ ] JWT secret is strong and unique
- [ ] Error messages don't expose sensitive info in production

---

## Scaling Considerations

### Firebase Functions
- Automatic scaling
- Pay per invocation
- Cold start latency possible

### Cloud Run
- Auto-scales to 0 when idle
- Pay per request
- Better for consistent traffic

### Railway/Render
- Fixed pricing tiers
- Good for small-medium traffic
- Easy to use

---

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Check `CORS_ORIGIN` matches frontend URL exactly
   - Include protocol (https://)

2. **Firebase Admin Errors:**
   - Verify service account credentials
   - Check private key format (newlines)

3. **Port Issues:**
   - Use `process.env.PORT` (platforms set this)
   - Don't hardcode port

4. **Timeout Errors:**
   - Increase function timeout (Firebase Functions)
   - Check request size limits

---

## Monitoring

### Recommended Tools

- **Firebase Console**: Function logs and metrics
- **Google Cloud Console**: Cloud Run metrics
- **Sentry**: Error tracking
- **LogRocket**: Request logging

### Health Check Endpoint

Monitor: `GET /health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

---

## CI/CD

### GitHub Actions Example

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
      - run: gcloud run deploy unifriend-backend --image gcr.io/...
```

---

## Rollback

### Firebase Functions
```bash
firebase functions:rollback
```

### Cloud Run
```bash
gcloud run services update-traffic unifriend-backend --to-revisions REVISION=100
```

### Railway/Render
- Use dashboard to rollback to previous deployment

