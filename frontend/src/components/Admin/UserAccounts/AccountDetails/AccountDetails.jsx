import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../../../hooks/useLocalization';
import { ArrowLeftIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import userAccountsService from '../../../../services/userAccounts/userAccounts.service';

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

const AccountDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginId } = useParams();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true);
      try {
        const result = await userAccountsService.getAccountByLoginId(loginId);
        if (result.success) {
          setAccount(result.data);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(err.response?.data?.message || 'Failed to load account');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [loginId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/admin/user-accounts/all')} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
          <ArrowLeftIcon className="h-4 w-4" />
          {t('backToAccounts')}
        </button>
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-sm">Loading account details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !account) {
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
  const profileImage = account.studentImage || account.teacherImage || account.profileImage || null;

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
              {profileImage ? (
                <img src={profileImage} alt="" className="w-full h-full object-cover" />
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
                {(account.fatherPhone || account.phoneNumber) && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('phoneNumber')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{account.fatherPhone || account.phoneNumber}</span>
                  </div>
                )}
                {account.email && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('email')}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{account.email}</span>
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
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(account.createdAt)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('lastLogin')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(account.lastLogin)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('lastLogout')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(account.lastLogout)}</span>
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
