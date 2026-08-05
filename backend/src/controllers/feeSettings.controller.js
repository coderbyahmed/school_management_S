import { asyncHandler } from '../utils/asyncHandler.js';
import feeSettingsService from '../services/feeSettings.service.js';

const getFeeSettings = asyncHandler(async (req, res) => {
  const settings = await feeSettingsService.getFeeSettings();

  return res.status(200).json({
    success: true,
    message: 'Fee settings fetched successfully',
    data: { settings },
  });
});

const updateFeeSettings = asyncHandler(async (req, res) => {
  const settings = await feeSettingsService.updateFeeSettings(req.body, req.user?._id);

  return res.status(200).json({
    success: true,
    message: 'Fee settings updated successfully',
    data: { settings },
  });
});

export {
  getFeeSettings,
  updateFeeSettings,
};
