import { asyncHandler } from '../utils/asyncHandler.js';
import { toFullUrl } from '../utils/imageUrl.js';
import schoolSettingsService from '../services/schoolSettings.service.js';

const IMAGE_FIELDS = ['schoolLogo', 'adminPanelLogo', 'smallLogo', 'principalSignature', 'schoolStamp'];

const toFullUrls = (req, settings) => {
  if (!settings) return settings;
  for (const field of IMAGE_FIELDS) {
    if (settings[field]) {
      settings[field] = toFullUrl(req, settings[field]);
    }
  }
  return settings;
};

const getSchoolSettings = asyncHandler(async (req, res) => {
  const settings = await schoolSettingsService.getSchoolSettings();
  toFullUrls(req, settings);

  return res.status(200).json({
    success: true,
    message: 'School settings fetched successfully',
    data: { settings },
  });
});

const updateSchoolInformation = asyncHandler(async (req, res) => {
  const settings = await schoolSettingsService.updateSchoolInformation(req.body);

  return res.status(200).json({
    success: true,
    message: 'School information updated successfully',
    data: { settings },
  });
});

const updateAcademicSettings = asyncHandler(async (req, res) => {
  const settings = await schoolSettingsService.updateAcademicSettings(req.body);

  return res.status(200).json({
    success: true,
    message: 'Academic settings updated successfully',
    data: { settings },
  });
});

const updateBrandingSettings = asyncHandler(async (req, res) => {
  const settings = await schoolSettingsService.updateBrandingSettings(req.body);

  return res.status(200).json({
    success: true,
    message: 'Branding settings updated successfully',
    data: { settings },
  });
});

const updateSchoolImage = asyncHandler(async (req, res) => {
  const { field } = req.params;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const settings = await schoolSettingsService.updateSchoolImage(field, req.file, baseUrl);
  if (settings[field]) settings[field] = toFullUrl(req, settings[field]);

  return res.status(200).json({
    success: true,
    message: 'Image updated successfully',
    data: { settings },
  });
});

const getPublicSchoolSettings = asyncHandler(async (req, res) => {
  const settings = await schoolSettingsService.getSchoolSettings();
  const logo = settings.schoolLogo ? toFullUrl(req, settings.schoolLogo) : '';
  const adminPanelLogo = settings.adminPanelLogo ? toFullUrl(req, settings.adminPanelLogo) : '';

  return res.status(200).json({
    success: true,
    data: {
      schoolName: settings.schoolName || '',
      logo,
      adminPanelLogo,
      principalName: settings.principalName || '',
    },
  });
});

const updateSystemPreferences = asyncHandler(async (req, res) => {
  const settings = await schoolSettingsService.updateSystemPreferences(req.body);

  return res.status(200).json({
    success: true,
    message: 'System preferences updated successfully',
    data: { settings },
  });
});

export {
  getSchoolSettings,
  getPublicSchoolSettings,
  updateSchoolInformation,
  updateAcademicSettings,
  updateBrandingSettings,
  updateSystemPreferences,
  updateSchoolImage,
};
