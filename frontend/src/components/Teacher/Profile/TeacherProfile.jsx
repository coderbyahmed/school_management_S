import { useNavigate } from 'react-router-dom';
import useTeacherProfile from '../../../hooks/useTeacherProfile';
import { getImageUrl } from '../../../utils/imageUrl';
import { ArrowLeftIcon, UserIcon, BriefcaseIcon, PhoneIcon } from '@heroicons/react/24/outline';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const mins = pad(d.getMinutes());
  return `${year}-${month}-${day} ${pad(hours)}:${mins} ${ampm}`;
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{value || '-'}</span>
  </div>
);

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { teacherProfile: t, loading } = useTeacherProfile();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!t) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/teacher/more')} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-sm">Profile data unavailable</p>
        </div>
      </div>
    );
  }

  const imageUrl = t.teacherImage ? getImageUrl(t.teacherImage) : null;
  const initials = (t.fullName || 'T').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/teacher/more')} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl ring-2 ring-yellow-400/50 overflow-hidden flex-shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt={t.fullName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{t.fullName}</h1>
              <p className="text-blue-100 text-sm">{t.teacherId}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                t.status === 'Active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {t.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Personal Information</h2>
              </div>
              <div className="space-y-3">
                <InfoRow label="Full Name" value={t.fullName} />
                <InfoRow label="Father Name" value={t.fatherName} />
                <InfoRow label="Teacher ID" value={t.teacherId} />
                <InfoRow label="Gender" value={t.gender} />
                <InfoRow label="Date of Birth" value={formatDate(t.dateOfBirth)} />
                <InfoRow label="CNIC" value={t.cnic} />
                <InfoRow label="Marital Status" value={t.maritalStatus} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <PhoneIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Contact Information</h2>
              </div>
              <div className="space-y-3">
                <InfoRow label="Phone Number" value={t.phoneNumber} />
                <InfoRow label="Alternative Phone" value={t.alternatePhoneNumber} />
                <InfoRow label="Email" value={t.email} />
                <InfoRow label="City" value={t.city} />
                <InfoRow label="Address" value={t.address} />
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <BriefcaseIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Professional Information</h2>
              </div>
              <div className="space-y-3">
                <InfoRow label="Qualification" value={t.qualification} />
                <InfoRow label="Experience" value={t.experience} />
                <InfoRow label="Joining Date" value={formatDate(t.joiningDate)} />
                <InfoRow label="Academic Year" value={t.academicYear} />
                <InfoRow label="Status" value={t.status} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
