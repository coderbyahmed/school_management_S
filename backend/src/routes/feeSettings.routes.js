import express from 'express';
import {
  getFeeSettings,
  updateFeeSettings,
} from '../controllers/feeSettings.controller.js';
import { validateFeeSettings } from '../validations/feeSettings.validation.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('admin'),
  getFeeSettings,
);

router.put(
  '/',
  protect,
  authorize('admin'),
  validateFeeSettings,
  updateFeeSettings,
);

export default router;
