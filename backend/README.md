# UniFriend Backend API

Complete backend API for UniFriend application built with Node.js, Express, and Firebase/Firestore.

## 🚀 Features

- **Authentication**: Firebase Auth with JWT token verification
- **Role-Based Access Control**: Admin, University Admin, and Student roles
- **CRUD Operations**: Full CRUD for universities, applications, users, and more
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Firebase Integration**: Firestore database with Firebase Admin SDK

## 📁 Project Structure

```
backend/
├── config/
│   └── firebase-admin.js      # Firebase Admin SDK configuration
├── controllers/
│   ├── admin.controller.js    # Admin operations
│   ├── application.controller.js
│   ├── auth.controller.js
│   ├── newsletter.controller.js
│   ├── registration.controller.js
│   ├── university.controller.js
│   └── user.controller.js
├── middleware/
│   ├── auth.middleware.js      # Authentication & authorization
│   └── error.middleware.js
├── routes/
│   ├── admin.routes.js
│   ├── application.routes.js
│   ├── auth.routes.js
│   ├── newsletter.routes.js
│   ├── registration.routes.js
│   ├── university.routes.js
│   └── user.routes.js
├── .env.example                # Environment variables template
├── .gitignore
├── index.js                    # Main server file
├── package.json
└── README.md
```

## 🛠️ Setup

### Prerequisites

- Node.js >= 18.0.0
- Firebase project with Firestore enabled
- Firebase service account credentials

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Get Firebase Service Account credentials:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Copy the JSON content and add to `.env` file

4. **Update `.env` file:**
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   JWT_SECRET=your-secret-key
   PORT=3000
   CORS_ORIGIN=http://localhost:9002
   ```

5. **Start the server:**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected endpoints require an `Authorization` header:
```
Authorization: Bearer <firebase-id-token>
```

To get a Firebase ID token, use Firebase Auth SDK on the frontend:
```javascript
import { getAuth } from 'firebase/auth';
const token = await getAuth().currentUser.getIdToken();
```

### Endpoints

#### Authentication

- **POST** `/api/auth/verify` - Verify Firebase ID token
- **GET** `/api/auth/me` - Get current user info (requires auth)

#### Universities

- **GET** `/api/universities` - Get all universities (public)
  - Query params: `location`, `type`, `minRating`, `maxRating`, `search`, `limit`, `offset`
- **GET** `/api/universities/:id` - Get university by ID (public)
- **POST** `/api/universities` - Create university (admin only)
- **PUT** `/api/universities/:id` - Update university (admin or university admin)
- **DELETE** `/api/universities/:id` - Delete university (admin only)

#### Applications

- **GET** `/api/applications` - Get current user's applications (requires auth)
- **GET** `/api/applications/:id` - Get application by ID (requires auth)
- **POST** `/api/applications` - Create new application (requires auth)
- **PUT** `/api/applications/:id/status` - Update application status (university admin or admin)
- **GET** `/api/applications/university/:universityId` - Get university applications (university admin)

#### Users

- **GET** `/api/users/me` - Get current user profile (requires auth)
- **GET** `/api/users/:userId` - Get user profile (requires auth)
- **PUT** `/api/users/:userId` - Update user profile (requires auth, own profile or admin)

#### Registrations

- **POST** `/api/registrations` - Create registration (public)
- **GET** `/api/registrations` - Get all registrations (admin only)

#### Newsletter

- **POST** `/api/newsletter/subscribe` - Subscribe to newsletter (public)
- **GET** `/api/newsletter/subscriptions` - Get all subscriptions (admin only)

#### Admin

- **POST** `/api/admin/roles/admin` - Grant admin role (admin only)
- **DELETE** `/api/admin/roles/admin/:userId` - Revoke admin role (admin only)
- **GET** `/api/admin/roles/admin` - Get all admins (admin only)
- **POST** `/api/admin/roles/university` - Grant university admin role (admin only)
- **DELETE** `/api/admin/roles/university/:userId` - Revoke university role (admin only)
- **GET** `/api/admin/roles/university` - Get all university admins (admin only)

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Firebase Auth**: Token verification for all protected routes
- **Role-Based Access Control**: Admin, University Admin, and User roles

## 🗄️ Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed schema documentation.

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

## 📝 Example API Requests

See [API_EXAMPLES.md](./API_EXAMPLES.md) for detailed examples.

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/health
```

## 📄 License

ISC

