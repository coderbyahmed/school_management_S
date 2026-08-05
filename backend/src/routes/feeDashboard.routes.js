import express from 'express';
import {
  getDashboard,
  getCards,
  getCharts,
  getRecentCollections,
  getUpcomingDues,
  getRecentActivities,
} from '../controllers/feeDashboard.controller.js';
import { validateDashboardFilters } from '../validations/feeDashboard.validation.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), validateDashboardFilters, getDashboard);
router.get('/cards', protect, authorize('admin'), validateDashboardFilters, getCards);
router.get('/charts', protect, authorize('admin'), validateDashboardFilters, getCharts);
router.get('/recent-collections', protect, authorize('admin'), validateDashboardFilters, getRecentCollections);
router.get('/upcoming-dues', protect, authorize('admin'), validateDashboardFilters, getUpcomingDues);
router.get('/recent-activities', protect, authorize('admin'), validateDashboardFilters, getRecentActivities);

export default router;
