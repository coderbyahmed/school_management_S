import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toFullUrl, stripBaseUrl } from '../utils/imageUrl.js';
import { writeUploadFile } from '../middlewares/upload.middleware.js';
import { ApiError } from '../utils/apiError.js';
import User from '../models/user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      profileImage: toFullUrl(req, user.profileImage),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin || null,
      createdAt: user.createdAt,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;

  const updateData = {};

  if (fullName !== undefined) {
    const trimmed = (fullName || '').trim();
    if (trimmed.length < 3 || trimmed.length > 100) {
      throw new ApiError(400, 'Full name must be between 3 and 100 characters');
    }
    updateData.fullName = trimmed;
  }

  if (phone !== undefined) {
    const trimmed = (phone || '').trim();
    if (!/^03\d{9}$/.test(trimmed)) {
      throw new ApiError(400, 'Please enter a valid Pakistani mobile number (03XXXXXXXXX)');
    }
    updateData.phone = trimmed;
  }

  const userToUpdate = await User.findById(req.user._id);

  if (req.file) {
    if (userToUpdate.profileImage) {
      const oldRelPath = stripBaseUrl(userToUpdate.profileImage);
      const oldPath = path.resolve(__dirname, '../..', oldRelPath);
      try { if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); } catch (err) { console.error('Failed to delete old profile image', oldRelPath, err); }
    }
    const filename = writeUploadFile(req.file.buffer, 'admin-profile', req.file.originalname);
    updateData.profileImage = toFullUrl(req, `uploads/admin-profile/${filename}`);
  }

  if (updateData.fullName) userToUpdate.fullName = updateData.fullName;
  if (updateData.phone !== undefined) userToUpdate.phone = updateData.phone;
  if (updateData.profileImage) userToUpdate.profileImage = updateData.profileImage;
  await userToUpdate.save();

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: userToUpdate._id,
      profileImage: toFullUrl(req, userToUpdate.profileImage),
      fullName: userToUpdate.fullName,
      email: userToUpdate.email,
      phone: userToUpdate.phone || '',
      role: userToUpdate.role,
      isActive: userToUpdate.isActive,
      lastLogin: userToUpdate.lastLogin || null,
      createdAt: userToUpdate.createdAt,
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});
