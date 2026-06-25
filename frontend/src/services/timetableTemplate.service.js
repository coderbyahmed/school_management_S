import api from '../api/axios';

const timetableTemplateService = {
  createTemplate: async (data) => {
    const response = await api.post('/timetable-templates', data);
    return response.data;
  },

  getTemplates: async () => {
    const response = await api.get('/timetable-templates');
    return response.data;
  },

  getTemplateById: async (id) => {
    const response = await api.get(`/timetable-templates/${id}`);
    return response.data;
  },

  updateTemplate: async (id, data) => {
    const response = await api.put(`/timetable-templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id) => {
    const response = await api.delete(`/timetable-templates/${id}`);
    return response.data;
  },

  duplicateTemplate: async (id) => {
    const response = await api.post(`/timetable-templates/${id}/duplicate`);
    return response.data;
  },
};

export default timetableTemplateService;
