import { UserCircleIcon } from '@heroicons/react/24/outline';
import CardSection from '../../common/CardSection';
import StatusBadge from '../../common/StatusBadge';

const sampleProfile = {
  name: 'Ahmed Hassan',
  fatherName: 'Muhammad Hassan',
  studentId: 'STU-2026-001',
  class: 'Class 5',
  gender: 'Male',
  dob: '2014-05-12',
  email: 'ahmed.hassan@iqraschool.edu',
  phone: '+92-300-111-2233',
  address: 'House #12, Street 5, Gulshan-e-Maymar, Karachi',
  status: 'Active',
  admissionDate: '2026-04-01',
  academicYear: '2026',
};

const StudentProfile = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <CardSection title="Photo">
            <div className="flex flex-col items-center py-4">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-3xl ring-2 ring-yellow-400/50 shadow-lg">
                {sampleProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">{sampleProfile.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Son of {sampleProfile.fatherName}</p>
              <div className="mt-2">
                <StatusBadge status={sampleProfile.status} />
              </div>
            </div>
          </CardSection>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <CardSection title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Student ID</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{sampleProfile.studentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Class</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{sampleProfile.class}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{sampleProfile.gender}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{sampleProfile.dob}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admission Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{sampleProfile.admissionDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Academic Year</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{sampleProfile.academicYear}</p>
              </div>
            </div>
          </CardSection>

          <CardSection title="Contact Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{sampleProfile.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{sampleProfile.phone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{sampleProfile.address}</p>
              </div>
            </div>
          </CardSection>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
