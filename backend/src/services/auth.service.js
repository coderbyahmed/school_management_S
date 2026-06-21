import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import { ApiError } from '../utils/apiError.js';
import sendOtpEmail from '../utils/email.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const OTP_VALIDITY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 3;
const OTP_MAX_REQUESTS = 3;
const OTP_REQUEST_WINDOW_MINUTES = 10;

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
  if (!user) {
    throw new ApiError(401, 'Email not found');
  }
  if (!(await user.comparePassword(password))) {
    throw new ApiError(401, 'Incorrect password');
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
  if (!user) {
    throw new ApiError(401, 'Teacher ID not found');
  }
  if (!(await user.comparePassword(password))) {
    throw new ApiError(401, 'Incorrect password');
  }

  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id);

  return { user: buildUserResponse(loggedInUser), accessToken, refreshToken };
};

const studentLogin = async (studentId, password) => {
  const user = await User.findOne({ loginId: studentId, role: 'student' }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Student ID not found');
  }
  if (!(await user.comparePassword(password))) {
    throw new ApiError(401, 'Incorrect password');
  }

  const student = user.referenceId ? await Student.findById(user.referenceId) : null;

  const accessToken = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      loginId: user.loginId,
      role: 'student',
      studentId: student ? student.studentId : user.loginId,
      student: student || null,
    },
    accessToken,
    refreshToken,
  };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) {
    throw new ApiError(404, 'Admin with this email does not exist');
  }

  // Resend lock: if a valid OTP already exists, block
  if (user.otpExpiry && user.otpExpiry > new Date() && !user.isOtpVerified) {
    const remainingMs = user.otpExpiry.getTime() - Date.now();
    const remainingSec = Math.ceil(remainingMs / 1000);
    throw new ApiError(
      429,
      `Please wait until the 5-minute OTP timer ends before requesting a new OTP. (${remainingSec}s remaining)`
    );
  }

  // Rate limiting: max 3 OTP requests per 10 minutes
  const windowStart = new Date(Date.now() - OTP_REQUEST_WINDOW_MINUTES * 60 * 1000);
  const recentRequests = (user.otpRequestedAt || []).filter((t) => t > windowStart);
  if (recentRequests.length >= OTP_MAX_REQUESTS) {
    throw new ApiError(429, 'Too many OTP requests. Please try again later.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiryMs = OTP_VALIDITY_MINUTES * 60 * 1000;
  const otpExpiry = new Date(Date.now() + expiryMs);

  const salt = await bcrypt.genSalt(10);
  user.otp = await bcrypt.hash(otp, salt);
  user.otpExpiry = otpExpiry;
  user.isOtpVerified = false;
  user.otpAttempts = 0;
  user.otpRequestedAt = [...(recentRequests.length > 0 ? recentRequests : []), new Date()];
  await user.save();

  await sendOtpEmail(email, otp);

  return { otpExpiry: otpExpiry.getTime() };
};

const verifyOtp = async (email, otp) => {
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) {
    throw new ApiError(404, 'Admin with this email does not exist');
  }

  if (user.isOtpVerified) {
    return true;
  }

  if (!user.otp || !user.otpExpiry) {
    throw new ApiError(400, 'No OTP requested. Please request a new one.');
  }

  if (user.otpExpiry < new Date()) {
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    user.otpRequestedAt = [];
    await user.save();
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    user.otpRequestedAt = [];
    await user.save();
    throw new ApiError(429, 'Too many failed attempts. Please request a new OTP.');
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    user.otpAttempts += 1;
    await user.save();
    throw new ApiError(400, 'Invalid OTP');
  }

  user.isOtpVerified = true;
  user.otpAttempts = 0;
  await user.save();

  return true;
};

const resetPassword = async (email, newPassword) => {
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) {
    throw new ApiError(404, 'Admin with this email does not exist');
  }

  if (!user.isOtpVerified) {
    throw new ApiError(400, 'OTP not verified. Please verify your OTP first.');
  }

  user.password = newPassword;
  user.otp = null;
  user.otpExpiry = null;
  user.isOtpVerified = false;
  user.otpAttempts = 0;
  user.otpRequestedAt = [];
  await user.save();

  return true;
};

const sendEmailOtp = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Resend lock: if a valid OTP already exists, block
  if (user.otpExpiry && user.otpExpiry > new Date() && !user.isOtpVerified) {
    const remainingMs = user.otpExpiry.getTime() - Date.now();
    const remainingSec = Math.ceil(remainingMs / 1000);
    throw new ApiError(
      429,
      `Please wait ${remainingSec}s before requesting a new OTP.`
    );
  }

  // Rate limiting: max 3 OTP requests per 10 minutes
  const windowStart = new Date(Date.now() - OTP_REQUEST_WINDOW_MINUTES * 60 * 1000);
  const recentRequests = (user.otpRequestedAt || []).filter((t) => t > windowStart);
  if (recentRequests.length >= OTP_MAX_REQUESTS) {
    throw new ApiError(429, 'Too many OTP requests. Please try again later.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiryMs = OTP_VALIDITY_MINUTES * 60 * 1000;
  const otpExpiry = new Date(Date.now() + expiryMs);

  const salt = await bcrypt.genSalt(10);
  user.otp = await bcrypt.hash(otp, salt);
  user.otpExpiry = otpExpiry;
  user.isOtpVerified = false;
  user.otpAttempts = 0;
  user.otpRequestedAt = [...(recentRequests.length > 0 ? recentRequests : []), new Date()];
  await user.save();

  await sendOtpEmail(user.email, otp);

  return { otpExpiry: otpExpiry.getTime() };
};

const verifyEmailOtp = async (userId, otp) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isOtpVerified) {
    return true;
  }

  if (!user.otp || !user.otpExpiry) {
    throw new ApiError(400, 'No OTP requested. Please request a new one.');
  }

  if (user.otpExpiry < new Date()) {
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    user.otpRequestedAt = [];
    await user.save();
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    user.otpRequestedAt = [];
    await user.save();
    throw new ApiError(429, 'Too many failed attempts. Please request a new OTP.');
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    user.otpAttempts += 1;
    await user.save();
    throw new ApiError(400, 'Invalid OTP');
  }

  user.isOtpVerified = true;
  user.otpAttempts = 0;
  await user.save();

  return true;
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.password = newPassword;
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
  sendEmailOtp,
  verifyEmailOtp,
  updatePassword,
  verifyRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
  generateAccessToken,
};
