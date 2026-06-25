import express from 'express';
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  duplicateTemplate,
  deleteTemplate,
} from '../controllers/timetableTemplate.controller.js';
import { validateCreateTemplate, validateUpdateTemplate } from '../validations/timetableTemplate.validation.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('admin'),
  getTemplates,
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  getTemplateById,
);

router.post(
  '/',
  protect,
  authorize('admin'),
  validateCreateTemplate,
  createTemplate,
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  validateUpdateTemplate,
  updateTemplate,
);

router.post(
  '/:id/duplicate',
  protect,
  authorize('admin'),
  duplicateTemplate,
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteTemplate,
);

export default router;
