import { ApiError } from '../utils/apiError.js';

const BOOLEAN_KEYS = {
  schoolFee: ['enableAdmissionFee', 'enableExamFee', 'enableLabFee', 'enableLibraryFee', 'enableTransportFee', 'autoAssignFee'],
  receipt: ['autoGenerate', 'showSchoolLogo', 'showStudentPhoto', 'showParentInfo', 'showFeeBreakdown', 'showPaymentMethod', 'showRemarks', 'showSignature'],
  fine: ['enableLateFee', 'autoApplyFine', 'applyFineOnHolidays'],
  reminder: ['enableReminder', 'includeFeeAmount', 'includeDueDate', 'sendAutomatically'],
};

const NUMBER_KEYS = {
  fine: ['lateFeePerDay', 'maxFine'],
  reminder: ['reminderBeforeDueDays', 'reminderAfterDueDays', 'maxReminders'],
};

const STRING_KEYS = {
  receipt: ['prefix', 'receiptNumberFormat'],
  fine: ['fineRuleDescription'],
};

const REMINDER_METHODS = ['Email', 'SMS', 'WhatsApp', 'Multiple'];
const RECEIPT_PREFIX_REGEX = /^[A-Z0-9_-]{1,8}$/;

const validateSection = (sectionName, section, req) => {
  if (!section || typeof section !== 'object' || Array.isArray(section)) {
    throw new ApiError(400, `${sectionName} must be an object`);
  }

  const cleaned = {};

  for (const key of BOOLEAN_KEYS[sectionName] || []) {
    if (section[key] !== undefined) {
      if (typeof section[key] !== 'boolean') {
        throw new ApiError(400, `${sectionName}.${key} must be a boolean`);
      }
      cleaned[key] = section[key];
    }
  }

  for (const key of NUMBER_KEYS[sectionName] || []) {
    if (section[key] !== undefined) {
      if (typeof section[key] !== 'number' || isNaN(section[key])) {
        throw new ApiError(400, `${sectionName}.${key} must be a valid number`);
      }
      if (section[key] < 0) {
        throw new ApiError(400, `${sectionName}.${key} cannot be negative`);
      }
      if (key === 'maxReminders' && section[key] < 1) {
        throw new ApiError(400, `${sectionName}.maxReminders must be at least 1`);
      }
      cleaned[key] = section[key];
    }
  }

  for (const key of STRING_KEYS[sectionName] || []) {
    if (section[key] !== undefined) {
      if (typeof section[key] !== 'string') {
        throw new ApiError(400, `${sectionName}.${key} must be a string`);
      }

      if (key === 'prefix') {
        const prefix = section[key].trim().toUpperCase();
        if (!RECEIPT_PREFIX_REGEX.test(prefix)) {
          throw new ApiError(400, 'Receipt prefix must be 1-8 characters (letters, numbers, hyphen or underscore)');
        }
        cleaned[key] = prefix;
      } else if (key === 'receiptNumberFormat') {
        if (section[key].trim().length > 100) {
          throw new ApiError(400, 'Receipt number format cannot exceed 100 characters');
        }
        cleaned[key] = section[key].trim();
      } else if (key === 'fineRuleDescription') {
        if (section[key].trim().length > 500) {
          throw new ApiError(400, 'Fine rule description cannot exceed 500 characters');
        }
        cleaned[key] = section[key].trim();
      }
    }
  }

  if (sectionName === 'reminder' && section.reminderMethod !== undefined) {
    if (typeof section.reminderMethod !== 'string') {
      throw new ApiError(400, 'reminder.reminderMethod must be a string');
    }
    if (!REMINDER_METHODS.includes(section.reminderMethod)) {
      throw new ApiError(400, `reminder.reminderMethod must be one of: ${REMINDER_METHODS.join(', ')}`);
    }
    cleaned.reminderMethod = section.reminderMethod;
  }

  if (Object.keys(cleaned).length > 0) {
    req.body[sectionName] = cleaned;
  }
};

const validateFeeSettings = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw new ApiError(400, 'Request body is required');
  }

  const { schoolFee, receipt, fine, reminder } = req.body;

  if (schoolFee !== undefined) validateSection('schoolFee', schoolFee, req);
  if (receipt !== undefined) validateSection('receipt', receipt, req);
  if (fine !== undefined) validateSection('fine', fine, req);
  if (reminder !== undefined) validateSection('reminder', reminder, req);

  if (
    schoolFee === undefined &&
    receipt === undefined &&
    fine === undefined &&
    reminder === undefined
  ) {
    throw new ApiError(400, 'At least one settings section is required');
  }

  next();
};

export { validateFeeSettings };
