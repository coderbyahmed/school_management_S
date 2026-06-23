import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowTrendingUpIcon, AcademicCapIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import StatCard from '../../common/StatCard';
import SelectInput from '../../common/SelectInput';
import SearchInput from '../../common/SearchInput';
import Table from '../../common/Table';
import Button from '../../common/Button';
import ConfirmationModal from '../../common/ConfirmationModal';
import { getImageUrl } from '../../../utils/imageUrl';
import studentService from '../../../services/student.service';
import { CLASS_NAMES } from '../../../utils/classNames';

const PromotionHistory = () => {
  const [yearFilter, setYearFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [nameSearch, setNameSearch] = useState('');
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getStudentPromotions();
      if (data.success) {
        const mapped = (data.data?.promotions || []).map((h) => ({
          id: h._id,
          studentName: h.studentName || 'Unknown',
          studentImage: h.studentImage || null,
          studentIdLabel: h.studentCode || '—',
          prevClass: h.fromClass,
          newClass: h.toClass,
          prevYear: h.fromAcademicYear || '—',
          newYear: h.toAcademicYear || '—',
          date: h.promotedAt ? new Date(h.promotedAt).toLocaleDateString() : '—',
          promotedBy: h.promotedBy?.fullName || h.promotedByName || 'Admin',
          status: h.status === 'Promoted' ? 'Completed' : (h.status || '—'),
          promotedAt: h.promotedAt,
        }));
        setPromotions(mapped);
      } else {
        setError(data.message || 'Failed to fetch promotion history.');
        setPromotions([]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load promotion history.');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDeleteClick = useCallback((id) => {
    setDeleteId(id);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await studentService.deleteStudentPromotion(deleteId);
      if (res.success) {
        toast.success('Promotion history deleted successfully.');
        setDeleteId(null);
        fetchHistory();
      } else {
        toast.error(res.message || 'Failed to delete promotion history.');
        setDeleteId(null);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to delete promotion history.');
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }, [deleteId, fetchHistory]);

  const resetFilters = useCallback(() => {
    setYearFilter('All');
    setClassFilter('All Classes');
    setNameSearch('');
    fetchHistory();
  }, [fetchHistory]);

  const yearOptions = useMemo(() => {
    const years = new Set(promotions.map((p) => p.newYear).filter((y) => y && y !== '—'));
    return ['All', ...Array.from(years).sort()];
  }, [promotions]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => {
      if (yearFilter !== 'All' && p.newYear !== yearFilter) return false;
      if (classFilter !== 'All Classes' && p.newClass !== classFilter) return false;
      if (nameSearch && !p.studentName.toLowerCase().includes(nameSearch.toLowerCase())) return false;
      return true;
    });
  }, [promotions, yearFilter, classFilter, nameSearch]);

  const now = new Date();
  const currentMonth = now.getMonth();

  const totalPromotions = promotions.length;
  const thisYearPromotions = promotions.filter((p) => {
    if (!p.promotedAt) return false;
    const d = new Date(p.promotedAt);
    return d.getFullYear() === now.getFullYear();
  }).length;
  const thisMonthPromotions = promotions.filter((p) => {
    if (!p.promotedAt) return false;
    const d = new Date(p.promotedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === currentMonth;
  }).length;
  const latestPromotion = promotions.length > 0
    ? new Date(promotions[0].promotedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  const columns = [
    { key: 'student', label: 'Student' },
    { key: 'studentId', label: 'Student ID' },
    { key: 'fromYear', label: 'From Year' },
    { key: 'toYear', label: 'To Year' },
    { key: 'fromClass', label: 'From Class' },
    { key: 'toClass', label: 'To Class' },
    { key: 'date', label: 'Date' },
    { key: 'promotedBy', label: 'Promoted By' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' },
  ];

  const safeName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return '??';
    return fullName.split(' ').map(n => n ? n[0] : '').join('').slice(0, 2).toUpperCase() || '??';
  };

  const renderRow = (promotion) => (
    <>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
            {getImageUrl(promotion.studentImage) ? (
              <img src={getImageUrl(promotion.studentImage)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : null}
            <span className={getImageUrl(promotion.studentImage) ? 'hidden' : ''}>{safeName(promotion.studentName)}</span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{promotion.studentName}</span>
        </div>
      </td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">{promotion.studentIdLabel}</td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">{promotion.prevYear}</td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">{promotion.newYear}</td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">{promotion.prevClass}</td>
      <td className="px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400">{promotion.newClass}</td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{promotion.date}</td>
      <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">{promotion.promotedBy}</td>
      <td className="px-4 py-2.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          promotion.status === 'Completed'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${promotion.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          {promotion.status}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <Button
          variant="danger"
          onClick={() => handleDeleteClick(promotion.id)}
          className="!w-auto !px-3 !py-1.5 text-xs"
        >
          Delete
        </Button>
      </td>
    </>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promotion History</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ArrowTrendingUpIcon} label="Total Promotions" value={totalPromotions} color="blue" />
        <StatCard icon={AcademicCapIcon} label="Promotions This Year" value={thisYearPromotions} color="green" />
        <StatCard icon={ClockIcon} label="Promotions This Month" value={thisMonthPromotions} color="yellow" />
        <StatCard icon={StarIcon} label="Latest Promotion" value={latestPromotion} color="blue" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="w-full sm:w-44">
          <SelectInput
            label="Academic Year"
            name="yearFilter"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            options={yearOptions}
          />
        </div>
        <div className="w-full sm:w-44">
          <SelectInput
            label="Class"
            name="classFilter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            options={['All Classes', ...CLASS_NAMES]}
          />
        </div>
        <div className="w-full sm:w-56">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Search Student
          </label>
          <SearchInput
            placeholder="Search student name"
            value={nameSearch}
            onChange={setNameSearch}
          />
        </div>
        <div className="sm:pb-4">
          <Button
            variant="secondary"
            onClick={resetFilters}
            className="w-auto px-5 py-2.5"
          >
            Reset
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm">Loading promotion history...</p>
        </div>
      ) : filteredPromotions.length > 0 ? (
        <Table columns={columns} data={filteredPromotions} renderRow={renderRow} />
      ) : (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500">
          <p className="text-sm">No promotion history available.</p>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Promotion History"
        message="Are you sure you want to permanently delete this promotion history?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default PromotionHistory;
