import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import authService from '../services/auth.service.js';
import Student from '../models/student.model.js';

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const result = await authService.adminLogin(email, password);

  return res.status(200).json({
    success: true,
    message: 'Admin login successful',
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user,
  });
});

const teacherLogin = asyncHandler(async (req, res) => {
  const { teacherId, password } = req.body;
  if (!teacherId || !password) {
    throw new ApiError(400, 'Teacher ID and password are required');
  }

  const result = await authService.teacherLogin(teacherId, password);

  return res.status(200).json({
    success: true,
    message: 'Teacher login successful',
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user,
  });
});

const studentLogin = asyncHandler(async (req, res) => {
  const { studentId, password } = req.body;
  if (!studentId || !password) {
    throw new ApiError(400, 'Student ID and password are required');
  }

  const result = await authService.studentLogin(studentId, password);

  return res.status(200).json({
    success: true,
    message: 'Student login successful',
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) {
    throw new ApiError(400, 'Refresh token is required');
  }

  const stored = await authService.verifyRefreshToken(token);
  const newAccessToken = authService.generateAccessToken(stored.user);
  const newRefreshToken = await authService.rotateRefreshToken(token);

  return res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (token) {
    await authService.revokeRefreshToken(token);
  }

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  let studentData = null;
  if (user.role === 'student' && user.referenceId) {
    studentData = await Student.findById(user.referenceId);
  }

  return res.status(200).json({
    success: true,
    message: 'User profile retrieved',
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email || undefined,
      loginId: user.loginId || undefined,
      role: user.role,
      teacherId: user.teacherId || undefined,
      studentId: studentData ? studentData.studentId : (user.studentId || undefined),
      isActive: user.isActive !== undefined ? user.isActive : true,
      lastLogin: user.lastLogin || undefined,
      createdAt: user.createdAt || undefined,
      student: studentData,
    },
  });
});

export {
  adminLogin,
  teacherLogin,
  studentLogin,
  refreshToken,
  logout,
  getMe,
};
