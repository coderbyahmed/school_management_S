import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../../../hooks/useLocalization';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import Table from '../../../common/Table/Table';
import Pagination from '../../../common/Pagination/Pagination';
import SearchInput from '../../../common/SearchInput/SearchInput';
import FilterDropdown from '../../../common/FilterDropdown/FilterDropdown';
import toast from 'react-hot-toast';
import userAccountsService from '../../../../services/userAccounts/userAccounts.service';

const ITEMS_PER_PAGE = 10;

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

const PasswordManagement = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const [accounts, setAccounts] = useState([]);
  const [totalResets, setTotalResets] = useState(0);
  const [pagination, setPagination] = useState({ totalRecords: 0, totalPages: 0, currentPage: 1, limit: ITEMS_PER_PAGE });
  const [loading, setLoading] = useState(true);

  const typeOptions = ['All Types', 'Student', 'Teacher'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (search.trim()) params.search = search.trim();
      if (typeFilter !== 'All Types') params.type = typeFilter;

      const result = await userAccountsService.getPasswordManagementData(params);
      if (result.success) {
        setAccounts(result.data.accounts);
        setTotalResets(result.data.stats.totalResets);
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, currentPage]);

  useEffect(() => {
    const debounce = setTimeout(fetchData, 300);
    return () => clearTimeout(debounce);
  }, [fetchData]);

  const tableColumns = [
    { key: 'fullName', label: t('user') },
    { key: 'type', label: t('userType') },
    { key: 'loginId', label: t('loginId') },
    { key: 'lastPasswordReset', label: t('lastPasswordReset') },
    { key: 'resetBy', label: t('resetBy') },
  ];

  const renderTableRow = (entry) => {
    const initials = entry.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return (
      <>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {entry.image ? (
              <img src={entry.image} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-yellow-400/50 flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0">
                {initials}
              </div>
            )}
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
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(entry.lastPasswordReset)}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{entry.resetBy || '-'}</td>
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
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{totalResets}</p>
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
            onChange={(v) => { setSearch(v); setCurrentPage(1); }}
          />
        </div>
        <div className="w-full sm:w-40">
          <FilterDropdown
            label={t('userType')}
            options={typeOptions}
            value={typeFilter}
            onChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-sm">Loading password data...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-sm">No password reset records found</p>
        </div>
      ) : (
        <>
          <Table columns={tableColumns} data={accounts} renderRow={renderTableRow} />
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalRecords}
            itemsPerPage={pagination.limit}
            onPageChange={setCurrentPage}
            disabled={loading}
          />
        </>
      )}
    </div>
  );
};

export default PasswordManagement;
