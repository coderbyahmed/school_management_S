import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError.js';

const CLASSES = [
  'Montessori', 'Nursery', 'KG-1', 'KG-2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const REPORT_TYPES = ['all', 'paid', 'pending', 'partial', 'monthly', 'classWise', 'outstanding'];
const STATUSES = ['Paid', 'Partial', 'Pending'];
const PAYMENT_METHODS = ['Cash', 'Cheque', 'UPI', 'Bank Transfer'];

const REPORT_STATUS_BY_TYPE = {
  paid: 'Paid',
  pending: 'Pending',
  partial: 'Partial',
};

const validateAcademicYear = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const year = String(value).trim();
  if (!/^(202[5-9]|203[0-5])$/.test(year)) {
    throw new ApiError(400, 'Academic year must be between 2025 and 2035');
  }
  return year;
};

const validateClass = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const className = String(value).trim();
  if (!CLASSES.includes(className)) {
    throw new ApiError(400, `${className} is not a valid class`);
  }
  return className;
};

const validateMonth = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const month = Number(value);
  if (isNaN(month) || month < 1 || month > 12) {
    throw new ApiError(400, 'Month must be between 1 and 12');
  }
  return month;
};

const validateStatus = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const status = String(value).trim();
  if (!STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid status. Allowed: ${STATUSES.join(', ')}`);
  }
  return status;
};

const validatePaymentMethod = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const method = String(value).trim();
  if (!PAYMENT_METHODS.includes(method)) {
    throw new ApiError(400, `Invalid payment method. Allowed: ${PAYMENT_METHODS.join(', ')}`);
  }
  return method;
};

const validateDate = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }
  return date;
};

const validateStudentId = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (!mongoose.isValidObjectId(value)) {
    throw new ApiError(400, 'Invalid student ID');
  }
  return value;
};

const validatePageLimit = (value, fieldName, max) => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  if (isNaN(num) || num < 1) {
    throw new ApiError(400, `${fieldName} must be a positive number`);
  }
  if (num > max) {
    throw new ApiError(400, `${fieldName} must not exceed ${max}`);
  }
  return num;
};

const validateReportFilters = (req, res, next) => {
  const { reportType, status, startDate, endDate } = req.query;

  if (!reportType || !String(reportType).trim()) {
    throw new ApiError(400, 'Report type is required');
  }
  const type = String(reportType).trim();
  if (!REPORT_TYPES.includes(type)) {
    throw new ApiError(400, `Invalid report type. Allowed: ${REPORT_TYPES.join(', ')}`);
  }

  const requiredStatus = REPORT_STATUS_BY_TYPE[type];
  if (requiredStatus) {
    if (status !== undefined && status !== null && String(status).trim() !== '' && String(status).trim() !== requiredStatus) {
      throw new ApiError(400, `Status "${status}" contradicts report type "${type}" which requires status "${requiredStatus}"`);
    }
  }

  const clean = {};
  clean.reportType = type;
  clean.academicYear = validateAcademicYear(req.query.academicYear);
  clean.class = validateClass(req.query.class);
  clean.month = validateMonth(req.query.month);
  clean.status = validateStatus(req.query.status);
  clean.paymentMethod = validatePaymentMethod(req.query.paymentMethod);
  clean.startDate = validateDate(startDate, 'start date');
  clean.endDate = validateDate(endDate, 'end date');
  clean.studentId = validateStudentId(req.query.studentId);
  clean.receiptNumber = req.query.receiptNumber && String(req.query.receiptNumber).trim() ? String(req.query.receiptNumber).trim() : undefined;
  clean.search = req.query.search && String(req.query.search).trim() ? String(req.query.search).trim() : undefined;

  if (clean.month && (clean.startDate || clean.endDate)) {
    throw new ApiError(400, 'Month filter cannot be combined with a date range');
  }

  if (clean.startDate && clean.endDate && clean.startDate > clean.endDate) {
    throw new ApiError(400, 'Start date cannot be after end date');
  }

  clean.page = validatePageLimit(req.query.page, 'Page', 100000);
  clean.limit = validatePageLimit(req.query.limit, 'Limit', 1000);

  req.reportFilters = clean;
  next();
};

export {
  validateReportFilters,
  REPORT_TYPES,
};
