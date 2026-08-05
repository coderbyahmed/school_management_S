import { asyncHandler } from '../utils/asyncHandler.js';
import { toFullUrl } from '../utils/imageUrl.js';
import feeDashboardService from '../services/feeDashboard.service.js';

const mapStudentImages = (req, items) => {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    if (item.studentImage) item.studentImage = toFullUrl(req, item.studentImage);
    if (item.student?.studentImage) item.student.studentImage = toFullUrl(req, item.student.studentImage);
  }
};

const mapDashboardImages = (req, data) => {
  mapStudentImages(req, data.recentCollections);
  mapStudentImages(req, data.upcomingDues);
  mapStudentImages(req, data.recentActivities);
  return data;
};

const getDashboard = asyncHandler(async (req, res) => {
  const data = await feeDashboardService.loadDashboard(req.dashboardFilters, req.user);
  mapDashboardImages(req, data);

  return res.status(200).json({
    success: true,
    message: 'Fee dashboard loaded successfully',
    data,
  });
});

const getCards = asyncHandler(async (req, res) => {
  const cards = await feeDashboardService.loadCards(req.dashboardFilters);

  return res.status(200).json({
    success: true,
    message: 'Dashboard cards fetched successfully',
    data: { cards },
  });
});

const getCharts = asyncHandler(async (req, res) => {
  const charts = await feeDashboardService.loadCharts(req.dashboardFilters);

  return res.status(200).json({
    success: true,
    message: 'Dashboard charts fetched successfully',
    data: { charts },
  });
});

const getRecentCollections = asyncHandler(async (req, res) => {
  const recentCollections = await feeDashboardService.loadRecentCollections(req.dashboardFilters);
  mapStudentImages(req, recentCollections);

  return res.status(200).json({
    success: true,
    message: 'Recent fee collections fetched successfully',
    data: { recentCollections },
  });
});

const getUpcomingDues = asyncHandler(async (req, res) => {
  const upcomingDues = await feeDashboardService.loadUpcomingDues(req.dashboardFilters);
  mapStudentImages(req, upcomingDues);

  return res.status(200).json({
    success: true,
    message: 'Upcoming due students fetched successfully',
    data: { upcomingDues },
  });
});

const getRecentActivities = asyncHandler(async (req, res) => {
  const recentActivities = await feeDashboardService.loadRecentActivities(req.dashboardFilters);

  return res.status(200).json({
    success: true,
    message: 'Recent activities fetched successfully',
    data: { recentActivities },
  });
});

export {
  getDashboard,
  getCards,
  getCharts,
  getRecentCollections,
  getUpcomingDues,
  getRecentActivities,
};
