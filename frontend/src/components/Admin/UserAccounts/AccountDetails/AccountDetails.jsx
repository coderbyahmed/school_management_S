import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../../../hooks/useLocalization';
import { ArrowLeftIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const DUMMY_ACCOUNTS = {
  'STD-000001': { loginId: 'STD-000001', fullName: 'Ahmed Raza', type: 'Student', status: 'Active', createdDate: '2026-01-15', lastLogin: '2026-09-05 08:30 AM', lastLogout: '2026-09-05 02:45 PM', image: null, fatherName: 'Raza Hussain', class: 'Class 5', phone: '0301-1234567' },
  'STD-000002': { loginId: 'STD-000002', fullName: 'Fatima Noor', type: 'Student', status: 'Active', createdDate: '2026-01-15', lastLogin: '2026-09-05 08:15 AM', lastLogout: '2026-09-05 03:00 PM', image: null, fatherName: 'Noor Ahmed', class: 'Class 3', phone: '0321-7654321' },
  'STD-000003': { loginId: 'STD-000003', fullName: 'Sara Khan', type: 'Student', status: 'Active', createdDate: '2026-02-01', lastLogin: '2026-09-04 08:20 AM', lastLogout: '2026-09-04 02:50 PM', image: null, fatherName: 'Khan Muhammad', class: 'Class 7', phone: '0333-1112233' },
  'STD-000004': { loginId: 'STD-000004', fullName: 'Hassan Malik', type: 'Student', status: 'Active', createdDate: '2026-02-10', lastLogin: '2026-09-05 08:10 AM', lastLogout: '2026-09-05 02:55 PM', image: null, fatherName: 'Malik Akbar', class: 'Class 2', phone: '0345-9988776' },
  'STD-000005': { loginId: 'STD-000005', fullName: 'Omar Farooq', type: 'Student', status: 'Inactive', createdDate: '2026-01-20', lastLogin: '2026-07-15 08:25 AM', lastLogout: '2026-07-15 02:40 PM', image: null, fatherName: 'Farooq Ahmed', class: 'Class 4', phone: '0300-5544332' },
  'STD-000006': { loginId: 'STD-000006', fullName: 'Maryam Aziz', type: 'Student', status: 'Active', createdDate: '2026-03-01', lastLogin: '2026-09-05 08:05 AM', lastLogout: '2026-09-05 03:10 PM', image: null, fatherName: 'Azizullah Khan', class: 'Class 6', phone: '0311-2233445' },
  'TCH-000001': { loginId: 'TCH-000001', fullName: 'Muhammad Ali', type: 'Teacher', status: 'Active', createdDate: '2025-08-01', lastLogin: '2026-09-05 07:45 AM', lastLogout: '2026-09-05 03:30 PM', image: null, phone: '0321-1234567', qualification: 'M.Ed', subjects: 'Mathematics, Physics' },
  'TCH-000002': { loginId: 'TCH-000002', fullName: 'Ayesha Siddiqui', type: 'Teacher', status: 'Inactive', createdDate: '2025-08-15', lastLogin: '2026-08-20 08:00 AM', lastLogout: '2026-08-20 02:30 PM', image: null, phone: '0333-9876543', qualification: 'B.Ed', subjects: 'English, Urdu' },
  'TCH-000003': { loginId: 'TCH-000003', fullName: 'Zainab Bibi', type: 'Teacher', status: 'Active', createdDate: '2025-09-01', lastLogin: '2026-09-05 07:50 AM', lastLogout: '2026-09-05 03:15 PM', image: null, phone: '0345-5566778', qualification: 'BS Education', subjects: 'Science, Biology' },
  'TCH-000004': { loginId: 'TCH-000004', fullName: 'Bilal Ahmed', type: 'Teacher', status: 'Active', createdDate: '2026-01-10', lastLogin: '2026-09-05 07:55 AM', lastLogout: '2026-09-05 03:20 PM', image: null, phone: '0300-1122334', qualification: 'M.A Education', subjects: 'Social Studies, History' },
};

const AccountDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginId } = useParams();

  const account = DUMMY_ACCOUNTS[loginId];

  if (!account) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/admin/user-accounts/all')} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
          <ArrowLeftIcon className="h-4 w-4" />
          {t('backToAccounts')}
        </button>
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-sm">{t('accountNotFound')}</p>
        </div>
      </div>
    );
  }

  const initials = account.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/user-accounts/all')} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
        <ArrowLeftIcon className="h-4 w-4" />
        {t('backToAccounts')}
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl ring-2 ring-yellow-400/50 overflow-hidden">
              {account.image ? (
                <img src={account.image} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{account.fullName}</h1>
              <p className="text-blue-100 text-sm">{account.loginId}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                account.type === 'Student'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {account.type}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('userInformation')}</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('fullName')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{account.fullName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('loginId')}</span>
                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{account.loginId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('userType')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{account.type}</span>
                </div>
                {account.type === 'Student' && account.fatherName && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('fatherName')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{account.fatherName}</span>
                  </div>
                )}
                {account.type === 'Student' && account.class && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('class')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{account.class}</span>
                  </div>
                )}
                {account.type === 'Teacher' && account.qualification && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('qualification')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{account.qualification}</span>
                  </div>
                )}
                {account.type === 'Teacher' && account.subjects && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('subjects')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{account.subjects}</span>
                  </div>
                )}
                {account.phone && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('phoneNumber')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{account.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('accountInformation')}</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('accountStatus')}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    account.status === 'Active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {account.status}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('accountCreatedDate')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{account.createdDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('lastLogin')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{account.lastLogin}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('lastLogout')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{account.lastLogout}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
