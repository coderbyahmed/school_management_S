import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows null/missing for students/teachers if not needed, but admin must have it
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    teacherId: {
      type: String,
      unique: true,
      sparse: true,
    },
    loginId: {
      type: String,
      unique: true,
      sparse: true,
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Hidden by default
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Admin-only OTP fields (stripped from student/teacher on save)
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpRequestedAt: {
      type: [Date],
      default: [],
    },
    pendingEmail: {
      type: String,
      default: null,
    },
    securityLockHash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Strip unnecessary fields for student and teacher roles before save
userSchema.pre('save', function () {
  if (this.role === 'student' || this.role === 'teacher') {
    this.phone = '';
    this.profileImage = '';
    this.email = undefined;
    this.teacherId = undefined;
    this.otp = undefined;
    this.otpExpiry = undefined;
    this.isOtpVerified = undefined;
    this.otpAttempts = undefined;
    this.otpRequestedAt = undefined;
    this.pendingEmail = undefined;
    this.securityLockHash = undefined;
  }
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare security lock
userSchema.methods.compareSecurityLock = async function (candidateLock) {
  if (!this.securityLockHash) return false;
  return await bcrypt.compare(candidateLock, this.securityLockHash);
};

const User = mongoose.model('User', userSchema);

export default User;
