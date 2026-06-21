import { UserIcon, EnvelopeIcon, PhoneIcon, CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../../common/StatusBadge';
import Button from '../../common/Button';

const TeacherProfile = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl ring-2 ring-yellow-400/50 mb-4">
              TC
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Teacher Name</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">TCH-0000</p>
            <div className="mt-3">
              <StatusBadge status="Active" />
            </div>

            <div className="w-full mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <BriefcaseIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>Qualification</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <AcademicCapIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>Experience</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <PhoneIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>Phone Number</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <EnvelopeIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <MapPinIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Full Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Teacher ID</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Father Name</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Gender</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Date of Birth</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">CNIC</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Marital Status</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Joining Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Phone Number</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Alternate Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">City</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 dark:text-gray-500">Address</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">-</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary">Edit Profile</Button>
            <Button variant="outline">Change Password</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BriefcaseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const AcademicCapIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
  </svg>
);

export default TeacherProfile;
