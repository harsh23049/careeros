/**
 * Application Service
 * Manages user job applications across pipeline stages (saved, applied, interview, offer).
 */
import apiClient from './apiClient';

export const applicationService = {
  getApplications: async (params = {}) => {
    const response = await apiClient.get('/applications', { params });
    return response.data;
  },

  getApplicationById: async (id) => {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data;
  },

  createApplication: async (data) => {
    const response = await apiClient.post('/applications', data);
    return response.data;
  },

  updateApplication: async (id, data) => {
    const response = await apiClient.patch(`/applications/${id}`, data);
    return response.data;
  },

  deleteApplication: async (id) => {
    const response = await apiClient.delete(`/applications/${id}`);
    return response.data;
  },
};

export default applicationService;
