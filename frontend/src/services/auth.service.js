import api from '../api/axios';

const authService = {
  adminLogin: async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password });
    return response.data;
  },

  teacherLogin: async (teacherId, password) => {
    const response = await api.post('/auth/teacher/login', { teacherId, password });
    return response.data;
  },

  studentLogin: async (studentId, password) => {
    const response = await api.post('/auth/student/login', { studentId, password });
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/profile/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

export default authService;
