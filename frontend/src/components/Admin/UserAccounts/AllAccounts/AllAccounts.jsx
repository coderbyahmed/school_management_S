import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../../hooks/useLocalization';
import { UsersIcon, UserGroupIcon, AcademicCapIcon, UserMinusIcon, ArrowPathIcon, KeyIcon } from '@heroicons/react/24/outline';
import StatCard from '../../../common/StatCard/StatCard';
import SearchInput from '../../../common/SearchInput/SearchInput';
import FilterDropdown from '../../../common/FilterDropdown/FilterDropdown';
import Table from '../../../common/Table/Table';
import Pagination from '../../../common/Pagination/Pagination';
import StatusBadge from '../../../common/StatusBadge/StatusBadge';
import Modal from '../../../common/Modal/Modal';
import Input from '../../../common/Input/Input';
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

const AllAccounts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [resetModalAccount, setResetModalAccount] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState({ total: 0, students: 0, teachers: 0, inactive: 0 });
  const [pagination, setPagination] = useState({ totalRecords: 0, totalPages: 0, currentPage: 1, limit: ITEMS_PER_PAGE });
  const [loading, setLoading] = useState(true);

  const typeOptions = ['All Types', 'Student', 'Teacher'];
  const statusOptions = ['All Status', 'Active', 'Inactive'];

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (search.trim()) params.search = search.trim();
      if (typeFilter !== 'All Types') params.type = typeFilter;
      if (statusFilter !== 'All Status') params.status = statusFilter;

      const result = await userAccountsService.getAllAccounts(params);
      if (result.success) {
        setAccounts(result.data.accounts);
        setStats(result.data.stats);
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, currentPage]);

  useEffect(() => {
    const debounce = setTimeout(fetchAccounts, 300);
    return () => clearTimeout(debounce);
  }, [fetchAccounts]);

  const handleReset = () => {
    setSearch('');
    setTypeFilter('All Types');
    setStatusFilter('All Status');
    setCurrentPage(1);
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetting(true);
    try {
      await userAccountsService.resetPassword(
        resetModalAccount._id,
        resetModalAccount.type,
        newPassword.trim()
      );
      toast.success('Password reset successfully');
      setResetModalAccount(null);
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
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
            {account.image ? (
              <img src={account.image} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-yellow-400/50 flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0">
                {initials}
              </div>
            )}
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
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(account.lastLogin)}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(account.lastLogout)}</td>
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
        <StatCard icon={UsersIcon} label={t('totalAccounts')} value={stats.total} color="blue" />
        <StatCard icon={UserGroupIcon} label={t('studentAccounts')} value={stats.students} color="green" />
        <StatCard icon={AcademicCapIcon} label={t('teacherAccounts')} value={stats.teachers} color="purple" />
        <StatCard icon={UserMinusIcon} label={t('inactiveAccounts')} value={stats.inactive} color="red" />
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
        <div className="w-full sm:w-40">
          <FilterDropdown
            label={t('accountStatus')}
            options={statusOptions}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
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

      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-sm">Loading accounts...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-sm">No accounts found</p>
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
              disabled={resetting}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleResetPassword}
              disabled={resetting}
              className="px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {resetting ? 'Resetting...' : t('resetPassword')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AllAccounts;
