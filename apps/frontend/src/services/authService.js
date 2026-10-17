/**
 * Authentication Service
 * Interacts with backend user routes (/api/v1/users) for auth, profile, and account management.
 */
import apiClient from './apiClient';

export const authService = {
  register: async (userData) => {
    const response = await apiClient.post('/users/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/users/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/users/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  refreshAccessToken: async (refreshToken) => {
    const response = await apiClient.post('/users/refresh-access-token', { refreshToken });
    return response.data;
  },

  updateUserInfo: async (data) => {
    const response = await apiClient.patch('/users/updateInfo', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await apiClient.patch('/users/changePassword', data);
    return response.data;
  },

  updateAvatar: async (formData) => {
    const response = await apiClient.patch('/users/update-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete('/users/delete-account');
    return response.data;
  },
};

export default authService;
