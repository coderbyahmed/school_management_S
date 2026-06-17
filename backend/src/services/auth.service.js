import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import { ApiError } from '../utils/apiError.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const generateRefreshTokenValue = () => {
  return crypto.randomBytes(40).toString('hex');
};

const createRefreshToken = async (userId) => {
  const token = generateRefreshTokenValue();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({ token, user: userId, expiresAt });

  return token;
};

const verifyRefreshToken = async (token) => {
  const stored = await RefreshToken.findOne({ token, revoked: false });
  if (!stored) {
    throw new ApiError(401, 'Invalid refresh token');
  }
  if (stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Refresh token expired');
  }
  return stored;
};

const revokeRefreshToken = async (token) => {
  await RefreshToken.updateOne({ token }, { revoked: true });
};

const rotateRefreshToken = async (oldToken) => {
  const stored = await verifyRefreshToken(oldToken);
  const newToken = generateRefreshTokenValue();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({ token: newToken, user: stored.user, expiresAt });
  await RefreshToken.updateOne({ _id: stored._id }, { revoked: true, replacedBy: newToken });

  return newToken;
};

const buildUserResponse = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  teacherId: user.teacherId || undefined,
  studentId: user.studentId || undefined,
});

const adminLogin = async (email, password) => {
  const user = await User.findOne({ email, role: 'admin' }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id);

  return { user: buildUserResponse(loggedInUser), accessToken, refreshToken };
};

const teacherLogin = async (teacherId, password) => {
  const user = await User.findOne({ teacherId, role: 'teacher' }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid teacher ID or password');
  }

  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id);

  return { user: buildUserResponse(loggedInUser), accessToken, refreshToken };
};

const studentLogin = async (studentId, password) => {
  const user = await User.findOne({ studentId, role: 'student' }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid student ID or password');
  }

  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id);

  return { user: buildUserResponse(loggedInUser), accessToken, refreshToken };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) {
    throw new ApiError(404, 'Admin with this email does not exist');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  user.isOtpVerified = false;
  await user.save();

  console.log(`[DEVELOPMENT] OTP for ${email}: ${otp}`);

  return true;
};

const verifyOtp = async (email, otp) => {
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) {
    throw new ApiError(404, 'Admin with this email does not exist');
  }

  if (user.otp !== otp || user.otpExpiry < new Date()) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  user.isOtpVerified = true;
  await user.save();

  return true;
};

const resetPassword = async (email, newPassword) => {
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) {
    throw new ApiError(404, 'Admin with this email does not exist');
  }

  if (!user.isOtpVerified) {
    throw new ApiError(400, 'OTP not verified');
  }

  user.password = newPassword;
  user.otp = null;
  user.otpExpiry = null;
  user.isOtpVerified = false;
  await user.save();

  return true;
};

export default {
  adminLogin,
  teacherLogin,
  studentLogin,
  forgotPassword,
  verifyOtp,
  resetPassword,
  verifyRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
  generateAccessToken,
};
