import FeeSettings from '../models/feeSettings.model.js';
import { ApiError } from '../utils/apiError.js';

const SECTION_KEYS = {
  schoolFee: [
    'enableAdmissionFee', 'enableExamFee', 'enableLabFee', 'enableLibraryFee', 'enableTransportFee', 'autoAssignFee',
  ],
  receipt: [
    'prefix', 'receiptNumberFormat', 'autoGenerate', 'showSchoolLogo', 'showStudentPhoto',
    'showParentInfo', 'showFeeBreakdown', 'showPaymentMethod', 'showRemarks', 'showSignature',
  ],
  fine: [
    'enableLateFee', 'lateFeePerDay', 'maxFine', 'autoApplyFine', 'applyFineOnHolidays', 'fineRuleDescription',
  ],
  reminder: [
    'enableReminder', 'reminderBeforeDueDays', 'reminderAfterDueDays', 'maxReminders',
    'reminderMethod', 'includeFeeAmount', 'includeDueDate', 'sendAutomatically',
  ],
};

const toApiError = (error) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    return new ApiError(400, messages.join('. '));
  }
  return error;
};

const getFeeSettings = async () => {
  try {
    return await FeeSettings.getSettings();
  } catch (error) {
    throw toApiError(error);
  }
};

const updateFeeSettings = async (data, userId) => {
  try {
    const settings = await FeeSettings.getSettings();

    const updateFields = {};
    for (const [section, keys] of Object.entries(SECTION_KEYS)) {
      const sectionData = data[section];
      if (!sectionData || typeof sectionData !== 'object') continue;
      for (const key of keys) {
        if (sectionData[key] !== undefined) {
          updateFields[`${section}.${key}`] = sectionData[key];
        }
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return settings;
    }

    updateFields.updatedBy = userId;

    const updated = await FeeSettings.findByIdAndUpdate(
      settings._id,
      { $set: updateFields },
      { returnDocument: 'after', runValidators: true },
    );

    if (!updated) {
      throw new ApiError(404, 'Fee settings not found');
    }

    return updated;
  } catch (error) {
    throw toApiError(error);
  }
};

export default {
  getFeeSettings,
  updateFeeSettings,
};
