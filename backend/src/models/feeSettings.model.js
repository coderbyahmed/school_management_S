import mongoose from 'mongoose';

const REMINDER_METHODS = ['Email', 'SMS', 'WhatsApp', 'Multiple'];

const feeSettingsSchema = new mongoose.Schema(
  {
    // ──────────────────────────────────────────────
    // School Fee Settings
    // ──────────────────────────────────────────────
    schoolFee: {
      enableAdmissionFee: {
        type: Boolean,
        default: true,
      },
      enableExamFee: {
        type: Boolean,
        default: true,
      },
      enableLabFee: {
        type: Boolean,
        default: false,
      },
      enableLibraryFee: {
        type: Boolean,
        default: false,
      },
      enableTransportFee: {
        type: Boolean,
        default: false,
      },
      autoAssignFee: {
        type: Boolean,
        default: false,
      },
    },

    // ──────────────────────────────────────────────
    // Receipt Settings
    // ──────────────────────────────────────────────
    receipt: {
      prefix: {
        type: String,
        trim: true,
        uppercase: true,
        default: 'REC',
        validate: {
          validator: function (v) {
            if (!v) return true;
            return /^[A-Z0-9_-]{1,8}$/.test(v);
          },
          message: 'Receipt prefix must be 1-8 characters (letters, numbers, hyphen or underscore)',
        },
      },
      receiptNumberFormat: {
        type: String,
        trim: true,
        default: 'REC-{year}-{sequence}',
        maxlength: [100, 'Receipt number format cannot exceed 100 characters'],
      },
      autoGenerate: {
        type: Boolean,
        default: true,
      },
      showSchoolLogo: {
        type: Boolean,
        default: true,
      },
      showStudentPhoto: {
        type: Boolean,
        default: true,
      },
      showParentInfo: {
        type: Boolean,
        default: true,
      },
      showFeeBreakdown: {
        type: Boolean,
        default: true,
      },
      showPaymentMethod: {
        type: Boolean,
        default: true,
      },
      showRemarks: {
        type: Boolean,
        default: true,
      },
      showSignature: {
        type: Boolean,
        default: true,
      },
    },

    // ──────────────────────────────────────────────
    // Fine Settings
    // ──────────────────────────────────────────────
    fine: {
      enableLateFee: {
        type: Boolean,
        default: true,
      },
      lateFeePerDay: {
        type: Number,
        default: 100,
        min: [0, 'Late fee per day cannot be negative'],
      },
      maxFine: {
        type: Number,
        default: 500,
        min: [0, 'Maximum fine cannot be negative'],
      },
      autoApplyFine: {
        type: Boolean,
        default: true,
      },
      applyFineOnHolidays: {
        type: Boolean,
        default: false,
      },
      fineRuleDescription: {
        type: String,
        trim: true,
        default: '',
        maxlength: [500, 'Fine rule description cannot exceed 500 characters'],
      },
    },

    // ──────────────────────────────────────────────
    // Reminder Settings
    // ──────────────────────────────────────────────
    reminder: {
      enableReminder: {
        type: Boolean,
        default: false,
      },
      reminderBeforeDueDays: {
        type: Number,
        default: 3,
        min: [0, 'Reminder before due days cannot be negative'],
      },
      reminderAfterDueDays: {
        type: Number,
        default: 5,
        min: [0, 'Reminder after due days cannot be negative'],
      },
      maxReminders: {
        type: Number,
        default: 3,
        min: [1, 'Maximum reminders must be at least 1'],
      },
      reminderMethod: {
        type: String,
        enum: {
          values: REMINDER_METHODS,
          message: '{VALUE} is not a valid reminder method',
        },
        default: 'SMS',
      },
      includeFeeAmount: {
        type: Boolean,
        default: true,
      },
      includeDueDate: {
        type: Boolean,
        default: true,
      },
      sendAutomatically: {
        type: Boolean,
        default: false,
      },
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

const DEFAULT_SCHOOL_FEE = {
  enableAdmissionFee: true,
  enableExamFee: true,
  enableLabFee: false,
  enableLibraryFee: false,
  enableTransportFee: false,
  autoAssignFee: false,
};

const DEFAULT_RECEIPT = {
  prefix: 'REC',
  receiptNumberFormat: 'REC-{year}-{sequence}',
  autoGenerate: true,
  showSchoolLogo: true,
  showStudentPhoto: true,
  showParentInfo: true,
  showFeeBreakdown: true,
  showPaymentMethod: true,
  showRemarks: true,
  showSignature: true,
};

const DEFAULT_FINE = {
  enableLateFee: true,
  lateFeePerDay: 100,
  maxFine: 500,
  autoApplyFine: true,
  applyFineOnHolidays: false,
  fineRuleDescription: '',
};

const DEFAULT_REMINDER = {
  enableReminder: false,
  reminderBeforeDueDays: 3,
  reminderAfterDueDays: 5,
  maxReminders: 3,
  reminderMethod: 'SMS',
  includeFeeAmount: true,
  includeDueDate: true,
  sendAutomatically: false,
};

feeSettingsSchema.statics.getSettings = async function () {
  return await this.findOneAndUpdate(
    {},
    {
      $setOnInsert: {
        schoolFee: DEFAULT_SCHOOL_FEE,
        receipt: DEFAULT_RECEIPT,
        fine: DEFAULT_FINE,
        reminder: DEFAULT_REMINDER,
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
};

const FeeSettings = mongoose.model('FeeSettings', feeSettingsSchema);

export default FeeSettings;
