import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API] Request to:', config.url, 'with token:', token.substring(0, 20) + '...');
      } else {
        console.log('[API] Request to:', config.url, 'NO TOKEN');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if it's a refresh token request itself
    if (originalRequest.url?.includes('/auth/refresh/')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Use axios directly to avoid interceptor loop
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Redirect to login if refresh fails
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register/', data),
  login: (data: any) => api.post('/auth/login/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data: any) => api.patch('/auth/profile/', data),
};

// Forms API
export const formsAPI = {
  // Admin endpoints
  getAllForms: (params?: any) => api.get('/forms/admin/', { params }),
  getForm: (id: string | number) => api.get(`/forms/admin/${id}/`),
  createForm: (data: any) => api.post('/forms/admin/', data),
  updateForm: (id: string | number, data: any) => api.patch(`/forms/admin/${id}/`, data),
  deleteForm: (id: string | number) => api.delete(`/forms/admin/${id}/`),
  duplicateForm: (id: string | number) => api.post(`/forms/admin/${id}/duplicate/`),
  activateForm: (id: string | number) => api.post(`/forms/admin/${id}/activate/`),
  archiveForm: (id: string | number) => api.post(`/forms/admin/${id}/archive/`),

  // Public endpoints (for clients)
  getPublicForms: (params?: any) => api.get('/forms/public/', { params }),
  getPublicForm: (id: string | number) => api.get(`/forms/public/${id}/`),
};

// Submissions API
export const submissionsAPI = {
  // Client endpoints
  getMySubmissions: (params?: any) => api.get('/submissions/', { params }),
  getSubmission: (id: string | number) => api.get(`/submissions/${id}/`),
  createSubmission: (data: FormData) => 
    api.post('/submissions/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // Admin endpoints
  getAllSubmissions: (params?: any) => api.get('/submissions/admin/', { params }),
  getAdminSubmission: (id: string | number) => api.get(`/submissions/admin/${id}/`),
  updateSubmissionStatus: (id: string | number, data: any) => 
    api.patch(`/submissions/admin/${id}/`, data),
  getSubmissionStats: () => api.get('/submissions/admin/stats/'),
};
