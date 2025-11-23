# API Examples

This document provides example API requests for all endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

### Getting Firebase ID Token (Frontend)

```javascript
import { getAuth } from 'firebase/auth';

// After user logs in
const auth = getAuth();
const user = auth.currentUser;
const token = await user.getIdToken();
```

### Using Token in Requests

```javascript
const response = await fetch('http://localhost:3000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Authentication Endpoints

### Verify Token

```bash
POST /api/auth/verify
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "user": {
    "uid": "user123",
    "email": "student@example.com",
    "emailVerified": true,
    "name": "John Doe",
    "picture": "https://...",
    "id": "user123",
    "fullName": "John Doe"
  },
  "roles": {
    "isAdmin": false,
    "isUniversityAdmin": false,
    "universityId": null
  }
}
```

### Get Current User

```bash
GET /api/auth/me
Authorization: Bearer <token>
```

---

## University Endpoints

### Get All Universities

```bash
GET /api/universities?location=Mumbai&type=Public&minRating=4&limit=20&offset=0
```

**Response:**
```json
{
  "universities": [
    {
      "id": "uni123",
      "name": "Mumbai University",
      "address": "Mumbai, Maharashtra",
      "rating": 4.5,
      "type": "Public",
      ...
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

### Get University by ID

```bash
GET /api/universities/uni123
```

### Create University (Admin Only)

```bash
POST /api/universities
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New University",
  "address": "123 Main St, City",
  "location": "City, State",
  "established_year": 2020,
  "naac_grade": "A",
  "type": "Private",
  "about": "A great university...",
  "contact_email": "contact@university.edu",
  "contact_phone": "+1234567890",
  "courses": [
    {
      "name": "B.Tech",
      "eligibility": "12th Pass",
      "application_date": "2024-01-01 to 2024-03-31",
      "trades": [
        {
          "name": "Computer Science",
          "duration": "4 years",
          "fees": "₹50,000/year",
          "rating": 4.5,
          "reviews": 100,
          "application_date": "2024-01-01 to 2024-03-31"
        }
      ]
    }
  ]
}
```

### Update University

```bash
PUT /api/universities/uni123
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4.8,
  "about": "Updated description..."
}
```

### Delete University (Admin Only)

```bash
DELETE /api/universities/uni123
Authorization: Bearer <admin-token>
```

---

## Application Endpoints

### Get User's Applications

```bash
GET /api/applications
Authorization: Bearer <token>
```

**Response:**
```json
{
  "applications": [
    {
      "id": "app123",
      "studentId": "user123",
      "studentName": "John Doe",
      "email": "john@example.com",
      "universityId": "uni123",
      "universityName": "Mumbai University",
      "courseName": "B.Tech",
      "tradeName": "Computer Science",
      "status": "Pending",
      "submittedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Application

```bash
POST /api/applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "universityId": "uni123",
  "universityName": "Mumbai University",
  "courseName": "B.Tech",
  "tradeName": "Computer Science",
  "studentName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "city": "Mumbai",
  "message": "I am interested in applying..."
}
```

**Response:**
```json
{
  "id": "app123",
  "studentId": "user123",
  "studentName": "John Doe",
  "email": "john@example.com",
  "universityId": "uni123",
  "universityName": "Mumbai University",
  "courseName": "B.Tech",
  "tradeName": "Computer Science",
  "fees": "₹50,000/year",
  "status": "Pending",
  "submittedAt": "2024-01-15T10:30:00Z",
  "message": "Application submitted successfully."
}
```

### Update Application Status (University Admin)

```bash
PUT /api/applications/app123/status
Authorization: Bearer <university-admin-token>
Content-Type: application/json

{
  "status": "Approved"
}
```

### Get University Applications (University Admin)

```bash
GET /api/applications/university/uni123
Authorization: Bearer <university-admin-token>
```

---

## User Endpoints

### Get Current User Profile

```bash
GET /api/users/me
Authorization: Bearer <token>
```

### Get User Profile by ID

```bash
GET /api/users/user123
Authorization: Bearer <token>
```

### Update User Profile

```bash
PUT /api/users/user123
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe Updated",
  "phone": "+1234567890",
  "dateOfBirth": "2000-01-01"
}
```

---

## Registration Endpoints

### Create Registration (Public)

```bash
POST /api/registrations
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "mobileNumber": "+1234567890",
  "city": "Mumbai",
  "courseInterestedIn": "B.Tech",
  "onlineDistance": false
}
```

### Get All Registrations (Admin Only)

```bash
GET /api/registrations?limit=50&offset=0
Authorization: Bearer <admin-token>
```

---

## Newsletter Endpoints

### Subscribe to Newsletter (Public)

```bash
POST /api/newsletter/subscribe
Content-Type: application/json

{
  "email": "subscriber@example.com",
  "mobileNumber": "+1234567890",
  "course": "B.Tech"
}
```

### Get All Subscriptions (Admin Only)

```bash
GET /api/newsletter/subscriptions?limit=50&offset=0
Authorization: Bearer <admin-token>
```

---

## Admin Endpoints

### Grant Admin Role

```bash
POST /api/admin/roles/admin
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "user123"
}
```

### Revoke Admin Role

```bash
DELETE /api/admin/roles/admin/user123
Authorization: Bearer <admin-token>
```

### Grant University Admin Role

```bash
POST /api/admin/roles/university
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "user123",
  "universityId": "uni123"
}
```

### Get All Admins

```bash
GET /api/admin/roles/admin
Authorization: Bearer <admin-token>
```

### Get All University Admins

```bash
GET /api/admin/roles/university
Authorization: Bearer <admin-token>
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Missing required field: email"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "No token provided. Please include Authorization header with Bearer token."
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Admin access required."
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "University not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch universities."
}
```

---

## Frontend Integration Examples

### React/Next.js Example

```javascript
// lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function fetchWithAuth(url, options = {}) {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const token = await user.getIdToken();
  
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

// Usage
export async function getUniversities(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetchWithAuth(`/universities?${params}`);
  return response.json();
}

export async function createApplication(data) {
  const response = await fetchWithAuth('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### Using in Components

```javascript
import { useEffect, useState } from 'react';
import { getUniversities } from '@/lib/api';

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState([]);
  
  useEffect(() => {
    getUniversities({ location: 'Mumbai', limit: 20 })
      .then(data => setUniversities(data.universities))
      .catch(console.error);
  }, []);
  
  return (
    <div>
      {universities.map(uni => (
        <div key={uni.id}>{uni.name}</div>
      ))}
    </div>
  );
}
```

