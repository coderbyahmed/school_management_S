import { ApiError } from '../utils/apiError.js';

const PAK_PHONE_REGEX = /^(\+92|0)3[0-9]{2}[-\s]?[0-9]{7}$/;
const URL_REGEX = /^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateSchoolInformation = (req, res, next) => {
  const {
    schoolName,
    shortName,
    tagline,
    registrationNumber,
    principalName,
    schoolEmail,
    contactNumber,
    whatsappNumber,
    website,
    address,
    city,
    province,
    country,
    googleMapLocation,
  } = req.body;

  if (schoolName !== undefined) {
    if (typeof schoolName !== 'string' || !schoolName.trim()) {
      throw new ApiError(400, 'School name is required');
    }
  }

  if (shortName !== undefined) {
    if (typeof shortName !== 'string' || !shortName.trim()) {
      throw new ApiError(400, 'Short name is required');
    }
    if (shortName.trim().length > 20) {
      throw new ApiError(400, 'Short name must not exceed 20 characters');
    }
  }

  if (tagline !== undefined) {
    if (typeof tagline !== 'string') {
      throw new ApiError(400, 'Tagline must be a string');
    }
    if (tagline.trim().length > 200) {
      throw new ApiError(400, 'Tagline must not exceed 200 characters');
    }
  }

  if (registrationNumber !== undefined) {
    if (typeof registrationNumber !== 'string' || !registrationNumber.trim()) {
      throw new ApiError(400, 'Registration number is required');
    }
  }

  if (principalName !== undefined) {
    if (typeof principalName !== 'string' || !principalName.trim()) {
      throw new ApiError(400, 'Principal name is required');
    }
    if (principalName.trim().length < 3) {
      throw new ApiError(400, 'Principal name must be at least 3 characters');
    }
    if (principalName.trim().length > 100) {
      throw new ApiError(400, 'Principal name must not exceed 100 characters');
    }
  }

  if (schoolEmail !== undefined) {
    if (typeof schoolEmail !== 'string' || !schoolEmail.trim()) {
      throw new ApiError(400, 'School email is required');
    }
    if (!EMAIL_REGEX.test(schoolEmail.trim())) {
      throw new ApiError(400, 'Please provide a valid email address');
    }
  }

  if (contactNumber !== undefined) {
    if (!PAK_PHONE_REGEX.test(contactNumber)) {
      throw new ApiError(400, 'Please provide a valid Pakistani mobile number');
    }
  }

  if (whatsappNumber !== undefined) {
    if (whatsappNumber && !PAK_PHONE_REGEX.test(whatsappNumber)) {
      throw new ApiError(400, 'Please provide a valid Pakistani mobile number for WhatsApp');
    }
  }

  if (website !== undefined) {
    if (website && !URL_REGEX.test(website)) {
      throw new ApiError(400, 'Please provide a valid website URL');
    }
  }

  if (address !== undefined) {
    if (typeof address !== 'string') {
      throw new ApiError(400, 'Address must be a string');
    }
    if (address.trim().length > 500) {
      throw new ApiError(400, 'Address must not exceed 500 characters');
    }
  }

  if (city !== undefined) {
    if (typeof city !== 'string' || !city.trim()) {
      throw new ApiError(400, 'City is required');
    }
    if (city.trim().length > 100) {
      throw new ApiError(400, 'City must not exceed 100 characters');
    }
  }

  if (province !== undefined) {
    if (typeof province !== 'string' || !province.trim()) {
      throw new ApiError(400, 'Province is required');
    }
  }

  if (country !== undefined) {
    if (typeof country !== 'string' || !country.trim()) {
      throw new ApiError(400, 'Country is required');
    }
  }

  if (googleMapLocation !== undefined) {
    if (typeof googleMapLocation !== 'string') {
      throw new ApiError(400, 'Google map location must be a string');
    }
  }

  next();
};

const validateAcademicSettings = (req, res, next) => {
  const {
    currentAcademicYear,
    schoolShift,
    weekendDays,
    defaultLanguage,
    timezone,
  } = req.body;

  if (currentAcademicYear !== undefined) {
    if (typeof currentAcademicYear !== 'string' || !currentAcademicYear.trim()) {
      throw new ApiError(400, 'Current academic year is required');
    }
    if (!/^\d{4}$/.test(currentAcademicYear.trim())) {
      throw new ApiError(400, 'Invalid academic year format');
    }
  }

  if (schoolShift !== undefined) {
    if (!['Morning', 'Evening', 'Both'].includes(schoolShift)) {
      throw new ApiError(400, 'School shift must be Morning, Evening, or Both');
    }
  }

  if (weekendDays !== undefined) {
    if (!Array.isArray(weekendDays)) {
      throw new ApiError(400, 'Weekend days must be an array');
    }
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (const day of weekendDays) {
      if (!validDays.includes(day)) {
        throw new ApiError(400, `Invalid day: ${day}. Must be a valid day name`);
      }
    }
  }

  if (defaultLanguage !== undefined) {
    if (typeof defaultLanguage !== 'string' || !defaultLanguage.trim()) {
      throw new ApiError(400, 'Default language is required');
    }
  }

  if (timezone !== undefined) {
    if (typeof timezone !== 'string' || !timezone.trim()) {
      throw new ApiError(400, 'Timezone is required');
    }
  }

  next();
};

const validateBrandingSettings = (req, res, next) => {
  const {
    pdfHeader,
    pdfFooter,
    reportCardHeader,
    certificateHeader,
  } = req.body;

  if (pdfHeader !== undefined) {
    if (typeof pdfHeader !== 'string') {
      throw new ApiError(400, 'PDF header must be a string');
    }
    if (pdfHeader.trim().length > 500) {
      throw new ApiError(400, 'PDF header must not exceed 500 characters');
    }
  }

  if (pdfFooter !== undefined) {
    if (typeof pdfFooter !== 'string') {
      throw new ApiError(400, 'PDF footer must be a string');
    }
    if (pdfFooter.trim().length > 500) {
      throw new ApiError(400, 'PDF footer must not exceed 500 characters');
    }
  }

  if (reportCardHeader !== undefined) {
    if (typeof reportCardHeader !== 'string') {
      throw new ApiError(400, 'Report card header must be a string');
    }
    if (reportCardHeader.trim().length > 200) {
      throw new ApiError(400, 'Report card header must not exceed 200 characters');
    }
  }

  if (certificateHeader !== undefined) {
    if (typeof certificateHeader !== 'string') {
      throw new ApiError(400, 'Certificate header must be a string');
    }
    if (certificateHeader.trim().length > 200) {
      throw new ApiError(400, 'Certificate header must not exceed 200 characters');
    }
  }

  next();
};

const validateSystemPreferences = (req, res, next) => {
  const {
    enableNotifications,
    maintenanceMode,
    allowPublicWebsite,
    enableParentPortal,
    enableTeacherPortal,
  } = req.body;

  if (enableNotifications !== undefined) {
    if (typeof enableNotifications !== 'boolean') {
      throw new ApiError(400, 'Enable notifications must be a boolean');
    }
  }

  if (maintenanceMode !== undefined) {
    if (typeof maintenanceMode !== 'boolean') {
      throw new ApiError(400, 'Maintenance mode must be a boolean');
    }
  }

  if (allowPublicWebsite !== undefined) {
    if (typeof allowPublicWebsite !== 'boolean') {
      throw new ApiError(400, 'Allow public website must be a boolean');
    }
  }

  if (enableParentPortal !== undefined) {
    if (typeof enableParentPortal !== 'boolean') {
      throw new ApiError(400, 'Enable parent portal must be a boolean');
    }
  }

  if (enableTeacherPortal !== undefined) {
    if (typeof enableTeacherPortal !== 'boolean') {
      throw new ApiError(400, 'Enable teacher portal must be a boolean');
    }
  }

  next();
};

export {
  validateSchoolInformation,
  validateAcademicSettings,
  validateBrandingSettings,
  validateSystemPreferences,
};
