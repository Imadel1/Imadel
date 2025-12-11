/**
 * API Service for IMADEL Backend Integration
 * 
 * Base URL: Set via VITE_API_BASE_URL environment variable
 * Default: https://imadelapi-production.up.railway.app/api (production)
 * 
 * To use: Create a .env file in root with:
 * VITE_API_BASE_URL=https://imadelapi-production.up.railway.app/api
 */

// Ensure base URL includes /api
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || 'https://imadelapi-production.up.railway.app/api').replace(/\/$/, '');

// Token management
const getToken = (): string | null => {
  try {
    return localStorage.getItem('imadel_auth_token');
  } catch {
    return null;
  }
};

const setToken = (token: string): void => {
  try {
    localStorage.setItem('imadel_auth_token', token);
  } catch (error) {
    console.error('Failed to save token:', error);
  }
};

const removeToken = (): void => {
  try {
    localStorage.removeItem('imadel_auth_token');
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

// API Response types
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  [key: string]: any; // For flexible response structures
}

interface LoginResponse {
  success: boolean;
  token: string;
  admin: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// ==================== AUTHENTICATION ====================

// Remove any duplicate LoginResponse declarations
export interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
}

// authApi
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Handle both shapes: { success, data: { token, admin } } and { success, token, admin }
    if (response.success) {
      const data = (response as any).data ?? response;
      if (data?.token) {
        setToken(data.token);
        return data as LoginResponse;
      }
    }

    throw new Error(response.error || response.message || 'Login failed');
  },

  getMe: async (): Promise<Admin> => {
    const response = await apiRequest<Admin>('/auth/me');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to fetch profile');
  },

  logout: (): void => {
    removeToken();
  },

  isAuthenticated: (): boolean => {
    return getToken() !== null;
  },

  getToken,
};


// ==================== PROJECTS ====================

export const projectsApi = {
  /**
   * Get all projects
   * GET /api/projects?category=current&status=active&published=true
   */
  getAll: async (params?: { category?: string; status?: string; published?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.published !== undefined) queryParams.append('published', params.published.toString());
    
    const query = queryParams.toString();
    return apiRequest(`/projects${query ? `?${query}` : ''}`);
  },

  /**
   * Get single project
   * GET /api/projects/:id
   */
  getById: async (id: string) => {
    return apiRequest(`/projects/${id}`);
  },

  /**
   * Create project
   * POST /api/projects
   */
  create: async (projectData: any) => {
    return apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  /**
   * Update project
   * PUT /api/projects/:id
   */
  update: async (id: string, projectData: any) => {
    return apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  /**
   * Delete project
   * DELETE /api/projects/:id
   */
  delete: async (id: string) => {
    return apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== JOBS ====================

export const jobsApi = {
  /**
   * Get all jobs
   * GET /api/jobs
   */
  getAll: async () => {
    return apiRequest('/jobs');
  },

  /**
   * Get single job
   * GET /api/jobs/:id
   */
  getById: async (id: string) => {
    return apiRequest(`/jobs/${id}`);
  },

  /**
   * Create job
   * POST /api/jobs
   */
  create: async (jobData: any) => {
    return apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  /**
   * Update job
   * PUT /api/jobs/:id
   */
  update: async (id: string, jobData: any) => {
    return apiRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  },

  /**
   * Delete job
   * DELETE /api/jobs/:id
   */
  delete: async (id: string) => {
    return apiRequest(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PARTNERS ====================

export const partnersApi = {
  /**
   * Get all partners
   * GET /api/partners
   */
  getAll: async () => {
    return apiRequest('/partners');
  },

  /**
   * Get single partner
   * GET /api/partners/:id
   */
  getById: async (id: string) => {
    return apiRequest(`/partners/${id}`);
  },

  /**
   * Create partner
   * POST /api/partners
   */
  create: async (partnerData: any) => {
    return apiRequest('/partners', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    });
  },

  /**
   * Update partner
   * PUT /api/partners/:id
   */
  update: async (id: string, partnerData: any) => {
    return apiRequest(`/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partnerData),
    });
  },

  /**
   * Delete partner
   * DELETE /api/partners/:id
   */
  delete: async (id: string) => {
    return apiRequest(`/partners/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== DONATIONS ====================

export const donationsApi = {
  /**
   * Initialize a donation (returns authorization URL for Paystack)
   * POST /api/donations/initialize
   */
  initialize: async (donationData: {
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    amount: number;
    currency: string;
    message?: string;
    isAnonymous?: boolean;
    purpose?: string;
  }) => {
    return apiRequest('/donations/initialize', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  },

  /**
   * Verify a donation by Paystack reference
   * GET /api/donations/verify/:reference
   */
  verify: async (reference: string) => {
    return apiRequest(`/donations/verify/${reference}`);
  },

  /**
   * Get all donations (admin)
   * GET /api/donations
   */
  getAll: async () => {
    return apiRequest('/donations');
  },

  /**
   * Get donation by id (admin)
   * GET /api/donations/:id
   */
  getById: async (id: string) => {
    return apiRequest(`/donations/${id}`);
  },
};

// ==================== APPLICATIONS ====================

export const applicationsApi = {
  /**
   * Submit a new job application
   * POST /api/applications
   * Backend will automatically send confirmation email to applicant
   */
  create: async (applicationData: {
    jobId: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    applicantAddress: string;
    coverLetter?: string;
    resume: File;
    jobTitle?: string;
  }) => {
    const token = getToken();
    const formData = new FormData();
    
    formData.append('jobId', applicationData.jobId);
    // Also append generic "job" field for backend variants
    formData.append('job', applicationData.jobId);
    if (applicationData.jobTitle) {
      formData.append('jobTitle', applicationData.jobTitle);
    }
    formData.append('applicantName', applicationData.applicantName);
    // Fallback fields some backends expect
    formData.append('name', applicationData.applicantName);
    formData.append('applicantEmail', applicationData.applicantEmail);
    formData.append('email', applicationData.applicantEmail);
    formData.append('applicantPhone', applicationData.applicantPhone);
    formData.append('phone', applicationData.applicantPhone);
    formData.append('applicantAddress', applicationData.applicantAddress);
    formData.append('address', applicationData.applicantAddress);
    if (applicationData.coverLetter) {
      formData.append('coverLetter', applicationData.coverLetter);
      formData.append('message', applicationData.coverLetter);
    }
    formData.append('resume', applicationData.resume);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.statusText}`);
    }

    return data;
  },

  /**
   * Get all applications (with optional filters)
   * GET /api/applications?status=&jobId=
   */
  getAll: async (params?: { status?: string; jobId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.jobId) queryParams.append('jobId', params.jobId);
    const query = queryParams.toString();
    return apiRequest(`/applications${query ? `?${query}` : ''}`);
  },

  /**
   * Get single application
   * GET /api/applications/:id
   */
  getById: async (id: string) => {
    return apiRequest(`/applications/${id}`);
  },

  /**
   * Update application status / notes
   * PUT /api/applications/:id
   */
  updateStatus: async (id: string, body: { status: string; adminNotes?: string }) => {
    return apiRequest(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  /**
   * Delete application
   * DELETE /api/applications/:id
   */
  delete: async (id: string) => {
    return apiRequest(`/applications/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== NEWSLETTERS ====================

export const newslettersApi = {
  /**
   * Get all newsletter content items
   * GET /api/newsletters?published=true
   * Note: Backend may return content items or subscribers based on query params
   * If /newsletters doesn't work, try /newsletters/public or /newsletters/content as fallback
   */
  getAll: async (params?: { published?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.published !== undefined) {
      queryParams.append('published', params.published.toString());
    }
    const query = queryParams.toString();

    // Public fetch without auth header; returns undefined on 401/403/404
    const publicFetch = async (path: string) => {
      try {
        const res = await fetch(`${API_BASE_URL}${path}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) {
          if ([401, 403, 404].includes(res.status)) return undefined;
          throw new Error(data?.message || res.statusText);
        }
        return data;
      } catch (err: any) {
        if (err?.message?.includes('Unauthorized') || err?.message?.includes('Not authorized') || err?.message?.includes('Not Found')) {
          return undefined;
        }
        throw err;
      }
    };

    // Try public endpoints first (no auth), then fallback to secured apiRequest
    const paths = [
      `/newsletters/public${query ? `?${query}` : ''}`,
      `/newsletters/content${query ? `?${query}` : ''}`,
      `/newsletters${query ? `?${query}` : ''}`,
    ];

    for (const p of paths) {
      try {
        return await publicFetch(p);
      } catch (err: any) {
        // continue to next path on 401/403/404
        if (
          err.message?.includes('Unauthorized') ||
          err.message?.includes('Not authorized') ||
          err.message?.includes('Not Found')
        ) {
          continue;
        }
        throw err;
      }
    }

    // Final fallback with apiRequest (may include token if logged in). If still unauthorized/not found, return empty array.
    try {
      return await apiRequest(`/newsletters${query ? `?${query}` : ''}`);
    } catch (err: any) {
      if (err?.message?.includes('Unauthorized') || err?.message?.includes('Not authorized') || err?.message?.includes('Not Found')) {
        return [];
      }
      throw err;
    }
  },

  /**
   * Get all subscribers (admin only)
   * GET /api/newsletters/subscribers
   */
  getSubscribers: async () => {
    return apiRequest('/newsletters/subscribers');
  },

  /**
   * Subscribe to newsletter
   * POST /api/newsletters/subscribe
   * Backend will automatically send confirmation email to subscriber
   */
  subscribe: async (email: string) => {
    return apiRequest('/newsletters/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Unsubscribe from newsletter
   * POST /api/newsletters/unsubscribe
   */
  unsubscribe: async (email: string) => {
    return apiRequest('/newsletters/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Delete subscriber (admin only)
   * DELETE /api/newsletters/:id
   */
  delete: async (id: string) => {
    return apiRequest(`/newsletters/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== OFFICES ====================

export const officesApi = {
  /**
   * Get all offices
   * GET /api/offices
   */
  getAll: async () => {
    return apiRequest('/offices');
  },

  /**
   * Get single office
   * GET /api/offices/:id
   */
  getById: async (id: string) => {
    return apiRequest(`/offices/${id}`);
  },

  /**
   * Create office
   * POST /api/offices
   */
  create: async (officeData: any) => {
    return apiRequest('/offices', {
      method: 'POST',
      body: JSON.stringify(officeData),
    });
  },

  /**
   * Update office
   * PUT /api/offices/:id
   */
  update: async (id: string, officeData: any) => {
    return apiRequest(`/offices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(officeData),
    });
  },

  /**
   * Delete office
   * DELETE /api/offices/:id
   */
  delete: async (id: string) => {
    return apiRequest(`/offices/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== UPLOADS ====================

export const uploadsApi = {
  /**
   * Upload single image
   * POST /api/uploads/image
   */
  uploadImage: async (file: File): Promise<string> => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/uploads/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    // Assuming API returns { success: true, url: "..." }
    return data.url || data.imageUrl || '';
  },

  /**
   * Upload multiple images
   * POST /api/uploads/images
   */
  uploadImages: async (files: File[]): Promise<string[]> => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await fetch(`${API_BASE_URL}/uploads/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    // Assuming API returns { success: true, urls: [...] }
    return data.urls || data.imageUrls || [];
  },

  /**
   * Delete image
   * DELETE /api/uploads/:filename
   */
  deleteImage: async (filename: string) => {
    return apiRequest(`/uploads/${filename}`, {
      method: 'DELETE',
    });
  },
};

// ==================== ADMIN ====================

export const adminApi = {
  /**
   * Get dashboard statistics
   * GET /api/admin/stats
   */
  getStats: async () => {
    return apiRequest('/admin/stats');
  },
};

// Export default API object
export default {
  auth: authApi,
  projects: projectsApi,
  jobs: jobsApi,
  partners: partnersApi,
  donations: donationsApi,
  applications: applicationsApi,
  newsletters: newslettersApi,
  offices: officesApi,
  uploads: uploadsApi,
  admin: adminApi,
};


