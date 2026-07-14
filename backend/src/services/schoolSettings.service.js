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
  } catch (err) { console.error('Failed to delete file at path', relativePath, err); }
};

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

const updateSchoolInformation = async (data) => {
  const allowed = [
    'schoolName',
    'shortName',
    'tagline',
    'registrationNumber',
    'principalName',
    'schoolEmail',
    'contactNumber',
    'whatsappNumber',
    'website',
    'address',
    'city',
    'province',
    'country',
    'googleMapLocation',
  ];

  const updateFields = {};
  for (const key of allowed) {
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

const updateAcademicSettings = async (data) => {
  const allowed = [
    'currentAcademicYear',
    'schoolShift',
    'weekendDays',
    'defaultLanguage',
    'timezone',
  ];

  const updateFields = {};
  for (const key of allowed) {
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

const updateBrandingSettings = async (data) => {
  const allowed = [
    'pdfHeader',
    'pdfFooter',
    'reportCardHeader',
    'certificateHeader',
  ];

  const updateFields = {};
  for (const key of allowed) {
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

const updateSystemPreferences = async (data) => {
  const allowed = [
    'enableNotifications',
    'maintenanceMode',
    'allowPublicWebsite',
    'enableParentPortal',
    'enableTeacherPortal',
  ];

  const updateFields = {};
  for (const key of allowed) {
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

const ALLOWED_IMAGE_FIELDS = [
  'schoolLogo', 'adminPanelLogo', 'smallLogo', 'principalSignature', 'schoolStamp',
  'pdfHeader', 'pdfFooter', 'reportCardHeader', 'certificateHeader',
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
  updateSchoolInformation,
  updateAcademicSettings,
  updateBrandingSettings,
  updateSystemPreferences,
  updateSchoolImage,
};
