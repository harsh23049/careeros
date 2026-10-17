/**
 * AI Service
 * Handles AI analysis, cover letter generation & CRUD, and AI operation histories.
 */
import apiClient from './apiClient';

export const aiService = {
  // Job & Resume AI Operations
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

  // Cover Letters Management
  getCoverLetters: async () => {
    const response = await apiClient.get('/cover-letters');
    return response.data;
  },

  getCoverLetterById: async (id) => {
    const response = await apiClient.get(`/cover-letters/${id}`);
    return response.data;
  },

  getApplicationCoverLetters: async (applicationId) => {
    const response = await apiClient.get(`/cover-letters/application/${applicationId}`);
    return response.data;
  },

  createCoverLetter: async (data) => {
    const response = await apiClient.post('/cover-letters', data);
    return response.data;
  },

  updateCoverLetter: async (id, data) => {
    const response = await apiClient.patch(`/cover-letters/${id}`, data);
    return response.data;
  },

  deleteCoverLetter: async (id) => {
    const response = await apiClient.delete(`/cover-letters/${id}`);
    return response.data;
  },

  // AI History
  getAIHistory: async (params = {}) => {
    const response = await apiClient.get('/ai-history', { params });
    return response.data;
  },

  getAIHistoryById: async (id) => {
    const response = await apiClient.get(`/ai-history/${id}`);
    return response.data;
  },

  getJobAIHistory: async (jobId) => {
    const response = await apiClient.get(`/ai-history/job/${jobId}`);
    return response.data;
  },

  getApplicationAIHistory: async (applicationId) => {
    const response = await apiClient.get(`/ai-history/application/${applicationId}`);
    return response.data;
  },

  getAIHistoryByType: async (type) => {
    const response = await apiClient.get(`/ai-history/type/${type}`);
    return response.data;
  },

  createAIHistory: async (data) => {
    const response = await apiClient.post('/ai-history', data);
    return response.data;
  },

  deleteAIHistory: async (id) => {
    const response = await apiClient.delete(`/ai-history/${id}`);
    return response.data;
  },
};

export default aiService;
