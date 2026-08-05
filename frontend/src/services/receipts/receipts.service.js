import api from '../../api/axios';

const receiptsService = {
  getAll: async (params = {}) => {
    const response = await api.get('/receipts', { params });
    return response.data.data;
  },

  generate: async (feeCollectionId) => {
    const response = await api.post('/receipts/generate', { feeCollectionId });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/receipts/${id}`);
    return response.data.data;
  },

  markPrinted: async (id) => {
    const response = await api.get(`/receipts/${id}/print`);
    return response.data.data;
  },

  markReprinted: async (id) => {
    const response = await api.get(`/receipts/${id}/reprint`);
    return response.data.data;
  },

  downloadPdf: async (id) => {
    const response = await api.get(`/receipts/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },
};

export default receiptsService;
