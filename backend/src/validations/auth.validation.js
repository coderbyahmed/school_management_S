import { ApiError } from '../utils/apiError.js';

const validateTeacherChangePassword = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !currentPassword.trim()) {
    throw new ApiError(400, 'Current password is required');
  }

  if (!newPassword || !newPassword.trim()) {
    throw new ApiError(400, 'New password is required');
  }

  if (!confirmPassword || !confirmPassword.trim()) {
    throw new ApiError(400, 'Confirm password is required');
  }

  if (/\s/.test(newPassword)) {
    throw new ApiError(400, 'Spaces are not allowed in the password');
  }

  if (newPassword.length > 10) {
    throw new ApiError(400, 'Password cannot be more than 10 characters');
  }

  if (!/[a-zA-Z]/.test(newPassword)) {
    throw new ApiError(400, 'Password must contain at least one letter');
  }

  if (!/[0-9]/.test(newPassword)) {
    throw new ApiError(400, 'Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
    throw new ApiError(400, 'Password must contain at least one special character');
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  next();
};

const validateAdminLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email format');
  }
  next();
};

const validateTeacherLogin = (req, res, next) => {
  const { teacherId, password } = req.body;
  if (!teacherId || !password) {
    throw new ApiError(400, 'Teacher ID and password are required');
  }
  next();
};

const validateStudentLogin = (req, res, next) => {
  const { studentId, password } = req.body;
  if (!studentId || !password) {
    throw new ApiError(400, 'Student ID and password are required');
  }
  next();
};

const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }
  next();
};

const validateVerifyOtp = (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }
  next();
};

const validateResetPassword = (req, res, next) => {
  const { email, newPassword, confirmPassword } = req.body;
  if (!email || !newPassword || !confirmPassword) {
    throw new ApiError(400, 'All fields are required');
  }
  if (newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }
  next();
};

export {
  validateAdminLogin,
  validateTeacherLogin,
  validateStudentLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword,
  validateTeacherChangePassword,
};
