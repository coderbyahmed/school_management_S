import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { asyncHandler } from '../utils/asyncHandler.js';
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
      profileImage: user.profileImage || '',
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

  if (req.file) {
    const user = await User.findById(req.user._id);
    if (user.profileImage) {
      const oldPath = path.resolve(__dirname, '../..', user.profileImage);
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch {
        // silently ignore
      }
    }
    updateData.profileImage = `uploads/admin-profile/${req.file.filename}`;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: updatedUser._id,
      profileImage: updatedUser.profileImage || '',
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      lastLogin: updatedUser.lastLogin || null,
      createdAt: updatedUser.createdAt,
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
