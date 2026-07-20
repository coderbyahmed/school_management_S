import { useState, useEffect } from 'react';
import schoolSettingsService from '../../services/schoolSettings.service';
import { getImageUrl } from '../../utils/imageUrl';
import Spinner from './Spinner';

const SplashScreen = ({ visible }) => {
  const [schoolData, setSchoolData] = useState(null);

  useEffect(() => {
    schoolSettingsService.getPublicSchoolSettings()
      .then(res => setSchoolData(res.data))
      .catch(() => {});
  }, []);

  const schoolName = schoolData?.schoolName || 'School Name';
  const logoUrl = schoolData?.logo ? getImageUrl(schoolData.logo) : null;
  const splashBgUrl = schoolData?.splashBackground ? getImageUrl(schoolData.splashBackground) : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={
        splashBgUrl
          ? { backgroundImage: `url(${splashBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }
      }
    >
      {splashBgUrl && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-4 ring-white/30 overflow-hidden mb-4">
          {logoUrl ? (
            <img src={logoUrl} alt={schoolName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-white">
              {schoolName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 text-center drop-shadow-md">
          {schoolName}
        </h1>
        <Spinner size="md" className="text-white/80" />
      </div>
    </div>
  );
};

export default SplashScreen;
