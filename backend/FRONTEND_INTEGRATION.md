# Frontend Integration Guide

This guide explains how to integrate the backend API with your Next.js frontend.

## Setup

### 1. Create API Utility File

Create `src/lib/api.ts`:

```typescript
import { getAuth } from 'firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Fetch with automatic Firebase token injection
 */
export async function fetchWithAuth(url: string, options: RequestOptions = {}) {
  const { requireAuth = true, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add auth token if required
  if (requireAuth) {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const token = await user.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch without authentication (for public endpoints)
 */
export async function fetchPublic(url: string, options: RequestInit = {}) {
  return fetchWithAuth(url, { ...options, requireAuth: false });
}
```

### 2. Create API Service Functions

Create `src/lib/api-services.ts`:

```typescript
import { fetchWithAuth, fetchPublic } from './api';
import type { University, Application, Student } from './types';

// Universities
export async function getUniversities(filters?: {
  location?: string;
  type?: string;
  minRating?: number;
  maxRating?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  
  const queryString = params.toString();
  return fetchPublic(`/universities${queryString ? `?${queryString}` : ''}`);
}

export async function getUniversityById(id: string) {
  return fetchPublic(`/universities/${id}`);
}

export async function createUniversity(data: Partial<University>) {
  return fetchWithAuth('/universities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUniversity(id: string, data: Partial<University>) {
  return fetchWithAuth(`/universities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Applications
export async function getUserApplications() {
  return fetchWithAuth('/applications');
}

export async function getApplicationById(id: string) {
  return fetchWithAuth(`/applications/${id}`);
}

export async function createApplication(data: {
  universityId: string;
  universityName: string;
  courseName: string;
  tradeName?: string;
  studentName: string;
  email: string;
  phone?: string;
  city?: string;
  message?: string;
}) {
  return fetchWithAuth('/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateApplicationStatus(id: string, status: string) {
  return fetchWithAuth(`/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function getUniversityApplications(universityId: string) {
  return fetchWithAuth(`/applications/university/${universityId}`);
}

// Users
export async function getCurrentUser() {
  return fetchWithAuth('/users/me');
}

export async function updateUserProfile(userId: string, data: Partial<Student>) {
  return fetchWithAuth(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Registrations
export async function createRegistration(data: {
  fullName: string;
  email: string;
  mobileNumber: string;
  city: string;
  courseInterestedIn: string;
  onlineDistance: boolean;
}) {
  return fetchPublic('/registrations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Newsletter
export async function subscribeNewsletter(data: {
  email: string;
  mobileNumber?: string;
  course?: string;
}) {
  return fetchPublic('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Auth
export async function verifyToken(token: string) {
  return fetchPublic('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function getCurrentUserInfo() {
  return fetchWithAuth('/auth/me');
}
```

### 3. Update Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

## Usage Examples

### Replace Direct Firestore Calls

**Before (Direct Firestore):**
```typescript
import { collection, addDoc } from 'firebase/firestore';

const applicationsCollection = collection(firestore, 'users', user.uid, 'applications');
await addDoc(applicationsCollection, applicationData);
```

**After (API):**
```typescript
import { createApplication } from '@/lib/api-services';

await createApplication({
  universityId: 'uni123',
  universityName: 'Mumbai University',
  courseName: 'B.Tech',
  tradeName: 'Computer Science',
  studentName: user.displayName || '',
  email: user.email || '',
  phone: '',
  city: '',
  message: ''
});
```

### Update Universities Page

**Before:**
```typescript
const universitiesCollectionRef = useMemoFirebase(
  () => (firestore ? collection(firestore, 'universities') : null),
  [firestore]
);
const { data: universities, isLoading } = useCollection<University>(universitiesCollectionRef);
```

**After:**
```typescript
import { useState, useEffect } from 'react';
import { getUniversities } from '@/lib/api-services';

const [universities, setUniversities] = useState<University[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  getUniversities({ limit: 50 })
    .then(data => setUniversities(data.universities))
    .catch(console.error)
    .finally(() => setIsLoading(false));
}, []);
```

### Update Applications Page

**Before:**
```typescript
const applicationsCollection = collection(firestore, 'users', user.uid, 'applications');
const { data: applications } = useCollection<Application>(applicationsCollection);
```

**After:**
```typescript
import { getUserApplications } from '@/lib/api-services';

const [applications, setApplications] = useState<Application[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  getUserApplications()
    .then(data => setApplications(data.applications))
    .catch(console.error)
    .finally(() => setIsLoading(false));
}, []);
```

### Update Registration Dialog

**Before:**
```typescript
const registrationsCol = collection(firestore, 'registrations');
addDocumentNonBlocking(registrationsCol, {
  fullName: data.fullName,
  email: data.email,
  // ...
});
```

**After:**
```typescript
import { createRegistration } from '@/lib/api-services';

try {
  await createRegistration({
    fullName: data.fullName,
    email: data.email,
    mobileNumber: data.mobile,
    city: data.city,
    courseInterestedIn: data.course,
    onlineDistance: data.onlineDistance === 'yes'
  });
  toast({
    title: "Registration Submitted!",
    description: "We've received your details. Welcome to UniFriend!",
  });
} catch (error) {
  toast({
    variant: "destructive",
    title: "Error",
    description: error.message,
  });
}
```

## Error Handling

Create a custom hook for API calls:

```typescript
// src/hooks/use-api.ts
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { data, isLoading, error, execute };
}
```

**Usage:**
```typescript
const { data: universities, isLoading, execute } = useApi<{ universities: University[] }>();

useEffect(() => {
  execute(() => getUniversities({ limit: 50 }));
}, [execute]);
```

## Migration Strategy

1. **Start with new features**: Use API for all new features
2. **Gradually migrate**: Replace Firestore calls page by page
3. **Keep Firestore for real-time**: If you need real-time updates, keep using Firestore listeners
4. **Hybrid approach**: Use API for mutations, Firestore for reads (if needed)

## Benefits of Using API

- ✅ Centralized business logic
- ✅ Better security (server-side validation)
- ✅ Easier to add features (analytics, logging, etc.)
- ✅ Consistent error handling
- ✅ Rate limiting protection
- ✅ Easier to test and debug

## Real-time Updates

If you need real-time updates, you can still use Firestore listeners for reads while using the API for writes:

```typescript
// Read with Firestore (real-time)
const universitiesRef = collection(firestore, 'universities');
const { data: universities } = useCollection<University>(universitiesRef);

// Write with API
await createUniversity(universityData);
```

This gives you the best of both worlds: real-time reads and secure writes.

