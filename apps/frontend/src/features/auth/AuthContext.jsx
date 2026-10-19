import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './context';
import authService from '../../services/authService';
import { setAccessToken, setOnAuthFailure } from '../../services/apiClient';
import { queryClient } from '../../app/queryClient';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear session locally and purge cached user data
  const handleClearSession = useCallback(() => {
    queryClient.clear();
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setOnAuthFailure(handleClearSession);

    let isMounted = true;

    async function initSession() {
      try {
        const response = await authService.getProfile();
        if (isMounted) {
          setUser(response.data);
        }
      } catch {
        try {
          const refreshRes = await authService.refreshAccessToken();
          const newAccessToken = refreshRes.data?.accessToken;
          if (newAccessToken) {
            setAccessToken(newAccessToken);
            const retryProfileRes = await authService.getProfile();
            if (isMounted) {
              setUser(retryProfileRes.data);
            }
          } else if (isMounted) {
            handleClearSession();
          }
        } catch {
          if (isMounted) {
            handleClearSession();
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [handleClearSession]);

  const login = async (email, password) => {
    queryClient.clear();
    const response = await authService.login({ email, password });
    const authData = response.data;

    if (authData.accessToken) {
      setAccessToken(authData.accessToken);
    }

    const authenticatedUser = authData.user || authData;
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    return response.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API error (clearing local session anyway):', err?.message);
    } finally {
      handleClearSession();
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
