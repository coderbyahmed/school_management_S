import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import schoolSettingsService from '../services/schoolSettings.service';
import { useAuth } from './AuthContext';

const SchoolConfigContext = createContext();

const DEFAULTS = {
  schoolInfo: { name: '', shortName: '', registrationNumber: '', principalName: '', email: '', contact: '', whatsapp: '', website: '', address: '', city: '', province: '', country: '', mapLocation: '', logo: null },
  academic: { currentYear: '', shift: 'Morning', language: 'English', timezone: 'Asia/Karachi', schoolStartTime: '', schoolEndTime: '', attendanceStartTime: '', attendanceClosingTime: '' },
  branding: { adminLogo: null, smallLogo: null, signature: null, stamp: null, pdfHeader: '', pdfFooter: '', reportCardHeader: '', certificateHeader: '', idCardHeader: '', idCardFooter: '', receiptHeader: '', receiptFooter: '', footerText: '' },
  localization: { currency: '', currencySymbol: '', dateFormat: '', timeFormat: '' },
  preferences: { autoLogout: true, defaultLandingPage: '', enableNotifications: true, enableEmailNotifications: true, enableSmsNotifications: false, enableWhatsAppNotifications: false },
  login: { showSchoolLogoOnLogin: true, showSchoolNameOnLogin: true, splashEnabled: true, loaderStyle: '' },
};

export const SchoolConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({ ...DEFAULTS, loading: true, loaded: false });
  const { user } = useAuth();

  const loadSettings = useCallback(async () => {
    setConfig((prev) => ({ ...prev, loading: true }));
    try {
      if (!user) throw new Error('Not authenticated');

      const res = await schoolSettingsService.getSchoolSettings();
      const s = res.data.settings || {};
      localStorage.setItem('autoLogout', s.autoLogout ? 'true' : 'false');

      setConfig({
        schoolInfo: {
          name: s.schoolName || '', shortName: s.shortName || '',
          registrationNumber: s.registrationNumber || '', principalName: s.principalName || '',
          email: s.schoolEmail || '', contact: s.contactNumber || '', whatsapp: s.whatsappNumber || '',
          website: s.website || '', address: s.address || '', city: s.city || '',
          province: s.province || '', country: s.country || '',
          mapLocation: s.googleMapLocation || '', logo: s.schoolLogo || null,
        },
        academic: {
          currentYear: s.currentAcademicYear || '', shift: s.schoolShift || 'Morning',
          language: s.defaultLanguage || 'English', timezone: s.timezone || 'Asia/Karachi',
          schoolStartTime: s.schoolStartTime || '', schoolEndTime: s.schoolEndTime || '',
          attendanceStartTime: s.attendanceStartTime || '', attendanceClosingTime: s.attendanceClosingTime || '',
        },
        branding: {
          adminLogo: s.adminPanelLogo || null, smallLogo: s.smallLogo || null,
          signature: s.principalSignature || null, stamp: s.schoolStamp || null,
          pdfHeader: s.pdfHeader || '', pdfFooter: s.pdfFooter || '',
          reportCardHeader: s.reportCardHeader || '', certificateHeader: s.certificateHeader || '',
          idCardHeader: s.idCardHeader || '', idCardFooter: s.idCardFooter || '',
          receiptHeader: s.receiptHeader || '', receiptFooter: s.receiptFooter || '',
          footerText: s.footerText || '',
        },
        localization: {
          currency: s.currency || '', currencySymbol: s.currencySymbol || '',
          dateFormat: s.dateFormat || '', timeFormat: s.timeFormat || '',
        },
        preferences: {
          autoLogout: s.autoLogout ?? true,
          defaultLandingPage: s.defaultLandingPage || '',
          enableNotifications: s.enableNotifications ?? true,
          enableEmailNotifications: s.enableEmailNotifications ?? true,
          enableSmsNotifications: s.enableSmsNotifications ?? false,
          enableWhatsAppNotifications: s.enableWhatsAppNotifications ?? false,
        },
        login: {
          showSchoolLogoOnLogin: s.showSchoolLogoOnLogin ?? true,
          showSchoolNameOnLogin: s.showSchoolNameOnLogin ?? true,
          splashEnabled: s.splashEnabled ?? true,
          loaderStyle: s.loaderStyle || '',
        },
        loading: false,
        loaded: true,
      });
    } catch {
      try {
        const pubRes = await schoolSettingsService.getPublicSchoolSettings();
        const pub = pubRes.data || {};
        setConfig((prev) => ({
          ...prev,
          schoolInfo: { ...prev.schoolInfo, name: pub.schoolName || '', logo: pub.logo || null, principalName: pub.principalName || '' },
          branding: { ...prev.branding, adminLogo: pub.adminPanelLogo || null },
          loading: false,
          loaded: true,
        }));
      } catch {
        setConfig((prev) => ({ ...prev, loading: false, loaded: false }));
      }
    }
  }, [user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <SchoolConfigContext.Provider value={{ ...config, refresh: loadSettings }}>
      {children}
    </SchoolConfigContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSchoolConfig = () => {
  const context = useContext(SchoolConfigContext);
  if (!context) throw new Error('useSchoolConfig must be used within a SchoolConfigProvider');
  return context;
};
