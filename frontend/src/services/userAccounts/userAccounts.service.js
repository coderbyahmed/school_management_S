import api from '../../api/axios';

const userAccountsService = {
  getAllAccounts: async (params = {}) => {
    const { search, type, status, page, limit } = params;
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (type) queryParams.append('type', type);
    if (status) queryParams.append('status', status);
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    const qs = queryParams.toString();
    const response = await api.get(`/user-accounts/accounts${qs ? `?${qs}` : ''}`);
    return response.data;
  },

  getAccountByLoginId: async (loginId) => {
    const response = await api.get(`/user-accounts/accounts/${loginId}`);
    return response.data;
  },

  resetPassword: async (targetId, targetType, newPassword) => {
    const response = await api.post('/user-accounts/accounts/reset-password', {
      targetId,
      targetType,
      newPassword,
    });
    return response.data;
  },

  getPasswordManagementData: async (params = {}) => {
    const { search, type, page, limit } = params;
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (type) queryParams.append('type', type);
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    const qs = queryParams.toString();
    const response = await api.get(`/user-accounts/password-management${qs ? `?${qs}` : ''}`);
    return response.data;
  },
};

export default userAccountsService;
