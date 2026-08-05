import api from '../../api/axios';

const SESSIONS = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];
const CLASSES = ['Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

const feeStructureService = {
  getAll: async (params = {}) => {
    const response = await api.get('/fee-structures', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/fee-structures/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/fee-structures', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/fee-structures/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/fee-structures/${id}`);
    return response.data;
  },

  SESSIONS,
  CLASSES,
};

export default feeStructureService;
