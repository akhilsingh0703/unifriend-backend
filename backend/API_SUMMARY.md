# API Summary - How Frontend Should Call Each API

This document provides a quick reference for how the frontend should call each backend API endpoint.

## Base Configuration

```typescript
// Add to .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api

// In your API utility file
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

## Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```typescript
const auth = getAuth();
const token = await auth.currentUser.getIdToken();

fetch(`${API_BASE_URL}/endpoint`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Public Endpoints (No Auth Required)

### 1. Get All Universities
```typescript
GET /api/universities?location=Mumbai&type=Public&minRating=4&limit=20&offset=0

// Frontend call
const response = await fetch(`${API_BASE_URL}/universities?location=Mumbai&limit=20`);
const data = await response.json();
// Returns: { universities: [...], total: number, limit: number, offset: number }
```

### 2. Get University by ID
```typescript
GET /api/universities/:id

// Frontend call
const response = await fetch(`${API_BASE_URL}/universities/${universityId}`);
const university = await response.json();
```

### 3. Create Registration
```typescript
POST /api/registrations
Body: { fullName, email, mobileNumber, city, courseInterestedIn, onlineDistance }

// Frontend call
await fetch(`${API_BASE_URL}/registrations`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'John Doe',
    email: 'john@example.com',
    mobileNumber: '+1234567890',
    city: 'Mumbai',
    courseInterestedIn: 'B.Tech',
    onlineDistance: false
  })
});
```

### 4. Subscribe to Newsletter
```typescript
POST /api/newsletter/subscribe
Body: { email, mobileNumber?, course? }

// Frontend call
await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'subscriber@example.com',
    mobileNumber: '+1234567890',
    course: 'B.Tech'
  })
});
```

### 5. Verify Token
```typescript
POST /api/auth/verify
Body: { token }

// Frontend call
const token = await auth.currentUser.getIdToken();
const response = await fetch(`${API_BASE_URL}/auth/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
});
const userInfo = await response.json();
```

---

## Protected Endpoints (Auth Required)

### 6. Get Current User Info
```typescript
GET /api/auth/me
Headers: Authorization: Bearer <token>

// Frontend call
const token = await auth.currentUser.getIdToken();
const response = await fetch(`${API_BASE_URL}/auth/me`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const user = await response.json();
```

### 7. Get User's Applications
```typescript
GET /api/applications
Headers: Authorization: Bearer <token>

// Frontend call
const token = await auth.currentUser.getIdToken();
const response = await fetch(`${API_BASE_URL}/applications`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
// Returns: { applications: [...] }
```

### 8. Create Application
```typescript
POST /api/applications
Headers: Authorization: Bearer <token>
Body: { universityId, universityName, courseName, tradeName?, studentName, email, phone?, city?, message? }

// Frontend call
const token = await auth.currentUser.getIdToken();
await fetch(`${API_BASE_URL}/applications`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    universityId: 'uni123',
    universityName: 'Mumbai University',
    courseName: 'B.Tech',
    tradeName: 'Computer Science',
    studentName: user.displayName,
    email: user.email,
    phone: '+1234567890',
    city: 'Mumbai',
    message: 'I am interested...'
  })
});
```

### 9. Get Application by ID
```typescript
GET /api/applications/:id
Headers: Authorization: Bearer <token>

// Frontend call
const token = await auth.currentUser.getIdToken();
const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const application = await response.json();
```

### 10. Update Application Status (University Admin/Admin)
```typescript
PUT /api/applications/:id/status
Headers: Authorization: Bearer <token>
Body: { status: 'Pending' | 'In Review' | 'Reviewed' | 'Approved' | 'Rejected' }

// Frontend call
const token = await auth.currentUser.getIdToken();
await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ status: 'Approved' })
});
```

### 11. Get University Applications (University Admin/Admin)
```typescript
GET /api/applications/university/:universityId
Headers: Authorization: Bearer <token>

// Frontend call
const token = await auth.currentUser.getIdToken();
const response = await fetch(`${API_BASE_URL}/applications/university/${universityId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
// Returns: { applications: [...], total: number }
```

### 12. Get Current User Profile
```typescript
GET /api/users/me
Headers: Authorization: Bearer <token>

// Frontend call
const token = await auth.currentUser.getIdToken();
const response = await fetch(`${API_BASE_URL}/users/me`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const profile = await response.json();
```

### 13. Update User Profile
```typescript
PUT /api/users/:userId
Headers: Authorization: Bearer <token>
Body: { fullName?, phone?, dateOfBirth?, savedUniversityIds? }

// Frontend call
const token = await auth.currentUser.getIdToken();
await fetch(`${API_BASE_URL}/users/${userId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullName: 'John Doe Updated',
    phone: '+1234567890'
  })
});
```

---

## Admin Only Endpoints

### 14. Create University (Admin)
```typescript
POST /api/universities
Headers: Authorization: Bearer <admin-token>
Body: { name, address, location, established_year, naac_grade, type, about, courses, ... }

// Frontend call
const token = await auth.currentUser.getIdToken();
await fetch(`${API_BASE_URL}/universities`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(universityData)
});
```

### 15. Update University (Admin/University Admin)
```typescript
PUT /api/universities/:id
Headers: Authorization: Bearer <token>
Body: { rating?, about?, ... }

// Frontend call
const token = await auth.currentUser.getIdToken();
await fetch(`${API_BASE_URL}/universities/${universityId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ rating: 4.8 })
});
```

### 16. Delete University (Admin)
```typescript
DELETE /api/universities/:id
Headers: Authorization: Bearer <admin-token>

// Frontend call
const token = await auth.currentUser.getIdToken();
await fetch(`${API_BASE_URL}/universities/${universityId}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 17. Grant Admin Role (Admin)
```typescript
POST /api/admin/roles/admin
Headers: Authorization: Bearer <admin-token>
Body: { userId }

// Frontend call
const token = await auth.currentUser.getIdToken();
await fetch(`${API_BASE_URL}/admin/roles/admin`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ userId: 'user123' })
});
```

### 18. Grant University Admin Role (Admin)
```typescript
POST /api/admin/roles/university
Headers: Authorization: Bearer <admin-token>
Body: { userId, universityId }

// Frontend call
const token = await auth.currentUser.getIdToken();
await fetch(`${API_BASE_URL}/admin/roles/university`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ userId: 'user123', universityId: 'uni123' })
});
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Example error handling:

```typescript
try {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  // Show error to user
  toast.error(error.message);
}
```

---

## React Hook Example

```typescript
// hooks/use-api.ts
import { useState, useCallback } from 'react';
import { getAuth } from 'firebase/auth';

export function useApiCall<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }
      
      const result = await response.json();
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, call };
}
```

**Usage:**
```typescript
const { data, loading, error, call } = useApiCall();

useEffect(() => {
  call('/universities?limit=20');
}, [call]);
```

---

## Complete Integration Example

See [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) for a complete integration guide with utility functions and service layer.

