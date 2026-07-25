import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import SchoolSettings from '../models/schoolSettings.model.js';
import { ApiError } from '../utils/apiError.js';
import { stripBaseUrl } from '../utils/imageUrl.js';
import { writeUploadFile } from '../middlewares/upload.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deleteFileAtPath = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.resolve(__dirname, '../..', relativePath);
  try {
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch {
    /* file may have been moved or already deleted */
  }
};

// ──────────────────────────────────────────────
// Singleton — always returns the single document
// ──────────────────────────────────────────────
const getSchoolSettings = async () => {
  try {
    return await SchoolSettings.getSettings();
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }
    throw error;
  }
};

// ──────────────────────────────────────────────
// General Information
// ──────────────────────────────────────────────
const GENERAL_ALLOWED = [
  'schoolName', 'shortName', 'registrationNumber', 'principalName',
  'schoolEmail', 'contactNumber', 'whatsappNumber', 'website',
  'address', 'city', 'province', 'country', 'googleMapLocation',
];

const updateGeneralInformation = async (data) => {
  const updateFields = {};
  for (const key of GENERAL_ALLOWED) {
    if (data[key] !== undefined) {
      updateFields[key] = data[key];
    }
  }

  try {
    const settings = await SchoolSettings.getSettings();
    const updated = await SchoolSettings.findByIdAndUpdate(
      settings._id,
      { $set: updateFields },
      { returnDocument: 'after', runValidators: true },
    );

    if (!updated) {
      throw new ApiError(404, 'School settings not found');
    }

    return updated;
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }
    throw error;
  }
};

// ──────────────────────────────────────────────
// Academic Configuration (+ Localization fields)
// ──────────────────────────────────────────────
const ACADEMIC_ALLOWED = [
  'currentAcademicYear', 'schoolShift',
  'schoolStartTime', 'schoolEndTime',
  'attendanceStartTime', 'attendanceClosingTime',
  'defaultLanguage', 'timezone', 'dateFormat', 'timeFormat',
];

const updateAcademicConfiguration = async (data) => {
  const updateFields = {};
  for (const key of ACADEMIC_ALLOWED) {
    if (data[key] !== undefined) {
      updateFields[key] = data[key];
    }
  }

  try {
    const settings = await SchoolSettings.getSettings();
    const updated = await SchoolSettings.findByIdAndUpdate(
      settings._id,
      { $set: updateFields },
      { returnDocument: 'after', runValidators: true },
    );

    if (!updated) {
      throw new ApiError(404, 'School settings not found');
    }

    return updated;
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }
    throw error;
  }
};

// ──────────────────────────────────────────────
// Branding & Documents
// ──────────────────────────────────────────────
const BRANDING_ALLOWED = [
  'pdfHeader', 'pdfFooter', 'reportCardHeader', 'certificateHeader',
  'idCardHeader', 'idCardFooter', 'receiptHeader', 'receiptFooter',
  'footerText',
];

const updateBrandingDocuments = async (data) => {
  const updateFields = {};
  for (const key of BRANDING_ALLOWED) {
    if (data[key] !== undefined) {
      updateFields[key] = data[key];
    }
  }

  try {
    const settings = await SchoolSettings.getSettings();
    const updated = await SchoolSettings.findByIdAndUpdate(
      settings._id,
      { $set: updateFields },
      { returnDocument: 'after', runValidators: true },
    );

    if (!updated) {
      throw new ApiError(404, 'School settings not found');
    }

    return updated;
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }
    throw error;
  }
};

// ──────────────────────────────────────────────
// System Preferences (+ Login/Splash + Currency)
// ──────────────────────────────────────────────
const PREFERENCES_ALLOWED = [
  'autoLogout', 'defaultLandingPage',
  'enableNotifications', 'enableEmailNotifications',
  'enableSmsNotifications', 'enableWhatsAppNotifications',
  'showSchoolLogoOnLogin', 'showSchoolNameOnLogin',
  'splashEnabled', 'loaderStyle',
  'currency', 'currencySymbol',
];

const updateSystemPreferences = async (data) => {
  const updateFields = {};
  for (const key of PREFERENCES_ALLOWED) {
    if (data[key] !== undefined) {
      updateFields[key] = data[key];
    }
  }

  try {
    const settings = await SchoolSettings.getSettings();
    const updated = await SchoolSettings.findByIdAndUpdate(
      settings._id,
      { $set: updateFields },
      { returnDocument: 'after', runValidators: true },
    );

    if (!updated) {
      throw new ApiError(404, 'School settings not found');
    }

    return updated;
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }
    throw error;
  }
};

// ──────────────────────────────────────────────
// Image Upload
// ──────────────────────────────────────────────
const ALLOWED_IMAGE_FIELDS = [
  'schoolLogo', 'adminPanelLogo', 'smallLogo', 'principalSignature', 'schoolStamp',
];

const updateSchoolImage = async (field, file, baseUrl = '') => {
  if (!ALLOWED_IMAGE_FIELDS.includes(field)) {
    throw new ApiError(400, `Invalid image field: ${field}`);
  }

  if (!file) {
    throw new ApiError(400, 'Image file is required');
  }

  try {
    const settings = await SchoolSettings.getSettings();

    if (settings[field]) {
      const oldPath = stripBaseUrl(settings[field]);
      deleteFileAtPath(oldPath);
    }

    const filename = writeUploadFile(file.buffer, 'school-settings', file.originalname);
    const imagePath = `uploads/school-settings/${filename}`;
    const imageValue = baseUrl ? `${baseUrl}/${imagePath}` : imagePath;

    const updated = await SchoolSettings.findByIdAndUpdate(
      settings._id,
      { $set: { [field]: imageValue } },
      { returnDocument: 'after', runValidators: true },
    );

    if (!updated) {
      throw new ApiError(404, 'School settings not found');
    }

    return updated;
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }
    throw error;
  }
};

export default {
  getSchoolSettings,
  updateGeneralInformation,
  updateAcademicConfiguration,
  updateBrandingDocuments,
  updateSystemPreferences,
  updateSchoolImage,
};
