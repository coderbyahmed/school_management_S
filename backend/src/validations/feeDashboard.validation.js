import { ApiError } from '../utils/apiError.js';

const CLASSES = [
  'Montessori', 'Nursery', 'KG-1', 'KG-2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

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

const validateDate = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return undefined;
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ApiError(400, `Invalid ${fieldName}`);
  }
  return date;
};

const validateDashboardFilters = (req, res, next) => {
  const { startDate, endDate } = req.query;

  const clean = {};
  clean.academicYear = validateAcademicYear(req.query.academicYear);
  clean.class = validateClass(req.query.class);
  clean.month = validateMonth(req.query.month);
  clean.startDate = validateDate(startDate, 'start date');
  clean.endDate = validateDate(endDate, 'end date');

  if (clean.month && (clean.startDate || clean.endDate)) {
    throw new ApiError(400, 'Month filter cannot be combined with a date range');
  }

  if (clean.startDate && clean.endDate && clean.startDate > clean.endDate) {
    throw new ApiError(400, 'Start date cannot be after end date');
  }

  req.dashboardFilters = clean;
  next();
};

export {
  validateDashboardFilters,
  CLASSES,
};
