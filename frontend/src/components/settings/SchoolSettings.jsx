import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import SchoolInformation from './tabs/SchoolInformation';
import AcademicSettings from './tabs/AcademicSettings';
import BrandingDocuments from './tabs/BrandingDocuments';
import SystemPreferences from './tabs/SystemPreferences';
import schoolSettingsService from '../../services/schoolSettings.service';
import { useSchoolConfig } from '../../contexts/SchoolConfigContext';

const tabs = ['School Information', 'Academic Settings', 'Branding & Documents', 'System Preferences'];

const DEFAULT_SCHOOL_INFO = {
  schoolLogo: null,
  schoolName: '',
  shortName: '',
  schoolTagline: '',
  registrationNumber: '',
  principalName: '',
  schoolEmail: '',
  contactNumber: '',
  whatsappNumber: '',
  website: '',
  completeAddress: '',
  city: '',
  province: '',
  country: '',
  googleMapLocation: '',
};

const DEFAULT_ACADEMIC = {
  currentAcademicYear: '',
  schoolShift: '',
  workingDays: [],
  weeklyHolidays: [],
  schoolStartTime: '',
  schoolEndTime: '',
  attendanceStartTime: '',
  attendanceClosingTime: '',
  defaultLanguage: '',
  timeZone: '',
  dateFormat: '',
  timeFormat: '',
};

const DEFAULT_BRANDING = {
  adminPanelLogo: null,
  smallLogo: null,
  principalSignature: null,
  schoolStamp: null,
  footerText: '',
  pdfHeader: '',
  pdfFooter: '',
  reportCardHeader: '',
  certificateHeader: '',
  idCardHeader: '',
  idCardFooter: '',
  receiptHeader: '',
  receiptFooter: '',
};

const DEFAULT_PREFERENCES = {
  currency: '',
  currencySymbol: '',
  defaultTheme: '',
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  sessionTimeout: 30,
  autoLogout: true,
  maintenanceMode: false,
  defaultLandingPage: '',
  showSchoolLogoOnLogin: true,
  showSchoolNameOnLogin: true,
  enableNotifications: true,
  enableEmailNotifications: true,
  enableSmsNotifications: false,
  enableWhatsAppNotifications: false,
  allowPublicWebsite: false,
  enableParentPortal: false,
  enableTeacherPortal: false,
};

const mapApiToSchoolInfo = (api) => ({
  schoolLogo: api.schoolLogo || null,
  schoolName: api.schoolName || '',
  shortName: api.shortName || '',
  schoolTagline: api.tagline || '',
  registrationNumber: api.registrationNumber || '',
  principalName: api.principalName || '',
  schoolEmail: api.schoolEmail || '',
  contactNumber: api.contactNumber || '',
  whatsappNumber: api.whatsappNumber || '',
  website: api.website || '',
  completeAddress: api.address || '',
  city: api.city || '',
  province: api.province || '',
  country: api.country || '',
  googleMapLocation: api.googleMapLocation || '',
});

const mapApiToAcademic = (api) => ({
  currentAcademicYear: api.currentAcademicYear || '',
  schoolShift: api.schoolShift || '',
  workingDays: [],
  weeklyHolidays: api.weekendDays || [],
  schoolStartTime: '',
  schoolEndTime: '',
  attendanceStartTime: '',
  attendanceClosingTime: '',
  defaultLanguage: api.defaultLanguage || '',
  timeZone: api.timezone || '',
  dateFormat: '',
  timeFormat: '',
});

const mapApiToBranding = (api) => ({
  adminPanelLogo: api.adminPanelLogo || null,
  smallLogo: api.smallLogo || null,
  principalSignature: api.principalSignature || null,
  schoolStamp: api.schoolStamp || null,
  footerText: '',
  pdfHeader: api.pdfHeader || '',
  pdfFooter: api.pdfFooter || '',
  reportCardHeader: api.reportCardHeader || '',
  certificateHeader: api.certificateHeader || '',
  idCardHeader: '',
  idCardFooter: '',
  receiptHeader: '',
  receiptFooter: '',
});

const SchoolSettings = () => {
  const { refresh } = useSchoolConfig();
  const [activeTab, setActiveTab] = useState('School Information');
  const [apiSettings, setApiSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await schoolSettingsService.getSchoolSettings();
      setApiSettings(res.data.settings);
    } catch {
      toast.error('Failed to load school settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchSettings]);

  const activeTabIndex = tabs.indexOf(activeTab);

  const schoolInfoData = apiSettings ? mapApiToSchoolInfo(apiSettings) : DEFAULT_SCHOOL_INFO;
  const academicData = apiSettings ? mapApiToAcademic(apiSettings) : DEFAULT_ACADEMIC;
  const brandingData = apiSettings ? mapApiToBranding(apiSettings) : DEFAULT_BRANDING;

  const mapApiToPreferences = (api) => ({
    currency: '',
    currencySymbol: '',
    defaultTheme: '',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    sessionTimeout: 30,
    autoLogout: true,
    maintenanceMode: api.maintenanceMode ?? false,
    defaultLandingPage: '',
    showSchoolLogoOnLogin: true,
    showSchoolNameOnLogin: true,
    enableNotifications: api.enableNotifications ?? true,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    enableWhatsAppNotifications: false,
    allowPublicWebsite: api.allowPublicWebsite ?? false,
    enableParentPortal: api.enableParentPortal ?? false,
    enableTeacherPortal: api.enableTeacherPortal ?? false,
  });

  const preferencesData = apiSettings ? mapApiToPreferences(apiSettings) : DEFAULT_PREFERENCES;

  const handleSaveSchoolInfo = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        schoolName: formData.schoolName,
        shortName: formData.shortName,
        tagline: formData.schoolTagline,
        registrationNumber: formData.registrationNumber,
        principalName: formData.principalName,
        schoolEmail: formData.schoolEmail,
        contactNumber: formData.contactNumber,
        whatsappNumber: formData.whatsappNumber,
        website: formData.website,
        address: formData.completeAddress,
        city: formData.city,
        province: formData.province,
        country: formData.country,
        googleMapLocation: formData.googleMapLocation,
      };
      const res = await schoolSettingsService.updateSchoolInformation(payload);
      setApiSettings(res.data.settings);
      toast.success('School information saved successfully');
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save school information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAcademic = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        currentAcademicYear: formData.currentAcademicYear,
        schoolShift: formData.schoolShift,
        weekendDays: formData.weeklyHolidays,
        defaultLanguage: formData.defaultLanguage,
        timezone: formData.timeZone,
      };
      const res = await schoolSettingsService.updateAcademicSettings(payload);
      setApiSettings(res.data.settings);
      toast.success('Academic settings saved successfully');
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save academic settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        pdfHeader: formData.pdfHeader,
        pdfFooter: formData.pdfFooter,
        reportCardHeader: formData.reportCardHeader,
        certificateHeader: formData.certificateHeader,
      };
      const res = await schoolSettingsService.updateBrandingSettings(payload);
      setApiSettings(res.data.settings);
      toast.success('Branding settings saved successfully');
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (field, file) => {
    setUploadingField(field);
    try {
      const res = await schoolSettingsService.uploadSchoolImage(field, file);
      setApiSettings(res.data.settings);
      toast.success('Image uploaded successfully');
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSavePreferences = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        enableNotifications: formData.enableNotifications,
        maintenanceMode: formData.maintenanceMode,
        allowPublicWebsite: formData.allowPublicWebsite,
        enableParentPortal: formData.enableParentPortal,
        enableTeacherPortal: formData.enableTeacherPortal,
      };
      const res = await schoolSettingsService.updateSystemPreferences(payload);
      setApiSettings(res.data.settings);
      toast.success('System preferences saved successfully');
      refresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save system preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">School Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure global school information, academics, branding, and system preferences</p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {activeTabIndex === 0 && (
            <SchoolInformation
              data={schoolInfoData}
              onSave={handleSaveSchoolInfo}
              onImageUpload={handleImageUpload}
              saving={saving}
              uploadingField={uploadingField}
            />
          )}
          {activeTabIndex === 1 && (
            <AcademicSettings
              data={academicData}
              onSave={handleSaveAcademic}
              saving={saving}
            />
          )}
          {activeTabIndex === 2 && (
            <BrandingDocuments
              data={brandingData}
              onSave={handleSaveBranding}
              onImageUpload={handleImageUpload}
              saving={saving}
              uploadingField={uploadingField}
            />
          )}
          {activeTabIndex === 3 && (
            <SystemPreferences
              data={preferencesData}
              onSave={handleSavePreferences}
              saving={saving}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SchoolSettings;
