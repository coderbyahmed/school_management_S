import express from 'express';
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  assignSubjectsToClass,
  getClassAssignments,
  assignSubjectsToTeacher,
  getTeacherAssignments,
} from '../controllers/subject.controller.js';
import { validateCreateSubject, validateUpdateSubject } from '../validations/subject.validation.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('admin'),
  getAllSubjects,
);

router.post(
  '/assign-class',
  protect,
  authorize('admin'),
  assignSubjectsToClass,
);

router.get(
  '/assign-class',
  protect,
  authorize('admin'),
  getClassAssignments,
);

router.post(
  '/assign-teacher',
  protect,
  authorize('admin'),
  assignSubjectsToTeacher,
);

router.get(
  '/assign-teacher',
  protect,
  authorize('admin'),
  getTeacherAssignments,
);

router.get(
  '/:id',
  protect,
  authorize('admin'),
  getSubjectById,
);

router.post(
  '/',
  protect,
  authorize('admin'),
  validateCreateSubject,
  createSubject,
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  validateUpdateSubject,
  updateSubject,
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteSubject,
);

export default router;
