import { AcademicCapIcon } from '@heroicons/react/24/outline';

const CardHeader = ({ schoolName, primaryColor = '#2563eb', secondaryColor = '#1e40af', nameFontSize = 16, fontWeight = 700, visibility = {} }) => {
  if (!visibility.schoolLogo && !visibility.schoolName) return null;
  return (
    <div className="px-4 py-3 text-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
      {visibility.schoolLogo && (
        <div className="w-10 h-10 bg-white/20 rounded-full inline-flex items-center justify-center mb-1 overflow-hidden">
          <AcademicCapIcon className="h-6 w-6 text-white" />
        </div>
      )}
      {visibility.schoolName && (
        <h3 className="text-white" style={{ fontSize: nameFontSize, fontWeight }}>{schoolName}</h3>
      )}
    </div>
  );
};

export default CardHeader;
