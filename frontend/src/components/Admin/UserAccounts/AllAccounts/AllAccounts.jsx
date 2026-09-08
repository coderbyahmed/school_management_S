import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../../hooks/useLocalization';
import { UsersIcon, UserGroupIcon, AcademicCapIcon, UserMinusIcon, ArrowPathIcon, KeyIcon } from '@heroicons/react/24/outline';
import StatCard from '../../../common/StatCard/StatCard';
import SearchInput from '../../../common/SearchInput/SearchInput';
import FilterDropdown from '../../../common/FilterDropdown/FilterDropdown';
import Table from '../../../common/Table/Table';
import StatusBadge from '../../../common/StatusBadge/StatusBadge';
import Modal from '../../../common/Modal/Modal';
import Input from '../../../common/Input/Input';

const DUMMY_ACCOUNTS = [
  { id: 1, loginId: 'STD-000001', fullName: 'Ahmed Raza', type: 'Student', status: 'Active', lastLogin: '2026-09-05 08:30 AM', lastLogout: '2026-09-05 02:45 PM', image: null },
  { id: 2, loginId: 'STD-000002', fullName: 'Fatima Noor', type: 'Student', status: 'Active', lastLogin: '2026-09-05 08:15 AM', lastLogout: '2026-09-05 03:00 PM', image: null },
  { id: 3, loginId: 'TCH-000001', fullName: 'Muhammad Ali', type: 'Teacher', status: 'Active', lastLogin: '2026-09-05 07:45 AM', lastLogout: '2026-09-05 03:30 PM', image: null },
  { id: 4, loginId: 'STD-000003', fullName: 'Sara Khan', type: 'Student', status: 'Active', lastLogin: '2026-09-04 08:20 AM', lastLogout: '2026-09-04 02:50 PM', image: null },
  { id: 5, loginId: 'TCH-000002', fullName: 'Ayesha Siddiqui', type: 'Teacher', status: 'Inactive', lastLogin: '2026-08-20 08:00 AM', lastLogout: '2026-08-20 02:30 PM', image: null },
  { id: 6, loginId: 'STD-000004', fullName: 'Hassan Malik', type: 'Student', status: 'Active', lastLogin: '2026-09-05 08:10 AM', lastLogout: '2026-09-05 02:55 PM', image: null },
  { id: 7, loginId: 'TCH-000003', fullName: 'Zainab Bibi', type: 'Teacher', status: 'Active', lastLogin: '2026-09-05 07:50 AM', lastLogout: '2026-09-05 03:15 PM', image: null },
  { id: 8, loginId: 'STD-000005', fullName: 'Omar Farooq', type: 'Student', status: 'Inactive', lastLogin: '2026-07-15 08:25 AM', lastLogout: '2026-07-15 02:40 PM', image: null },
  { id: 9, loginId: 'STD-000006', fullName: 'Maryam Aziz', type: 'Student', status: 'Active', lastLogin: '2026-09-05 08:05 AM', lastLogout: '2026-09-05 03:10 PM', image: null },
  { id: 10, loginId: 'TCH-000004', fullName: 'Bilal Ahmed', type: 'Teacher', status: 'Active', lastLogin: '2026-09-05 07:55 AM', lastLogout: '2026-09-05 03:20 PM', image: null },
];

const AllAccounts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [resetModalAccount, setResetModalAccount] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const typeOptions = ['All Types', 'Student', 'Teacher'];
  const statusOptions = ['All Statuses', 'Active', 'Inactive'];

  const filtered = DUMMY_ACCOUNTS.filter((a) => {
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      if (!a.fullName.toLowerCase().includes(term) && !a.loginId.toLowerCase().includes(term)) return false;
    }
    if (typeFilter !== 'All Types' && a.type !== typeFilter) return false;
    if (statusFilter !== 'All Statuses' && a.status !== statusFilter) return false;
    return true;
  });

  const totalAccounts = DUMMY_ACCOUNTS.length;
  const studentAccounts = DUMMY_ACCOUNTS.filter((a) => a.type === 'Student').length;
  const teacherAccounts = DUMMY_ACCOUNTS.filter((a) => a.type === 'Teacher').length;
  const inactiveAccounts = DUMMY_ACCOUNTS.filter((a) => a.status === 'Inactive').length;

  const handleReset = () => {
    setSearch('');
    setTypeFilter('All Types');
    setStatusFilter('All Statuses');
  };

  const tableColumns = [
    { key: 'loginId', label: t('loginId') },
    { key: 'fullName', label: t('userName') },
    { key: 'type', label: t('userType') },
    { key: 'status', label: t('accountStatus') },
    { key: 'lastLogin', label: t('lastLogin') },
    { key: 'lastLogout', label: t('lastLogout') },
    { key: 'actions', label: t('actions'), className: 'text-right' },
  ];

  const renderTableRow = (account) => {
    const initials = account.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return (
      <>
        <td className="px-4 py-3 text-sm font-mono text-gray-700 dark:text-gray-300">{account.loginId}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{account.fullName}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            account.type === 'Student'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
          }`}>
            {account.type}
          </span>
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={account.status} />
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{account.lastLogin}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{account.lastLogout}</td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => navigate(`/admin/user-accounts/${account.loginId}`)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
            >
              {t('view')}
            </button>
            <button
              onClick={() => { setResetModalAccount(account); setNewPassword(''); }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors cursor-pointer"
            >
              <KeyIcon className="h-3.5 w-3.5" />
              {t('resetPassword')}
            </button>
          </div>
        </td>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('allAccounts')}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UsersIcon} label={t('totalAccounts')} value={totalAccounts} color="blue" />
        <StatCard icon={UserGroupIcon} label={t('studentAccounts')} value={studentAccounts} color="green" />
        <StatCard icon={AcademicCapIcon} label={t('teacherAccounts')} value={teacherAccounts} color="purple" />
        <StatCard icon={UserMinusIcon} label={t('inactiveAccounts')} value={inactiveAccounts} color="red" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end flex-wrap">
        <div className="w-full sm:w-64">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
            {t('searchByNameOrLoginId')}
          </label>
          <SearchInput
            placeholder={t('search')}
            value={search}
            onChange={(v) => setSearch(v)}
          />
        </div>
        <div className="w-full sm:w-40">
          <FilterDropdown
            label={t('userType')}
            options={typeOptions}
            value={typeFilter}
            onChange={setTypeFilter}
          />
        </div>
        <div className="w-full sm:w-40">
          <FilterDropdown
            label={t('accountStatus')}
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer sm:self-end"
        >
          <ArrowPathIcon className="h-4 w-4" />
          {t('reset')}
        </button>
      </div>

      <Table columns={tableColumns} data={filtered} renderRow={renderTableRow} />

      <Modal
        isOpen={!!resetModalAccount}
        onClose={() => { setResetModalAccount(null); setNewPassword(''); }}
        title={t('resetPassword')}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('resetPasswordFor')} <span className="font-semibold text-gray-900 dark:text-white">{resetModalAccount?.fullName}</span> ({resetModalAccount?.loginId})
          </p>
          <Input
            label={t('newPassword')}
            type="text"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('enterNewPassword')}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => { setResetModalAccount(null); setNewPassword(''); }}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              onClick={() => { setResetModalAccount(null); setNewPassword(''); }}
              className="px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              {t('resetPassword')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AllAccounts;
