# Database Schema

This document describes the Firestore database schema for the UniFriend application.

## Collections

### `users/{userId}`

User profile information.

```typescript
{
  id: string;                    // Document ID (Firebase Auth UID)
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: Date;
  savedUniversityIds?: string[];  // Array of university IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Access Rules:**
- Users can read/write their own document
- Admins can read/write any user document

---

### `universities/{universityId}`

University information and details.

```typescript
{
  id: string;                    // Document ID
  name: string;
  logo_url: string;
  imageUrl?: string;
  imageHint?: string;
  address: string;
  location?: string;
  established_year: number;
  naac_grade: string;
  type: 'Public' | 'Private';
  about: string;
  rating?: number;
  contact_email: string;
  contact_phone: string;
  admission_process?: string;
  cutoff_details?: string;
  scholarship_details?: string;
  hostel_details?: string;
  hostelAvailable?: boolean;
  placement?: {
    highest_package: string;
    average_package: string;
    top_recruiters: string[];
    report_url?: string;
  };
  courses: Array<{
    name: string;
    eligibility: string;
    application_date: string;
    trades: Array<{
      name: string;
      duration: string;
      fees: string;
      rating: number;
      reviews: number;
      application_date: string;
      apply_link?: string;
    }>;
  }>;
  reviews?: Array<{
    id: string;
    author: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
    likes: number;
  }>;
  rankings?: Array<{
    source: string;
    rank: number;
    year: number;
  }>;
  gallery?: Array<{
    id: string;
    url: string;
    alt: string;
    hint: string;
  }>;
  faculty?: Array<{
    id: string;
    name: string;
    designation: string;
    qualifications: string;
    avatar: string;
  }>;
  news?: Array<{
    id: string;
    title: string;
    date: string;
    url: string;
    source: string;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Access Rules:**
- Public read access
- Admin can create/update/delete
- University admins can update their assigned university

---

### `users/{userId}/applications/{applicationId}`

Student applications to universities (subcollection).

```typescript
{
  id: string;                    // Document ID
  studentId: string;             // User ID
  studentName: string;
  email: string;
  phone?: string;
  city?: string;
  message?: string;
  universityId: string;
  universityName: string;
  courseName: string;
  tradeName?: string;
  fees: string;
  status: 'Pending' | 'In Review' | 'Reviewed' | 'Approved' | 'Rejected';
  submittedAt: Timestamp;
  updatedAt?: Timestamp;
}
```

**Access Rules:**
- Users can read/write their own applications
- University admins can read applications for their university
- Admins can read all applications

---

### `registrations/{registrationId}`

Public registration form submissions.

```typescript
{
  id: string;                    // Document ID
  fullName: string;
  email: string;
  mobileNumber: string;
  city: string;
  courseInterestedIn: string;
  onlineDistance: boolean;
  createdAt: Timestamp;
}
```

**Access Rules:**
- Public create access
- Admin read access only

---

### `newsletter_subscriptions/{subscriptionId}`

Newsletter subscription data.

```typescript
{
  id: string;                    // Document ID
  email: string;
  mobileNumber?: string;
  course?: string;
  createdAt: Timestamp;
}
```

**Access Rules:**
- Public create access
- Admin read access only

---

### `roles_admin/{userId}`

Admin role assignments.

```typescript
{
  // Document ID is the user's Firebase Auth UID
  grantedAt: Timestamp;
  grantedBy: string;            // Admin user ID who granted the role
}
```

**Access Rules:**
- Admin read/write access only

---

### `roles_university/{userId}`

University admin role assignments.

```typescript
{
  // Document ID is the user's Firebase Auth UID
  universityId: string;         // University ID this user can manage
  grantedAt: Timestamp;
  grantedBy: string;            // Admin user ID who granted the role
}
```

**Access Rules:**
- Admin read/write access
- University admins can read their own role document

---

## Indexes

### Required Composite Indexes

For optimal query performance, create these composite indexes in Firestore:

1. **Applications by University:**
   - Collection: `applications` (collection group)
   - Fields: `universityId` (Ascending), `submittedAt` (Descending)

2. **Universities Filtering:**
   - Collection: `universities`
   - Fields: `location` (Ascending), `rating` (Ascending)
   - Fields: `type` (Ascending), `rating` (Ascending)

### Creating Indexes

1. Go to Firebase Console → Firestore → Indexes
2. Click "Create Index"
3. Add the fields as specified above
4. Wait for index to build (may take a few minutes)

---

## Data Relationships

```
users/{userId}
  └── applications/{applicationId}  (subcollection)
       └── references: universities/{universityId}

roles_university/{userId}
  └── references: universities/{universityId}
  └── references: users/{userId}
```

---

## Notes

- All timestamps use Firestore `Timestamp` type
- Document IDs are auto-generated by Firestore unless specified
- Subcollections are used for user-specific data (applications)
- Role-based access is managed through separate collections (`roles_admin`, `roles_university`)

