import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import userAccountsService from '../services/userAccounts.service.js';

const getAllAccounts = asyncHandler(async (req, res) => {
  const { search, type, status, page, limit } = req.query;

  const result = await userAccountsService.getAllAccounts({ search, type, status, page, limit });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

const getAccountByLoginId = asyncHandler(async (req, res) => {
  const { loginId } = req.params;
  if (!loginId) {
    throw new ApiError(400, 'Login ID is required');
  }

  const account = await userAccountsService.getAccountByLoginId(loginId);

  return res.status(200).json({
    success: true,
    data: account,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { targetId, targetType, newPassword } = req.body;

  if (!targetId || !targetType || !newPassword) {
    throw new ApiError(400, 'Target ID, type, and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  await userAccountsService.resetPassword(targetId, targetType, newPassword, req.user._id);

  return res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});

const getPasswordManagementData = asyncHandler(async (req, res) => {
  const { search, type, page, limit } = req.query;

  const result = await userAccountsService.getPasswordManagementData({ search, type, page, limit });

  return res.status(200).json({
    success: true,
    data: result,
  });
});

export {
  getAllAccounts,
  getAccountByLoginId,
  resetPassword,
  getPasswordManagementData,
};
