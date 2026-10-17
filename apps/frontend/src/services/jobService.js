/**
 * Job Service
 * Provides CRUD, AI analysis, resume matching, and cover letter endpoints for jobs.
 */
import apiClient from './apiClient';

export const jobService = {
  getJobs: async (params = {}) => {
    const response = await apiClient.get('/jobs', { params });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await apiClient.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id, data) => {
    const response = await apiClient.patch(`/jobs/${id}`, data);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await apiClient.delete(`/jobs/${id}`);
    return response.data;
  },

  analyzeJob: async (jobId) => {
    const response = await apiClient.post(`/jobs/${jobId}/analyze`);
    return response.data;
  },

  matchResumeToJob: async (jobId, resumeId) => {
    const response = await apiClient.post(`/jobs/${jobId}/match-resume/${resumeId}`);
    return response.data;
  },

  generateCoverLetter: async (jobId, resumeId) => {
    const response = await apiClient.post(`/jobs/${jobId}/cover-letter/${resumeId}`);
    return response.data;
  },
};

export default jobService;
