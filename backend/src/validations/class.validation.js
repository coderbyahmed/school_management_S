import { ApiError } from '../utils/apiError.js';

const VALID_CLASS_NAMES = [
  'Montessori', 'Nursery', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const ACADEMIC_YEAR_REGEX = /^\d{4}$/;

const validateCreateClass = (req, res, next) => {
  const { className, academicYear, status, monthlyFee, admissionFee, examFee } = req.body;

  if (!className || !className.trim()) {
    throw new ApiError(400, 'Class name is required');
  }

  if (!VALID_CLASS_NAMES.includes(className.trim())) {
    throw new ApiError(400, `Invalid class name. Allowed values: ${VALID_CLASS_NAMES.join(', ')}`);
  }

  if (!academicYear || !academicYear.trim()) {
    throw new ApiError(400, 'Academic year is required');
  }

  if (!ACADEMIC_YEAR_REGEX.test(academicYear.trim())) {
    throw new ApiError(400, 'Invalid academic year format. Use a valid year (e.g. 2025)');
  }

  if (monthlyFee !== undefined && monthlyFee !== '' && (isNaN(Number(monthlyFee)) || Number(monthlyFee) < 0)) {
    throw new ApiError(400, 'Monthly fee must be a non-negative number');
  }

  if (admissionFee !== undefined && admissionFee !== '' && (isNaN(Number(admissionFee)) || Number(admissionFee) < 0)) {
    throw new ApiError(400, 'Admission fee must be a non-negative number');
  }

  if (examFee !== undefined && examFee !== '' && (isNaN(Number(examFee)) || Number(examFee) < 0)) {
    throw new ApiError(400, 'Exam fee must be a non-negative number');
  }

  if (!status || !status.trim()) {
    throw new ApiError(400, 'Status is required');
  }

  const normalizedStatus = status.trim();
  const validStatuses = ['Active', 'Inactive'];

  if (!validStatuses.includes(normalizedStatus)) {
    throw new ApiError(400, 'Status must be either Active or Inactive');
  }

  req.body.className = className.trim();
  req.body.academicYear = academicYear.trim();
  req.body.monthlyFee = monthlyFee !== undefined && monthlyFee !== '' ? Number(monthlyFee) : 0;
  req.body.admissionFee = admissionFee !== undefined && admissionFee !== '' ? Number(admissionFee) : 0;
  req.body.examFee = examFee !== undefined && examFee !== '' ? Number(examFee) : 0;
  req.body.status = normalizedStatus;

  next();
};

const validateUpdateClass = (req, res, next) => {
  const { className, academicYear, status, monthlyFee, admissionFee, examFee } = req.body;

  if (!className && !academicYear && !status && monthlyFee === undefined && admissionFee === undefined && examFee === undefined) {
    throw new ApiError(400, 'At least one field (className, academicYear, monthlyFee, admissionFee, examFee, status) must be provided');
  }

  if (className !== undefined) {
    if (!className.trim()) {
      throw new ApiError(400, 'Class name cannot be empty');
    }

    if (!VALID_CLASS_NAMES.includes(className.trim())) {
      throw new ApiError(400, `Invalid class name. Allowed values: ${VALID_CLASS_NAMES.join(', ')}`);
    }

    req.body.className = className.trim();
  }

  if (academicYear !== undefined) {
    if (!academicYear.trim()) {
      throw new ApiError(400, 'Academic year cannot be empty');
    }

    if (!ACADEMIC_YEAR_REGEX.test(academicYear.trim())) {
      throw new ApiError(400, 'Invalid academic year format. Use a valid year (e.g. 2025)');
    }

    req.body.academicYear = academicYear.trim();
  }

  if (status !== undefined) {
    if (!status.trim()) {
      throw new ApiError(400, 'Status cannot be empty');
    }

    const normalizedStatus = status.trim();
    const validStatuses = ['Active', 'Inactive'];

    if (!validStatuses.includes(normalizedStatus)) {
      throw new ApiError(400, 'Status must be either Active or Inactive');
    }

    req.body.status = normalizedStatus;
  }

  if (monthlyFee !== undefined) {
    if (monthlyFee !== '' && (isNaN(Number(monthlyFee)) || Number(monthlyFee) < 0)) {
      throw new ApiError(400, 'Monthly fee must be a non-negative number');
    }
    req.body.monthlyFee = monthlyFee !== '' ? Number(monthlyFee) : 0;
  }

  if (admissionFee !== undefined) {
    if (admissionFee !== '' && (isNaN(Number(admissionFee)) || Number(admissionFee) < 0)) {
      throw new ApiError(400, 'Admission fee must be a non-negative number');
    }
    req.body.admissionFee = admissionFee !== '' ? Number(admissionFee) : 0;
  }

  if (examFee !== undefined) {
    if (examFee !== '' && (isNaN(Number(examFee)) || Number(examFee) < 0)) {
      throw new ApiError(400, 'Exam fee must be a non-negative number');
    }
    req.body.examFee = examFee !== '' ? Number(examFee) : 0;
  }

  next();
};

export { validateCreateClass, validateUpdateClass };
