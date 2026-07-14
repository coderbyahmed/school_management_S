import mongoose from 'mongoose';

const schoolSettingsSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
    },
    shortName: {
      type: String,
      required: [true, 'Short name is required'],
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      trim: true,
    },
    principalName: {
      type: String,
      required: [true, 'Principal name is required'],
      trim: true,
    },
    schoolEmail: {
      type: String,
      required: [true, 'School email is required'],
      trim: true,
      lowercase: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      validate: {
        validator: function (v) {
          return /^(\+92|0)3[0-9]{2}[-\s]?[0-9]{7}$/.test(v);
        },
        message: 'Please provide a valid Pakistani mobile number',
      },
    },
    whatsappNumber: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^(\+92|0)3[0-9]{2}[-\s]?[0-9]{7}$/.test(v);
        },
        message: 'Please provide a valid Pakistani mobile number',
      },
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    googleMapLocation: {
      type: String,
      trim: true,
      default: '',
    },
    currentAcademicYear: {
      type: String,
      required: [true, 'Current academic year is required'],
      trim: true,
    },
    schoolShift: {
      type: String,
      enum: ['Morning', 'Evening', 'Both'],
      required: [true, 'School shift is required'],
    },
    weekendDays: {
      type: [String],
      default: ['Sunday'],
    },
    defaultLanguage: {
      type: String,
      trim: true,
      default: 'English',
    },
    timezone: {
      type: String,
      trim: true,
      default: 'Asia/Karachi',
    },
    schoolLogo: {
      type: String,
      default: '',
    },
    adminPanelLogo: {
      type: String,
      default: '',
    },
    smallLogo: {
      type: String,
      default: '',
    },
    principalSignature: {
      type: String,
      default: '',
    },
    schoolStamp: {
      type: String,
      default: '',
    },
    pdfHeader: {
      type: String,
      trim: true,
      default: '',
    },
    pdfFooter: {
      type: String,
      trim: true,
      default: '',
    },
    reportCardHeader: {
      type: String,
      trim: true,
      default: '',
    },
    certificateHeader: {
      type: String,
      trim: true,
      default: '',
    },
    enableNotifications: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowPublicWebsite: {
      type: Boolean,
      default: false,
    },
    enableParentPortal: {
      type: Boolean,
      default: true,
    },
    enableTeacherPortal: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

schoolSettingsSchema.statics.getSettings = async function () {
  return await this.findOneAndUpdate(
    {},
    {
      $setOnInsert: {
        schoolName: '',
        shortName: '',
        registrationNumber: '',
        principalName: '',
        schoolEmail: '',
        contactNumber: '+923001234567',
        city: '',
        province: '',
        country: '',
        currentAcademicYear: '',
        schoolShift: 'Morning',
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );
};

const SchoolSettings = mongoose.model('SchoolSettings', schoolSettingsSchema);

export default SchoolSettings;
