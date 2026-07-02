import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  getUsers: () => api.get('/auth/users'),
  updateUser: (id: string, data: any) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/auth/users/${id}`),
};

// User Stories
export const storiesAPI = {
  getAll: (params?: any) => api.get('/stories', { params }),
  getById: (id: string) => api.get(`/stories/${id}`),
  create: (data: any) => api.post('/stories', data),
  update: (id: string, data: any) => api.put(`/stories/${id}`, data),
  delete: (id: string) => api.delete(`/stories/${id}`),
};

// Test Cases
export const testcasesAPI = {
  getAll: (params?: any) => api.get('/testcases', { params }),
  getById: (id: string) => api.get(`/testcases/${id}`),
  create: (data: any) => api.post('/testcases', data),
  generate: (userStoryId: string) => api.post('/testcases/generate', { userStoryId }),
  update: (id: string, data: any) => api.put(`/testcases/${id}`, data),
  delete: (id: string) => api.delete(`/testcases/${id}`),
};

// Test Plans
export const testplansAPI = {
  getAll: (params?: any) => api.get('/testplans', { params }),
  getById: (id: string) => api.get(`/testplans/${id}`),
  create: (data: any) => api.post('/testplans', data),
  update: (id: string, data: any) => api.put(`/testplans/${id}`, data),
  delete: (id: string) => api.delete(`/testplans/${id}`),
};

// Campaigns
export const campaignsAPI = {
  getAll: (params?: any) => api.get('/campaigns', { params }),
  getById: (id: string) => api.get(`/campaigns/${id}`),
  create: (data: any) => api.post('/campaigns', data),
  update: (id: string, data: any) => api.put(`/campaigns/${id}`, data),
  delete: (id: string) => api.delete(`/campaigns/${id}`),
};

// Execution
export const executionAPI = {
  run: (data: any) => api.post('/execution/run', data),
  getResults: (params?: any) => api.get('/execution/results', { params }),
  getById: (id: string) => api.get(`/execution/${id}`),
};

// Bugs
export const bugsAPI = {
  getAll: (params?: any) => api.get('/bugs', { params }),
  getById: (id: string) => api.get(`/bugs/${id}`),
  create: (data: any) => api.post('/bugs', data),
  update: (id: string, data: any) => api.put(`/bugs/${id}`, data),
  delete: (id: string) => api.delete(`/bugs/${id}`),
};

// Dashboard
export const dashboardAPI = {
  getStatistics: () => api.get('/dashboard/statistics'),
  getKpis: () => api.get('/dashboard/kpis'),
};

export default api;
