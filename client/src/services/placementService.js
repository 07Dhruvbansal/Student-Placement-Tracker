import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchPlacements = (params = {}) => api.get('/placements', { params });

export const loginUser = (credentials) => api.post('/auth/login', credentials);

export const registerUser = (user) => api.post('/auth/register', user);

export const createPlacement = (placement) => api.post('/placements', placement);

export const updatePlacementStage = (id, stage) =>
  api.put(`/placements/${encodeURIComponent(id)}/stage`, { stage });

export const deletePlacement = (id) =>
  api.delete(`/placements/${encodeURIComponent(id)}`);

export const applyWithResume = (formData) =>
  api.post('/placements/apply-resume', formData);

export const getCurrentUser = () => api.get('/auth/me');

export const fetchDrives = () => api.get('/drives');

export const createDrive = (drive) => api.post('/drives', drive);

export const fetchApplications = () => api.get('/applications');

export const submitApplication = (driveId, formData) =>
  api.post(`/applications/${encodeURIComponent(driveId)}`, formData);

export const updateApplicationStatus = (applicationId, status) =>
  api.patch(`/applications/${encodeURIComponent(applicationId)}/status`, { status });

export const downloadApplicationResume = (applicationId) =>
  api.get(`/applications/${encodeURIComponent(applicationId)}/resume`, { responseType: 'blob' });

export default api;
