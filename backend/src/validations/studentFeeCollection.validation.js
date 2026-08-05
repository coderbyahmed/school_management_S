import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError.js';

const PAYMENT_METHODS = ['Cash', 'Cheque', 'UPI', 'Bank Transfer'];

const parseAmount = (value, fieldName, { required = false } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ApiError(400, `${fieldName} is required`);
    }
    return undefined;
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new ApiError(400, `${fieldName} must be a valid number`);
  }
  if (num < 0) {
    throw new ApiError(400, `${fieldName} cannot be negative`);
  }
  return num;
};

const validateObjectId = (value, fieldName) => {
  if (!value || !String(value).trim()) {
    throw new ApiError(400, `${fieldName} is required`);
  }
  if (!mongoose.isValidObjectId(value)) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }
};

const validatePaymentMethod = (value) => {
  if (!value || !String(value).trim()) {
    throw new ApiError(400, 'Payment method is required');
  }
  const method = String(value).trim();
  if (!PAYMENT_METHODS.includes(method)) {
    throw new ApiError(400, `Invalid payment method. Allowed: ${PAYMENT_METHODS.join(', ')}`);
  }
  return method;
};

const validatePaymentDate = (value) => {
  if (!value) {
    throw new ApiError(400, 'Payment date is required');
  }
  const str = String(value).trim();
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(str);
  const date = dateOnly
    ? new Date(Number(str.slice(0, 4)), Number(str.slice(5, 7)) - 1, Number(str.slice(8, 10)))
    : new Date(str);
  if (isNaN(date.getTime())) {
    throw new ApiError(400, 'Invalid payment date');
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

const validateRemarks = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw new ApiError(400, 'Remarks must be a string');
  }
  if (value.trim().length > 500) {
    throw new ApiError(400, 'Remarks cannot exceed 500 characters');
  }
  return value.trim();
};

const validateCollectFee = (req, res, next) => {
  if (!req.body) {
    throw new ApiError(400, 'Request body is required');
  }

  const { studentId, paidAmount, discount, lateFine, paymentMethod, paymentDate, remarks } = req.body;

  validateObjectId(studentId, 'Student ID');
  req.body.studentId = String(studentId).trim();

  req.body.paidAmount = parseAmount(paidAmount, 'Paid amount', { required: true });
  req.body.discount = parseAmount(discount, 'Discount') ?? 0;
  req.body.lateFine = parseAmount(lateFine, 'Late fine') ?? 0;

  req.body.paymentMethod = validatePaymentMethod(paymentMethod);
  req.body.paymentDate = validatePaymentDate(paymentDate);

  if (remarks !== undefined && remarks !== null) {
    req.body.remarks = validateRemarks(remarks);
  }

  next();
};

const validateUpdateFeeCollection = (req, res, next) => {
  if (!req.body) {
    throw new ApiError(400, 'Request body is required');
  }

  const { paidAmount, discount, lateFine, paymentMethod, paymentDate, remarks } = req.body;

  if (paidAmount !== undefined) {
    req.body.paidAmount = parseAmount(paidAmount, 'Paid amount');
  }
  if (discount !== undefined) {
    req.body.discount = parseAmount(discount, 'Discount') ?? 0;
  }
  if (lateFine !== undefined) {
    req.body.lateFine = parseAmount(lateFine, 'Late fine') ?? 0;
  }
  if (paymentMethod !== undefined) {
    req.body.paymentMethod = validatePaymentMethod(paymentMethod);
  }
  if (paymentDate !== undefined) {
    req.body.paymentDate = validatePaymentDate(paymentDate);
  }
  if (remarks !== undefined && remarks !== null) {
    req.body.remarks = validateRemarks(remarks);
  }

  next();
};

const validateFeeCollectionId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !String(id).trim()) {
    throw new ApiError(400, 'Fee collection ID is required');
  }
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid fee collection ID');
  }
  next();
};

const validateStudentIdParam = (req, res, next) => {
  const { studentId } = req.params;
  if (!studentId || !String(studentId).trim()) {
    throw new ApiError(400, 'Student ID is required');
  }
  if (!mongoose.isValidObjectId(studentId)) {
    throw new ApiError(400, 'Invalid student ID');
  }
  next();
};

export {
  validateCollectFee,
  validateUpdateFeeCollection,
  validateFeeCollectionId,
  validateStudentIdParam,
};
