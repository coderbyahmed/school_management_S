import { useState } from 'react';
import { useTranslation } from '../../../../hooks/useLocalization';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import Table from '../../../common/Table/Table';
import SearchInput from '../../../common/SearchInput/SearchInput';
import FilterDropdown from '../../../common/FilterDropdown/FilterDropdown';

const DUMMY_RESET_LOG = [
  { id: 1, fullName: 'Ahmed Raza', type: 'Student', loginId: 'STD-000001', lastReset: '2026-09-01 10:30 AM', resetBy: 'Admin' },
  { id: 2, fullName: 'Muhammad Ali', type: 'Teacher', loginId: 'TCH-000001', lastReset: '2026-08-25 09:15 AM', resetBy: 'Admin' },
  { id: 3, fullName: 'Fatima Noor', type: 'Student', loginId: 'STD-000002', lastReset: '2026-08-20 11:00 AM', resetBy: 'Admin' },
  { id: 4, fullName: 'Ayesha Siddiqui', type: 'Teacher', loginId: 'TCH-000002', lastReset: '2026-08-15 02:45 PM', resetBy: 'Admin' },
  { id: 5, fullName: 'Sara Khan', type: 'Student', loginId: 'STD-000003', lastReset: '2026-08-10 08:20 AM', resetBy: 'Admin' },
  { id: 6, fullName: 'Hassan Malik', type: 'Student', loginId: 'STD-000004', lastReset: '2026-07-28 10:00 AM', resetBy: 'Admin' },
  { id: 7, fullName: 'Bilal Ahmed', type: 'Teacher', loginId: 'TCH-000004', lastReset: '2026-07-20 03:30 PM', resetBy: 'Admin' },
];

const PasswordManagement = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');

  const typeOptions = ['All Types', 'Student', 'Teacher'];

  const filtered = DUMMY_RESET_LOG.filter((a) => {
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      if (!a.fullName.toLowerCase().includes(term) && !a.loginId.toLowerCase().includes(term)) return false;
    }
    if (typeFilter !== 'All Types' && a.type !== typeFilter) return false;
    return true;
  });

  const tableColumns = [
    { key: 'fullName', label: t('user') },
    { key: 'type', label: t('userType') },
    { key: 'loginId', label: t('loginId') },
    { key: 'lastReset', label: t('lastPasswordReset') },
    { key: 'resetBy', label: t('resetBy') },
  ];

  const renderTableRow = (entry) => {
    const initials = entry.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return (
      <>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.fullName}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            entry.type === 'Student'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
          }`}>
            {entry.type}
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-mono text-gray-700 dark:text-gray-300">{entry.loginId}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{entry.lastReset}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{entry.resetBy}</td>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('passwordManagement')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('passwordManagementDescription')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('passwordPolicy')}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('passwordPolicyDescription')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('studentDefaultPassword')}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 font-mono">12345678</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('teacherDefaultPassword')}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 font-mono">42684268</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('totalResets')}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{DUMMY_RESET_LOG.length}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('passwordResetActivity')}</h2>
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
      </div>

      <Table columns={tableColumns} data={filtered} renderRow={renderTableRow} />
    </div>
  );
};

export default PasswordManagement;
