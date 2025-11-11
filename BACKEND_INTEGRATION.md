# Backend Integration Guide for IMADEL Website

This document provides guidance for backend developers on integrating this frontend with a backend API.

## Current Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: CSS Modules with CSS Variables
- **Icons**: React Icons (Font Awesome)
- **Build Tool**: Vite

### Data Storage (Current)
Currently, all data is stored in **browser localStorage**. This is temporary and needs to be replaced with proper backend API calls.

## Key Integration Points

### 1. Authentication (`src/pages/AdminLogin.tsx`)

**Current Implementation:**
- Hardcoded credentials (admin/admin123)
- 2FA with hardcoded code (123456)
- Stores auth state in localStorage

**Backend Integration Needed:**
```typescript
// Replace lines 47-60 in AdminLogin.tsx
// POST /api/auth/login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

// POST /api/auth/verify-2fa
const verify2fa = await fetch('/api/auth/verify-2fa', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, twoFactorCode })
});
```

**Recommended Backend Endpoints:**
- `POST /api/auth/login` - Returns JWT token
- `POST /api/auth/verify-2fa` - Verifies 2FA code
- `POST /api/auth/logout` - Invalidates token
- `GET /api/auth/verify` - Validates current session

---

### 2. Admin Panel (`src/pages/AdminPanel.tsx`)

**Current localStorage Keys:**
- `imadel_offices` - Office locations
- `imadel_admin_projects` - Projects data
- `imadel_admin_jobs` - Job postings
- `imadel_admin_partners` - Partner organizations
- `imadel_admin_newsletters` - Newsletter/news items
- `imadel_admin_authenticated` - Auth state (1 or 0)

**Data Types:**
```typescript
type Office = {
  id: string;
  country: string;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
};

type Project = {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  country?: string;
  published?: boolean;
  images?: string[];
  areasOfIntervention?: string[]; // Multi-select field
};

type Job = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  applyUrl?: string;
  published?: boolean;
  images?: string[];
};

type Partner = {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  images?: string[];
};

type Newsletter = {
  id: string;
  title: string;
  content?: string;
  published?: boolean;
  date?: string;
  images?: string[];
};
```

**Backend Endpoints Needed:**

#### Projects
- `GET /api/projects` - Get all projects (filter by published=true for public)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

#### Partners
- `GET /api/partners` - Get all partners
- `POST /api/partners` - Create new partner
- `PUT /api/partners/:id` - Update partner
- `DELETE /api/partners/:id` - Delete partner

#### Newsletters
- `GET /api/newsletters` - Get all newsletters
- `GET /api/newsletters/:id` - Get single newsletter
- `POST /api/newsletters` - Create new newsletter
- `PUT /api/newsletters/:id` - Update newsletter
- `DELETE /api/newsletters/:id` - Delete newsletter

#### Offices
- `GET /api/offices` - Get all offices
- `POST /api/offices` - Create new office
- `PUT /api/offices/:id` - Update office
- `DELETE /api/offices/:id` - Delete office

---

### 3. Image Uploads

**Current Implementation:**
Images are referenced by URL strings. Users paste image URLs manually.

**Recommended Backend Integration:**
1. Add file upload endpoint: `POST /api/uploads`
2. Return CDN/storage URL
3. Update admin panel to include file upload UI

**Example Integration:**
```typescript
// Add to AdminPanel.tsx
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/uploads', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  const { url } = await response.json();
  return url;
};
```

---

### 4. Data Import/Export (`src/pages/AdminPanel.tsx` lines 244-265)

**Current Implementation:**
- Export: Downloads JSON file with all data
- Import: Reads JSON file and loads into localStorage

**Backend Integration:**
Keep this functionality but sync with backend:
- Export should fetch from backend API
- Import should POST to backend API for bulk update

**Endpoints Needed:**
- `GET /api/admin/export` - Export all data as JSON
- `POST /api/admin/import` - Import/sync data from JSON

---

### 5. Real-time Updates

**Current Implementation:**
Uses CustomEvents to notify components of data changes:
```typescript
window.dispatchEvent(new CustomEvent('imadel:projects:updated'));
window.dispatchEvent(new CustomEvent('imadel:newsletters:updated'));
window.dispatchEvent(new CustomEvent('imadel:jobs:updated'));
window.dispatchEvent(new CustomEvent('imadel:offices:updated'));
```

**Backend Integration:**
Consider implementing WebSocket or Server-Sent Events for real-time updates across multiple admin sessions.

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=https://api.imadel.org
VITE_API_TIMEOUT=30000

# Auth Configuration
VITE_AUTH_TOKEN_KEY=imadel_auth_token
VITE_ENABLE_2FA=true

# Upload Configuration
VITE_MAX_IMAGE_SIZE=5242880
VITE_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Feature Flags
VITE_ENABLE_EXPORT=true
VITE_ENABLE_IMPORT=true
```

Access in code:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## Security Considerations

### 1. Authentication
- Implement JWT tokens with refresh tokens
- Store tokens in httpOnly cookies (not localStorage)
- Add CSRF protection
- Implement rate limiting on auth endpoints

### 2. Authorization
- Add role-based access control (RBAC)
- Verify user permissions on every API call
- Audit log for admin actions

### 3. Data Validation
- Validate all inputs on backend
- Sanitize HTML content in newsletters/projects
- Implement file type/size validation for uploads
- Use prepared statements to prevent SQL injection

### 4. API Security
- Enable CORS with specific origin (not *)
- Implement API rate limiting
- Add request size limits
- Use HTTPS only in production

---

## Database Schema Recommendations

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  two_factor_secret VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  content TEXT,
  country VARCHAR(100),
  published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_images (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_areas (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  area_name VARCHAR(255) NOT NULL,
  PRIMARY KEY (project_id, area_name)
);
```

### Jobs Table
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  apply_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_images (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);
```

### Partners Table
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE partner_images (
  id UUID PRIMARY KEY,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);
```

### Newsletters Table
```sql
CREATE TABLE newsletters (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT false,
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE newsletter_images (
  id UUID PRIMARY KEY,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);
```

### Offices Table
```sql
CREATE TABLE offices (
  id UUID PRIMARY KEY,
  country VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Response Format

Use consistent response format across all endpoints:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "title": "Title is required"
    }
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Testing Recommendations

1. **Unit Tests**: Test business logic in services/controllers
2. **Integration Tests**: Test API endpoints with test database
3. **E2E Tests**: Test full user flows
4. **Load Tests**: Ensure API can handle expected traffic

---

## Deployment Considerations

### Frontend
- Build command: `npm run build`
- Output directory: `dist/`
- Serve with Nginx or similar
- Enable gzip compression
- Set proper cache headers for static assets

### Backend
- Use Docker for containerization
- Set up CI/CD pipeline (GitHub Actions, GitLab CI)
- Configure auto-scaling for production
- Set up monitoring (Sentry, LogRocket, etc.)
- Regular database backups

---

## Contact & Support

For questions or clarifications, please contact:
- Frontend Dev: [Your Email]
- Project Manager: [PM Email]

## Next Steps

1. Set up backend API with endpoints listed above
2. Replace localStorage calls with API calls
3. Implement proper authentication with JWT
4. Add image upload functionality
5. Set up production database
6. Configure CORS and security headers
7. Deploy backend API
8. Update frontend environment variables
9. Test all integrations thoroughly
10. Deploy to production

---

**Last Updated:** November 11, 2025
**Version:** 1.0

