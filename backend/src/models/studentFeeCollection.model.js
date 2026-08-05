import mongoose from 'mongoose';

const CLASSES = [
  'Montessori', 'Nursery', 'KG-1', 'KG-2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const PAYMENT_METHODS = ['Cash', 'Cheque', 'UPI', 'Bank Transfer'];
const PAYMENT_STATUSES = ['Paid', 'Partial', 'Pending'];

const studentFeeCollectionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
      index: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
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
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeStructure',
      required: [true, 'Fee structure is required'],
      index: true,
    },
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true,
      trim: true,
      index: true,
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
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paidAmount: {
      type: Number,
      required: [true, 'Paid amount is required'],
      min: [0, 'Paid amount cannot be negative'],
    },
    remainingAmount: {
      type: Number,
      required: [true, 'Remaining amount is required'],
      min: [0, 'Remaining amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: PAYMENT_STATUSES,
        message: '{VALUE} is not a valid payment status',
      },
      default: 'Pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: '{VALUE} is not a valid payment method',
      },
      required: [true, 'Payment method is required'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

studentFeeCollectionSchema.index({ class: 1, academicYear: 1 });
studentFeeCollectionSchema.index({ paymentStatus: 1, paymentDate: -1 });
studentFeeCollectionSchema.index({ studentId: 1, paymentDate: -1 });

const StudentFeeCollection = mongoose.model('StudentFeeCollection', studentFeeCollectionSchema);

export default StudentFeeCollection;
