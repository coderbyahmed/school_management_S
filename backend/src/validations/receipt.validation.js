import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError.js';

const validateReceiptId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !String(id).trim()) {
    throw new ApiError(400, 'Receipt ID is required');
  }
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid receipt ID');
  }
  next();
};

const validateGenerateReceipt = (req, res, next) => {
  if (!req.body) {
    throw new ApiError(400, 'Request body is required');
  }

  const { feeCollectionId } = req.body;
  if (!feeCollectionId || !String(feeCollectionId).trim()) {
    throw new ApiError(400, 'Fee collection ID is required');
  }
  if (!mongoose.isValidObjectId(feeCollectionId)) {
    throw new ApiError(400, 'Invalid fee collection ID');
  }

  req.body.feeCollectionId = String(feeCollectionId).trim();
  next();
};

const validateReceiptHistoryQuery = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined && (isNaN(Number(page)) || Number(page) < 1)) {
    throw new ApiError(400, 'Page must be a positive number');
  }
  if (limit !== undefined && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    throw new ApiError(400, 'Limit must be between 1 and 100');
  }

  next();
};

export {
  validateReceiptId,
  validateReceiptHistoryQuery,
  validateGenerateReceipt,
};
