import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Counter from './counter.model.js';

const VALID_CLASS_NAMES = [
  'Montessori', 'Nursery', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const studentSchema = new mongoose.Schema(
  {
    studentImage: {
      type: String,
      required: [true, 'Student image is required'],
    },
    studentImagePublicId: {
      type: String,
      default: '',
    },
    studentId: {
      type: String,
      unique: true,
    },
    loginId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    fatherName: {
      type: String,
      required: [true, 'Father name is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    lastLogout: {
      type: Date,
      default: null,
    },
    lastPasswordReset: {
      type: Date,
      default: null,
    },
    passwordResetBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'student',
    },
    fatherPhone: {
      type: String,
      required: [true, 'Father phone is required'],
      validate: {
        validator: function (v) {
          return /^(\+92|0)3[0-9]{2}[-\s]?[0-9]{7}$/.test(v);
        },
        message: 'Please provide a valid Pakistani mobile number',
      },
    },
    alternatePhone: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^(\+92|0)3[0-9]{2}[-\s]?[0-9]{7}$/.test(v);
        },
        message: 'Please provide a valid Pakistani mobile number',
      },
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    admissionDate: {
      type: Date,
      required: [true, 'Admission date is required'],
    },
    admissionNumber: {
      type: String,
      unique: true,
    },
    class: {
      type: String,
      enum: VALID_CLASS_NAMES,
      required: [true, 'Class is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
    },
    enrollments: [
      {
        academicYear: {
          type: String,
          required: true,
        },
        class: {
          type: String,
          enum: VALID_CLASS_NAMES,
          required: true,
        },
        status: {
          type: String,
          enum: ['Active', 'Historical', 'Reversed'],
          default: 'Active',
        },
        source: {
          type: String,
          enum: ['Admission', 'Promotion', 'Correction', 'Reversal'],
          default: 'Admission',
        },
        promotedFrom: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'StudentPromotion',
          default: null,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

studentSchema.index({ fatherPhone: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ class: 1 });
studentSchema.index({ academicYear: 1 });
studentSchema.index({ 'enrollments.academicYear': 1, 'enrollments.class': 1, 'enrollments.status': 1 });

studentSchema.pre('save', async function () {
  if (this.isNew) {
    if (!this.studentId) {
      const seq = await Counter.increment('student');
      this.studentId = `STD-${String(seq).padStart(6, '0')}`;
    }
    if (!this.admissionNumber) {
      const seq = await Counter.increment('admission');
      this.admissionNumber = `ADM-${String(seq).padStart(6, '0')}`;
    }
    if (!this.loginId) {
      this.loginId = this.studentId;
    }
  }
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

export default Student;
