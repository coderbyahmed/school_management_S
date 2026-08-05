import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError.js';

const CLASSES = [
  'Montessori', 'Nursery', 'KG-1', 'KG-2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const STATUSES = ['Active', 'Inactive'];

const ACADEMIC_YEAR_REGEX = /^(202[5-9]|203[0-5])$/;

const parseAmount = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  if (isNaN(num)) {
    throw new ApiError(400, `${fieldName} must be a valid number`);
  }
  if (num < 0) {
    throw new ApiError(400, `${fieldName} cannot be negative`);
  }
  return num;
};

const validateCreateFeeStructure = (req, res, next) => {
  if (!req.body) {
    throw new ApiError(400, 'Request body is required');
  }
  const { academicYear, class: className, monthlyFee, admissionFee, examFee, otherCharges, discount, lateFine, status, notes } = req.body;

  if (!academicYear || !academicYear.trim()) {
    throw new ApiError(400, 'Academic year is required');
  }
  if (!ACADEMIC_YEAR_REGEX.test(academicYear.trim())) {
    throw new ApiError(400, 'Invalid academic year format. Use a valid year (e.g. 2025)');
  }

  if (!className || !className.trim()) {
    throw new ApiError(400, 'Class is required');
  }
  if (!CLASSES.includes(className.trim())) {
    throw new ApiError(400, `Invalid class. Allowed: ${CLASSES.join(', ')}`);
  }

  if (monthlyFee === undefined || monthlyFee === null || monthlyFee === '') {
    throw new ApiError(400, 'Monthly fee is required');
  }

  req.body.academicYear = academicYear.trim();
  req.body.class = className.trim();
  req.body.monthlyFee = parseAmount(monthlyFee, 'Monthly fee');
  req.body.admissionFee = parseAmount(admissionFee, 'Admission fee') ?? 0;
  req.body.examFee = parseAmount(examFee, 'Exam fee') ?? 0;
  req.body.otherCharges = parseAmount(otherCharges, 'Other charges') ?? 0;
  req.body.discount = parseAmount(discount, 'Discount') ?? 0;
  req.body.lateFine = parseAmount(lateFine, 'Late fine') ?? 0;

  if (status !== undefined && status !== null && status !== '') {
    if (!STATUSES.includes(status)) {
      throw new ApiError(400, `Invalid status. Allowed: ${STATUSES.join(', ')}`);
    }
    req.body.status = status;
  }

  if (notes !== undefined && notes !== null) {
    if (typeof notes !== 'string') {
      throw new ApiError(400, 'Notes must be a string');
    }
    if (notes.trim().length > 500) {
      throw new ApiError(400, 'Notes cannot exceed 500 characters');
    }
    req.body.notes = notes.trim();
  }

  next();
};

const validateUpdateFeeStructure = (req, res, next) => {
  if (!req.body) {
    throw new ApiError(400, 'Request body is required');
  }
  const { academicYear, class: className, monthlyFee, admissionFee, examFee, otherCharges, discount, lateFine, status, notes } = req.body;

  if (academicYear !== undefined) {
    if (!academicYear.trim()) {
      throw new ApiError(400, 'Academic year cannot be empty');
    }
    if (!ACADEMIC_YEAR_REGEX.test(academicYear.trim())) {
      throw new ApiError(400, 'Invalid academic year format. Use a valid year (e.g. 2025)');
    }
    req.body.academicYear = academicYear.trim();
  }

  if (className !== undefined) {
    if (!className.trim()) {
      throw new ApiError(400, 'Class cannot be empty');
    }
    if (!CLASSES.includes(className.trim())) {
      throw new ApiError(400, `Invalid class. Allowed: ${CLASSES.join(', ')}`);
    }
    req.body.class = className.trim();
  }

  if (monthlyFee !== undefined) {
    req.body.monthlyFee = parseAmount(monthlyFee, 'Monthly fee');
  }

  const optionalAmounts = [
    ['admissionFee', 'Admission fee'],
    ['examFee', 'Exam fee'],
    ['otherCharges', 'Other charges'],
    ['discount', 'Discount'],
    ['lateFine', 'Late fine'],
  ];
  optionalAmounts.forEach(([field, label]) => {
    if (req.body[field] !== undefined) {
      req.body[field] = parseAmount(req.body[field], label) ?? 0;
    }
  });

  if (status !== undefined) {
    if (status !== null && status !== '') {
      if (!STATUSES.includes(status)) {
        throw new ApiError(400, `Invalid status. Allowed: ${STATUSES.join(', ')}`);
      }
      req.body.status = status;
    }
  }

  if (notes !== undefined && notes !== null) {
    if (typeof notes !== 'string') {
      throw new ApiError(400, 'Notes must be a string');
    }
    if (notes.trim().length > 500) {
      throw new ApiError(400, 'Notes cannot exceed 500 characters');
    }
    req.body.notes = notes.trim();
  }

  next();
};

const validateFeeStructureId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !id.trim()) {
    throw new ApiError(400, 'Fee structure ID is required');
  }
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid fee structure ID');
  }
  next();
};

export { validateCreateFeeStructure, validateUpdateFeeStructure, validateFeeStructureId };
