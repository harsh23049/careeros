import apiClient from './apiClient';

export const resumeService = {
  getResumes: async () => {
    const response = await apiClient.get('/resumes');
    return response.data;
  },

  getDefaultResume: async () => {
    const response = await apiClient.get('/resumes/default');
    return response.data;
  },

  getResumeById: async (id) => {
    const response = await apiClient.get(`/resumes/${id}`);
    return response.data;
  },

  createResume: async (data) => {
    const response = await apiClient.post('/resumes', data);
    return response.data;
  },

  updateResume: async (id, data) => {
    const response = await apiClient.patch(`/resumes/${id}`, data);
    return response.data;
  },

  deleteResume: async (id) => {
    const response = await apiClient.delete(`/resumes/${id}`);
    return response.data;
  },
};

export default resumeService;
