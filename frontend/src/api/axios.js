import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const isPortalTab = () => sessionStorage.getItem('isAdminAccess') === 'true';

const getStorage = () => isPortalTab() ? sessionStorage : localStorage;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const storage = getStorage();
    const accessToken = storage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isLoginRequest = originalRequest?.url?.includes('/login');
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;

      try {
        const storage = getStorage();
        const refreshToken = storage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        storage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          storage.setItem('refreshToken', newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        const storage = getStorage();
        const userRole = storage.getItem('role');
        storage.removeItem('accessToken');
        storage.removeItem('refreshToken');
        storage.removeItem('user');
        storage.removeItem('role');
        storage.removeItem('isAdminAccess');
        const loginRoutes = { admin: '/admin/login', teacher: '/teacher/login', student: '/student/login' };
        window.location.replace(loginRoutes[userRole] || '/admin/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
