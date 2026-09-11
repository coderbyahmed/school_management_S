import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UsersIcon, UserGroupIcon, UserMinusIcon, UserPlusIcon, ArrowPathIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard/StatCard';
import FilterDropdown from '../../common/FilterDropdown/FilterDropdown';
import SearchInput from '../../common/SearchInput/SearchInput';
import ViewToggle from '../../common/ViewToggle/ViewToggle';
import Table from '../../common/Table/Table';
import Pagination from '../../common/Pagination/Pagination';
import StatusBadge from '../../common/StatusBadge/StatusBadge';
import ActionButtons from '../../common/ActionButtons/ActionButtons';
import TeacherCard from './TeacherCard';
import TeacherViewModal from './TeacherViewModal';
import EditTeacherModal from './EditTeacherModal';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import Modal from '../../common/Modal/Modal';
import Alert from '../../common/Alert/Alert';
import { getImageUrl } from '../../../utils/imageUrl';
import { useTranslation } from '../../../hooks/useLocalization';
import teacherService from '../../../services/teacher/teacher.service';
import authService from '../../../services/auth/auth.service';

const ITEMS_PER_PAGE = 10;

const formatDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '-';
  return dt.toISOString().slice(0, 10);
};

const isCurrentMonth = (d) => {
  if (!d) return false;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return false;
  const now = new Date();
  return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
};

const AllTeachers = ({ onSuccess }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const statusOptions = useMemo(() => [t('all'), t('active'), t('inactive')], [t]);
  const [view, setView] = useState('table');
  const [statusFilter, setStatusFilter] = useState(t('all'));
  const [nameSearch, setNameSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deletingTeacher, setDeletingTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState({ totalTeachers: 0, totalPages: 0, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [createdCredentials, setCreatedCredentials] = useState(() =>
    location.state?.teacherCreated
      ? { teacherName: location.state.teacherName, loginId: location.state.loginId }
      : null
  );
  const [showCredentialsModal, setShowCredentialsModal] = useState(
    () => !!location.state?.teacherCreated
  );
  const tRef = useRef(t);
  tRef.current = t;
  const debounceRef = useRef(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await teacherService.getAllTeachers({ page: currentPage, limit: ITEMS_PER_PAGE, status: statusFilter !== 'All' ? statusFilter : undefined, search: nameSearch || undefined });
      setTeachers(result.data?.teachers || []);
      if (result.data?.pagination) {
        setPagination(result.data.pagination);
      }
    } catch (err) {
      const msg = err.response?.data?.message || tRef.current('failedToLoad');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, nameSearch]);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      fetchTeachers();
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [fetchTeachers]);

  useEffect(() => {
    if (location.state?.teacherCreated) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenPanel = async (teacher) => {
    if (teacher.status !== 'Active') return;
    try {
      const result = await authService.adminPortalAccess(teacher._id, 'teacher');
      if (result.success) {
        const params = new URLSearchParams({
          adminAccessToken: result.accessToken,
          adminRefreshToken: result.refreshToken,
          adminUser: JSON.stringify(result.user),
          adminRole: 'teacher',
        });
        window.open(`/teacher/dashboard?${params.toString()}`, '_blank');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open panel');
    }
  };

  const handleReset = () => {
    setStatusFilter(t('all'));
    setNameSearch('');
    setCurrentPage(1);
  };

  const totalTeachers = pagination.totalTeachers || 0;
  const activeTeachers = teachers.filter((t) => t.status === 'Active').length;
  const inactiveTeachers = teachers.filter((t) => t.status === 'Inactive').length;
  const newTeachers = teachers.filter((t) => isCurrentMonth(t.joiningDate)).length;

  const handleEditSave = async (teacherId, formData) => {
    const result = await teacherService.updateTeacher(teacherId, formData);
    toast.success(t('updatedSuccessfully'));
    await fetchTeachers();
    return result;
  };

  const handleDelete = async () => {
    try {
      await teacherService.deleteTeacher(deletingTeacher.teacherId);
      toast.success(t('deletedSuccessfully'));
      setDeletingTeacher(null);
      await fetchTeachers();
    } catch (err) {
      const msg = err.response?.data?.message || t('failedToDelete');
      toast.error(msg);
    }
  };

  const tableColumns = useMemo(() => [
    { key: 'teacher', label: t('teacher'), className: 'min-w-[180px]' },
    { key: 'teacherId', label: t('teacherIdLabel') },
    { key: 'academicYear', label: t('academicYear') },
    { key: 'phone', label: t('phoneNumber') },
    { key: 'joiningDate', label: t('joiningDate') },
    { key: 'status', label: t('status') },
    { key: 'actions', label: t('actions'), className: 'text-right min-w-[200px]' },
  ], [t]);

  const renderTableRow = useCallback((teacher) => {
    const initials = teacher.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || t('noDataDash');
    const imgSrc = getImageUrl(teacher.teacherImage);

    return (
      <>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0 overflow-hidden">
              {imgSrc ? (
                <img src={imgSrc} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{teacher.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('sonOf')}{teacher.fatherName}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{teacher.teacherId}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{teacher.academicYear || '—'}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{teacher.phoneNumber}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{formatDate(teacher.joiningDate)}</td>
        <td className="px-4 py-3">
          <StatusBadge status={teacher.status} />
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <ActionButtons
              onView={() => setSelectedTeacher(teacher)}
              onEdit={() => setEditingTeacher(teacher)}
              onDelete={() => setDeletingTeacher(teacher)}
            />
            <button
              onClick={async () => {
                if (teacher.status !== 'Active') return;
                try {
                  const result = await authService.adminPortalAccess(teacher._id, 'teacher');
                  if (result.success) {
                    const params = new URLSearchParams({
                      adminAccessToken: result.accessToken,
                      adminRefreshToken: result.refreshToken,
                      adminUser: JSON.stringify(result.user),
                      adminRole: 'teacher',
                    });
                    window.open(`/teacher/dashboard?${params.toString()}`, '_blank');
                  }
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to open panel');
                }
              }}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                teacher.status === 'Active'
                  ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                  : 'text-red-400 dark:text-red-500 cursor-not-allowed opacity-60'
              }`}
              title={t('openPanel')}
            >
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
              {t('openPanel')}
            </button>
          </div>
        </td>
      </>
    );
  }, [t]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('manageTeachers')}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UsersIcon} label={t('totalTeachers')} value={totalTeachers} color="blue" />
        <StatCard icon={UserGroupIcon} label={t('activeTeachers')} value={activeTeachers} color="green" />
        <StatCard icon={UserMinusIcon} label={t('inactiveTeachers')} value={inactiveTeachers} color="red" />
        <StatCard icon={UserPlusIcon} label={t('newTeachers')} value={newTeachers} color="yellow" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end flex-wrap">
        <div className="w-full sm:w-36">
          <FilterDropdown
            label={t('status')}
            options={statusOptions}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
          />
        </div>
        <div className="w-full sm:w-56">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
            {t('searchByName')}
          </label>
          <SearchInput
            placeholder={t('searchTeacherName')}
            value={nameSearch}
            onChange={(v) => { setNameSearch(v); setCurrentPage(1); }}
          />
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer sm:self-end"
        >
          <ArrowPathIcon className="h-4 w-4" />
          {t('reset')}
        </button>
        <div className="sm:ml-auto">
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="text-sm">{t('loadingTeachers')}</p>
        </div>
      ) : (
        <>
          {view === 'table' ? (
            <>
              {teachers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <Table columns={tableColumns} data={teachers} renderRow={renderTableRow} />
                </div>
              ) : (
                <>
                  <Table columns={tableColumns} data={teachers} renderRow={renderTableRow} />
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalTeachers}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    disabled={loading}
                  />
                </>
              )}
            </>
          ) : (
            <>
              {teachers.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <p className="text-sm">{t('noTeachersFound')}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {teachers.map((teacher) => (
                      <TeacherCard
                        key={teacher.teacherId}
                        teacher={teacher}
                        onView={() => setSelectedTeacher(teacher)}
                        onEdit={() => setEditingTeacher(teacher)}
                        onDelete={() => setDeletingTeacher(teacher)}
                        onOpenPanel={handleOpenPanel}
                      />
                    ))}
                  </div>
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalTeachers}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    disabled={loading}
                  />
                </>
              )}
            </>
          )}
        </>
      )}

      <TeacherViewModal
        teacher={selectedTeacher}
        isOpen={!!selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
      />

      <EditTeacherModal
        key={editingTeacher?._id || 'new'}
        teacher={editingTeacher}
        isOpen={!!editingTeacher}
        onClose={() => setEditingTeacher(null)}
        onSave={handleEditSave}
      />

      <ConfirmationModal
        isOpen={!!deletingTeacher}
        onClose={() => setDeletingTeacher(null)}
        title={t('deleteTeacher')}
        message={t('deleteTeacherConfirm')}
        confirmLabel={t('confirmDeleteLabel')}
        cancelLabel={t('cancel')}
        variant="danger"
        onConfirm={handleDelete}
      />

      {createdCredentials && (
        <Alert
          message={`${t('teacherCreatedSuccess')} ${createdCredentials.teacherName}! ${t('teacherCredentialsCreated')}`}
          type="success"
        />
      )}

      <Modal
        isOpen={showCredentialsModal}
        onClose={() => { setShowCredentialsModal(false); setCreatedCredentials(null); }}
        title={t('teacherAccountCreated')}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div className="text-center pb-2">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('teacherCredentialsMessage')}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('loginId')}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{createdCredentials?.loginId}</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600"></div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('temporaryPassword')}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 font-mono">42684268</p>
            </div>
          </div>

          <button
            onClick={() => { setShowCredentialsModal(false); setCreatedCredentials(null); }}
            className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AllTeachers;
