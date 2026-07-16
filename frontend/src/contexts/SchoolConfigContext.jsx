import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import schoolSettingsService from '../services/schoolSettings.service';

const SchoolConfigContext = createContext();

const DEFAULTS = {
  schoolInfo: { name: '', shortName: '', tagline: '', registrationNumber: '', principalName: '', email: '', contact: '', whatsapp: '', website: '', address: '', city: '', province: '', country: '', mapLocation: '', logo: null },
  academic: { currentYear: '', shift: 'Morning', weekends: ['Sunday'], language: 'English', timezone: 'Asia/Karachi' },
  branding: { adminLogo: null, smallLogo: null, signature: null, stamp: null, pdfHeader: '', pdfFooter: '', reportCardHeader: '', certificateHeader: '' },
  preferences: { enableNotifications: true, maintenanceMode: false, allowPublicWebsite: false, enableParentPortal: true, enableTeacherPortal: true },
};

export const SchoolConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({ ...DEFAULTS, loading: true });

  const loadSettings = useCallback(async () => {
    setConfig((prev) => ({ ...prev, loading: true }));
    try {
      const res = await schoolSettingsService.getSchoolSettings();
      const s = res.data.settings || {};
      setConfig({
        schoolInfo: {
          name: s.schoolName || '', shortName: s.shortName || '', tagline: s.tagline || '',
          registrationNumber: s.registrationNumber || '', principalName: s.principalName || '',
          email: s.schoolEmail || '', contact: s.contactNumber || '', whatsapp: s.whatsappNumber || '',
          website: s.website || '', address: s.address || '', city: s.city || '', province: s.province || '',
          country: s.country || '', mapLocation: s.googleMapLocation || '', logo: s.schoolLogo || null,
        },
        academic: {
          currentYear: s.currentAcademicYear || '', shift: s.schoolShift || 'Morning',
          weekends: s.weekendDays || ['Sunday'], language: s.defaultLanguage || 'English',
          timezone: s.timezone || 'Asia/Karachi',
        },
        branding: {
          adminLogo: s.adminPanelLogo || null, smallLogo: s.smallLogo || null,
          signature: s.principalSignature || null, stamp: s.schoolStamp || null,
          pdfHeader: s.pdfHeader || '', pdfFooter: s.pdfFooter || '',
          reportCardHeader: s.reportCardHeader || '', certificateHeader: s.certificateHeader || '',
        },
        preferences: {
          enableNotifications: s.enableNotifications ?? true,
          maintenanceMode: s.maintenanceMode ?? false,
          allowPublicWebsite: s.allowPublicWebsite ?? false,
          enableParentPortal: s.enableParentPortal ?? true,
          enableTeacherPortal: s.enableTeacherPortal ?? true,
        },
        loading: false,
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
        }));
      } catch {
        setConfig((prev) => ({ ...prev, loading: false }));
      }
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

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
