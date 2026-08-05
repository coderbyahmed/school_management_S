import mongoose from 'mongoose';

const CLASSES = [
  'Montessori', 'Nursery', 'KG-1', 'KG-2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const FEE_STRUCTURE_STATUSES = ['Active', 'Inactive'];

const feeStructureSchema = new mongoose.Schema(
  {
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^(202[5-9]|203[0-5])$/.test(v);
        },
        message: 'Academic year must be between 2025 and 2035',
      },
    },
    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
      enum: {
        values: CLASSES,
        message: '{VALUE} is not a valid class',
      },
    },
    monthlyFee: {
      type: Number,
      required: [true, 'Monthly fee is required'],
      min: [0, 'Monthly fee cannot be negative'],
    },
    admissionFee: {
      type: Number,
      default: 0,
      min: [0, 'Admission fee cannot be negative'],
    },
    examFee: {
      type: Number,
      default: 0,
      min: [0, 'Exam fee cannot be negative'],
    },
    otherCharges: {
      type: Number,
      default: 0,
      min: [0, 'Other charges cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    lateFine: {
      type: Number,
      default: 0,
      min: [0, 'Late fine cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: FEE_STRUCTURE_STATUSES,
        message: '{VALUE} is not a valid status',
      },
      default: 'Active',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

feeStructureSchema.index({ class: 1, academicYear: 1 });
feeStructureSchema.index({ academicYear: 1, status: 1 });
feeStructureSchema.index({ academicYear: 1, class: 1 }, { unique: true });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

export default FeeStructure;
