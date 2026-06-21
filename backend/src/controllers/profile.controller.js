import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import User from '../models/user.model.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName } = req.body;

  if (!fullName || !fullName.trim()) {
    throw new ApiError(400, 'Full name is required');
  }

  const updateData = { fullName: fullName.trim() };

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
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
