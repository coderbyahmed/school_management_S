import express from 'express';
import {
  adminLogin,
  teacherLogin,
  studentLogin,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
  sendChangeEmailOtp,
  verifyChangeEmailOtp,
  updatePassword,
} from '../controllers/auth.controller.js';
import {
  validateAdminLogin,
  validateTeacherLogin,
  validateStudentLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword,
} from '../validations/auth.validation.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public routes
router.post('/admin/login', validateAdminLogin, adminLogin);
router.post('/teacher/login', validateTeacherLogin, teacherLogin);
router.post('/student/login', validateStudentLogin, studentLogin);

// Refresh token
router.post('/refresh-token', refreshToken);

// Password reset flow (admin)
router.post('/admin/forgot-password', validateForgotPassword, forgotPassword);
router.post('/admin/verify-otp', validateVerifyOtp, verifyOtp);
router.post('/admin/reset-password', validateResetPassword, resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/send-email-otp', protect, authorize('admin'), sendChangeEmailOtp);
router.post('/verify-email-otp', protect, authorize('admin'), verifyChangeEmailOtp);
router.patch('/update-password', protect, authorize('admin'), updatePassword);

// RBAC examples (protected + role-gated)
router.get('/admin/dashboard', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Admin dashboard' });
});

router.get('/teacher/dashboard', protect, authorize('admin', 'teacher'), (req, res) => {
  res.json({ success: true, message: 'Teacher dashboard' });
});

router.get('/student/dashboard', protect, authorize('admin', 'teacher', 'student'), (req, res) => {
  res.json({ success: true, message: 'Student dashboard' });
});

export default router;
