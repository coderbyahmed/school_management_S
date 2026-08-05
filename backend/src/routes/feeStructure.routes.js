import express from 'express';
import {
  createFeeStructure,
  getAllFeeStructures,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
} from '../controllers/feeStructure.controller.js';
import {
  validateCreateFeeStructure,
  validateUpdateFeeStructure,
  validateFeeStructureId,
} from '../validations/feeStructure.validation.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('admin'),
  getAllFeeStructures,
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  validateFeeStructureId,
  getFeeStructureById,
);

router.post(
  '/',
  protect,
  authorize('admin'),
  validateCreateFeeStructure,
  createFeeStructure,
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  validateFeeStructureId,
  validateUpdateFeeStructure,
  updateFeeStructure,
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validateFeeStructureId,
  deleteFeeStructure,
);

export default router;
