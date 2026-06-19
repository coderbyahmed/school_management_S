import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import authService from '../services/auth.service.js';

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

  return res.status(200).json({
    success: true,
    message: 'User profile retrieved',
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      profileImage: user.profileImage || '',
      role: user.role,
      teacherId: user.teacherId || undefined,
      studentId: user.studentId || undefined,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  await authService.forgotPassword(email);

  return res.status(200).json({
    success: true,
    message: 'OTP sent to your email (check terminal)',
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }

  await authService.verifyOtp(email, otp);

  return res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    throw new ApiError(400, 'All fields are required');
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  await authService.resetPassword(email, newPassword);

  return res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});

export {
  adminLogin,
  teacherLogin,
  studentLogin,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
