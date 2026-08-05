import api from '../../api/axios';

const studentFeesService = {
  getAll: async (params = {}) => {
    const response = await api.get('/student-fees', { params });
    return response.data.data;
  },

  searchStudents: async (query) => {
    const response = await api.get('/student-fees/search', { params: { q: query } });
    return response.data.data;
  },

  loadStudentFeeDetails: async (studentId) => {
    const response = await api.get(`/student-fees/student/${studentId}/fee-details`);
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/student-fees/${id}`);
    return response.data.data;
  },

  collectFee: async (data) => {
    const response = await api.post('/student-fees', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/student-fees/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/student-fees/${id}`);
    return response.data;
  },
};

export default studentFeesService;
