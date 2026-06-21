import { ApiError } from '../utils/apiError.js';

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

export {
  validateAdminLogin,
  validateTeacherLogin,
  validateStudentLogin,
};
