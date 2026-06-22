import express from 'express';
import { getStudentPromotions, deleteStudentPromotion } from '../controllers/studentPromotion.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('admin'),
  getStudentPromotions,
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteStudentPromotion,
);

export default router;
