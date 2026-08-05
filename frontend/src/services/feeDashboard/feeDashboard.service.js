import api from '../../api/axios';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const sessions = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];
const classes = ['All', 'Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

const buildParams = (filters) => {
  const params = {};
  if (filters.year && filters.year !== 'All') params.academicYear = filters.year;
  if (filters.class && filters.class !== 'All') params.class = filters.class;
  const monthIndex = months.indexOf(filters.month);
  if (monthIndex >= 0) params.month = monthIndex + 1;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  return params;
};

const getDashboardData = async (filters = {}) => {
  const response = await api.get('/fee-dashboard', { params: buildParams(filters) });
  return response.data.data;
};

const getCards = async (filters = {}) => {
  const response = await api.get('/fee-dashboard/cards', { params: buildParams(filters) });
  return response.data.data.cards;
};

const getCharts = async (filters = {}) => {
  const response = await api.get('/fee-dashboard/charts', { params: buildParams(filters) });
  return response.data.data.charts;
};

const getRecentCollections = async (filters = {}) => {
  const response = await api.get('/fee-dashboard/recent-collections', { params: buildParams(filters) });
  return response.data.data.recentCollections;
};

const getUpcomingDues = async (filters = {}) => {
  const response = await api.get('/fee-dashboard/upcoming-dues', { params: buildParams(filters) });
  return response.data.data.upcomingDues;
};

const getRecentActivities = async (filters = {}) => {
  const response = await api.get('/fee-dashboard/recent-activities', { params: buildParams(filters) });
  return response.data.data.recentActivities;
};

const feeDashboardService = {
  getDashboardData,
  getCards,
  getCharts,
  getRecentCollections,
  getUpcomingDues,
  getRecentActivities,
  months,
  sessions,
  classes,
};

export default feeDashboardService;
