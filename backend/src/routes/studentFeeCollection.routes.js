import express from 'express';
import {
  searchStudents,
  loadStudentFeeDetails,
  collectFee,
  getFeeCollections,
  getFeeCollectionById,
  updateFeeCollection,
  deleteFeeCollection,
} from '../controllers/studentFeeCollection.controller.js';
import {
  validateCollectFee,
  validateUpdateFeeCollection,
  validateFeeCollectionId,
  validateStudentIdParam,
} from '../validations/studentFeeCollection.validation.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('admin'),
  getFeeCollections,
);

router.get(
  '/search',
  protect,
  authorize('admin'),
  searchStudents,
);

router.get(
  '/student/:studentId/fee-details',
  protect,
  authorize('admin'),
  validateStudentIdParam,
  loadStudentFeeDetails,
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  validateFeeCollectionId,
  getFeeCollectionById,
);

router.post(
  '/',
  protect,
  authorize('admin'),
  validateCollectFee,
  collectFee,
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  validateFeeCollectionId,
  validateUpdateFeeCollection,
  updateFeeCollection,
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validateFeeCollectionId,
  deleteFeeCollection,
);

export default router;
