import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import EmailChangeRequest from '../models/emailChangeRequest.model.js';
import PasswordChangeRequest from '../models/passwordChangeRequest.model.js';
import { ApiError } from '../utils/apiError.js';
import { sendOtpEmail, sendEmailChangeOtp, sendPasswordChangeOtp } from '../utils/email.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const timing = process.env.NODE_ENV !== 'production';

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
  const user = await User.findOne({ loginId: teacherId, role: 'teacher' }).select('+password');
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
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact the administration.');
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
  if (timing) console.time('forgotPassword');
  try {
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      throw new ApiError(404, 'Admin with this email does not exist');
    }

    if (user.otpExpiry && user.otpExpiry > new Date() && !user.isOtpVerified) {
      const remainingMs = user.otpExpiry.getTime() - Date.now();
      const remainingSec = Math.ceil(remainingMs / 1000);
      throw new ApiError(
        429,
        `Please wait until the 5-minute OTP timer ends before requesting a new OTP. (${remainingSec}s remaining)`
      );
    }

    const windowStart = new Date(Date.now() - OTP_REQUEST_WINDOW_MINUTES * 60 * 1000);
    const recentRequests = (user.otpRequestedAt || []).filter((t) => t > windowStart);
    if (recentRequests.length >= OTP_MAX_REQUESTS) {
      throw new ApiError(429, 'Too many OTP requests. Please try again later.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000);

    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = otpExpiry;
    user.isOtpVerified = false;
    user.otpAttempts = 0;
    user.otpRequestedAt = [...(recentRequests.length > 0 ? recentRequests : []), new Date()];
    await user.save();

    sendOtpEmail(email, otp).catch((err) => console.error('ForgotPassword:email send failed', err));

    return { otpExpiry: otpExpiry.getTime() };
  } finally {
    if (timing) console.timeEnd('forgotPassword');
  }
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
    await User.updateOne(
      { _id: user._id },
      { $set: { otp: null, otpExpiry: null, otpAttempts: 0, otpRequestedAt: [] } }
    );
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
    await User.updateOne(
      { _id: user._id },
      { $set: { otp: null, otpExpiry: null, otpAttempts: 0, otpRequestedAt: [] } }
    );
    throw new ApiError(429, 'Too many failed attempts. Please request a new OTP.');
  }

  const isMatch = await bcrypt.compare(otp, user.otp);
  if (!isMatch) {
    await User.updateOne({ _id: user._id }, { $inc: { otpAttempts: 1 } });
    throw new ApiError(400, 'Invalid OTP');
  }

  await User.updateOne(
    { _id: user._id },
    { $set: { isOtpVerified: true, otpAttempts: 0 } }
  );

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

const verifyEmailPassword = async (userId, currentPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  return true;
};

const sendEmailChangeOtpService = async (userId, newEmail, meta = {}) => {
  if (timing) console.time('sendEmailChangeOtp');
  try {
    const [user, existingUser, existingRequest] = await Promise.all([
      User.findById(userId),
      User.findOne({ email: newEmail, _id: { $ne: userId } }),
      EmailChangeRequest.findOne({
        user: userId,
        status: { $in: ['PENDING', 'OTP_PENDING'] },
        otpExpiry: { $gt: new Date() },
      }),
    ]);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (existingUser) {
      throw new ApiError(400, 'Email is already in use by another account');
    }

    if (existingRequest) {
      const remainingMs = existingRequest.otpExpiry.getTime() - Date.now();
      const remainingSec = Math.ceil(remainingMs / 1000);
      throw new ApiError(
        429,
        `An active OTP already exists. Please wait ${remainingSec}s before requesting a new one.`
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000);

    // Parallel: hash OTP and mark old requests as FAILED
    const [hashedOtp] = await Promise.all([
      bcrypt.hash(otp, 10),
      EmailChangeRequest.updateMany(
        { user: userId, status: { $in: ['PENDING', 'OTP_PENDING', 'VERIFIED'] } },
        { $set: { status: 'FAILED', step: 'OTP_FAILED', reason: 'Replaced by new request' } }
      ),
    ]);

    await EmailChangeRequest.create({
      user: userId,
      oldEmail: user.email,
      newEmail,
      otp: hashedOtp,
      otpExpiry,
      attempts: 0,
      status: 'OTP_PENDING',
      step: 'OTP_SENT',
      ipAddress: meta.ipAddress || null,
      userAgent: meta.userAgent || null,
    });

    sendEmailChangeOtp(newEmail, otp).catch((err) => console.error('sendEmailChangeOtp:email send failed', err));

    return { otpExpiry: otpExpiry.getTime() };
  } finally {
    if (timing) console.timeEnd('sendEmailChangeOtp');
  }
};

const verifyEmailChangeOtpService = async (userId, otp, meta = {}) => {
  const request = await EmailChangeRequest.findOne({
    user: userId,
    status: { $in: ['PENDING', 'OTP_PENDING'] },
  });

  if (!request) {
    throw new ApiError(400, 'No email change request found. Please start over.');
  }

  if (request.verified) {
    return true;
  }

  if (!request.otp || !request.otpExpiry) {
    request.status = 'FAILED';
    request.step = 'OTP_FAILED';
    request.reason = 'No OTP or expiry found';
    await request.save();
    throw new ApiError(400, 'No OTP requested. Please request a new one.');
  }

  if (request.otpExpiry < new Date()) {
    request.status = 'FAILED';
    request.step = 'OTP_FAILED';
    request.reason = 'OTP expired';
    request.attempts += 1;
    await request.save();
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  if (request.attempts >= OTP_MAX_ATTEMPTS) {
    request.status = 'FAILED';
    request.step = 'OTP_FAILED';
    request.reason = 'Max attempts exceeded';
    await request.save();
    throw new ApiError(429, 'Too many failed attempts. Please request a new OTP.');
  }

  const isMatch = await bcrypt.compare(otp, request.otp);
  if (!isMatch) {
    request.attempts += 1;
    await request.save();
    throw new ApiError(400, 'Invalid OTP');
  }

  // Set all final fields, then fetch user and save both in parallel
  request.verified = true;
  request.status = 'SUCCESS';
  request.step = 'COMPLETED';
  request.verifiedAt = new Date();
  request.completedAt = new Date();
  request.ipAddress = meta.ipAddress || request.ipAddress;
  request.userAgent = meta.userAgent || request.userAgent;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.email = request.newEmail;
  await Promise.all([user.save(), request.save()]);

  return true;
};

const initiatePasswordChange = async (userId, currentPassword, meta = {}) => {
  if (timing) console.time('initiatePasswordChange');
  try {
    const [user, existingRequest] = await Promise.all([
      User.findById(userId).select('+password'),
      PasswordChangeRequest.findOne({
        user: userId,
        status: { $in: ['PENDING', 'OTP_PENDING'] },
        otpExpiry: { $gt: new Date() },
      }),
    ]);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!(await user.comparePassword(currentPassword))) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    if (existingRequest) {
      const remainingMs = existingRequest.otpExpiry.getTime() - Date.now();
      const remainingSec = Math.ceil(remainingMs / 1000);
      throw new ApiError(
        429,
        `An active OTP already exists. Please wait ${remainingSec}s before requesting a new one.`
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000);

    // Parallel: hash OTP and mark old requests as FAILED
    const [hashedOtp] = await Promise.all([
      bcrypt.hash(otp, 10),
      PasswordChangeRequest.updateMany(
        { user: userId, status: { $in: ['PENDING', 'OTP_PENDING', 'VERIFIED'] } },
        { $set: { status: 'FAILED', step: 'OTP_FAILED', reason: 'Replaced by new request' } }
      ),
    ]);

    await PasswordChangeRequest.create({
      user: userId,
      email: user.email,
      passwordVerified: true,
      otp: hashedOtp,
      otpExpiry,
      attempts: 0,
      status: 'OTP_PENDING',
      step: 'OTP_SENT',
      ipAddress: meta.ipAddress || null,
      userAgent: meta.userAgent || null,
    });

    sendPasswordChangeOtp(user.email, otp).catch((err) => console.error('initiatePasswordChange:email send failed', err));

    return { otpExpiry: otpExpiry.getTime() };
  } finally {
    if (timing) console.timeEnd('initiatePasswordChange');
  }
};

const verifyPasswordChangeOtpService = async (userId, otp, meta = {}) => {
  const request = await PasswordChangeRequest.findOne({
    user: userId,
    status: { $in: ['PENDING', 'OTP_PENDING'] },
  });

  if (!request) {
    throw new ApiError(400, 'No password change request found. Please start over.');
  }

  if (request.verified) {
    return true;
  }

  if (!request.otp || !request.otpExpiry) {
    request.status = 'FAILED';
    request.step = 'OTP_FAILED';
    request.reason = 'No OTP or expiry found';
    await request.save();
    throw new ApiError(400, 'No OTP requested. Please request a new one.');
  }

  if (request.otpExpiry < new Date()) {
    request.status = 'FAILED';
    request.step = 'OTP_FAILED';
    request.reason = 'OTP expired';
    request.attempts += 1;
    await request.save();
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  if (request.attempts >= OTP_MAX_ATTEMPTS) {
    request.status = 'FAILED';
    request.step = 'OTP_FAILED';
    request.reason = 'Max attempts exceeded';
    await request.save();
    throw new ApiError(429, 'Too many failed attempts. Please request a new OTP.');
  }

  const isMatch = await bcrypt.compare(otp, request.otp);
  if (!isMatch) {
    request.attempts += 1;
    await request.save();
    throw new ApiError(400, 'Invalid OTP');
  }

  request.verified = true;
  request.status = 'VERIFIED';
  request.step = 'OTP_VERIFIED';
  request.verifiedAt = new Date();
  request.ipAddress = meta.ipAddress || request.ipAddress;
  request.userAgent = meta.userAgent || request.userAgent;
  await request.save();

  return true;
};

const completePasswordChange = async (userId, newPassword, meta = {}) => {
  const request = await PasswordChangeRequest.findOne({
    user: userId,
    status: 'VERIFIED',
    step: 'OTP_VERIFIED',
  });

  if (!request) {
    throw new ApiError(400, 'OTP not verified. Please verify your OTP first.');
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.password = newPassword;
  request.status = 'SUCCESS';
  request.step = 'COMPLETED';
  request.completedAt = new Date();
  request.ipAddress = meta.ipAddress || request.ipAddress;
  request.userAgent = meta.userAgent || request.userAgent;

  await Promise.all([user.save(), request.save()]);

  return true;
};

export default {
  adminLogin,
  teacherLogin,
  studentLogin,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updatePassword,
  verifyEmailPassword,
  sendEmailChangeOtp: sendEmailChangeOtpService,
  verifyEmailChangeOtp: verifyEmailChangeOtpService,
  initiatePasswordChange,
  verifyPasswordChangeOtp: verifyPasswordChangeOtpService,
  completePasswordChange,
  verifyRefreshToken,
  revokeRefreshToken,
  rotateRefreshToken,
  generateAccessToken,
};
