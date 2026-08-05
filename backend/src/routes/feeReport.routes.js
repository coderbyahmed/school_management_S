import express from 'express';
import {
  getReport,
  printReport,
  exportPdf,
  exportExcel,
} from '../controllers/feeReport.controller.js';
import { validateReportFilters } from '../validations/feeReport.validation.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('admin'),
  validateReportFilters,
  getReport,
);

router.get(
  '/pdf',
  protect,
  authorize('admin'),
  validateReportFilters,
  exportPdf,
);

router.get(
  '/excel',
  protect,
  authorize('admin'),
  validateReportFilters,
  exportExcel,
);

router.get(
  '/print',
  protect,
  authorize('admin'),
  validateReportFilters,
  printReport,
);

export default router;
