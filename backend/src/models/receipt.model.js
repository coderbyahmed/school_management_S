import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    feeCollectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentFeeCollection',
      required: [true, 'Fee collection is required'],
      unique: true,
      index: true,
    },
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
      index: true,
    },
    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
      index: true,
    },
    printCount: {
      type: Number,
      default: 0,
      min: [0, 'Print count cannot be negative'],
    },
    reprintCount: {
      type: Number,
      default: 0,
      min: [0, 'Reprint count cannot be negative'],
    },
    lastPrintedAt: {
      type: Date,
      default: null,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

receiptSchema.index({ studentId: 1, createdAt: -1 });
receiptSchema.index({ academicYear: 1, class: 1, createdAt: -1 });

const Receipt = mongoose.model('Receipt', receiptSchema);

export default Receipt;
