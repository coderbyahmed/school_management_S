import api from '../api/axios';

const studentService = {
  createStudent: async (formData) => {
    const response = await api.post('/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAllStudents: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  getStudentById: async (studentId) => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },

  updateStudent: async (studentId, formData) => {
    const response = await api.put(`/students/${studentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteStudent: async (studentId) => {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
  },
};

export default studentService;
