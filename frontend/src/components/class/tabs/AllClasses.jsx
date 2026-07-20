import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BookOpenIcon, CheckCircleIcon, XCircleIcon, UsersIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import FilterDropdown from '../../common/FilterDropdown';
import SearchInput from '../../common/SearchInput';
import ViewToggle from '../../common/ViewToggle';
import Table from '../../common/Table';
import StatusBadge from '../../common/StatusBadge';
import ActionButtons from '../../common/ActionButtons';
import ClassCard from '../../common/ClassCard';
import ConfirmationModal from '../../common/ConfirmationModal';
import classService from '../../../services/class.service';
import { ACADEMIC_YEARS } from '../../../utils/classNames';

const ITEMS_PER_PAGE = 10;

const academicYearOptions = ['All Years', ...ACADEMIC_YEARS];

const statusOptions = ['All', 'Active', 'Inactive'];

const AllClasses = ({ onViewDetails, onEditClass }) => {
  const [view, setView] = useState('table');
  const [academicYearFilter, setAcademicYearFilter] = useState('All Years');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingClass, setDeletingClass] = useState(null);

  const fetchClasses = async () => {
    try {
      const result = await classService.getAllClasses();
      setClasses(result.data?.classes || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load classes';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClasses();
  }, []);

  const filteredClasses = classes.filter((c) => {
    if (academicYearFilter !== 'All Years' && c.academicYear !== academicYearFilter) return false;
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (searchQuery && !c.className?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleReset = () => {
    setAcademicYearFilter('All Years');
    setStatusFilter('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deletingClass) return;

    try {
      await classService.deleteClass(deletingClass._id);
      toast.success('Class deleted successfully');
      setDeletingClass(null);
      setLoading(true);
      await fetchClasses();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete class';
      toast.error(msg);
    }
  };

  const statistics = {
    totalClasses: classes.length,
    activeClasses: classes.filter((c) => c.status === 'Active').length,
    inactiveClasses: classes.filter((c) => c.status === 'Inactive').length,
    totalStudents: classes.reduce((sum, c) => sum + (c.totalStudents || 0), 0),
  };

  const tableColumns = [
    { key: 'className', label: 'Class Name' },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'students', label: 'Total Students' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderTableRow = (classData) => (
    <>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0">
            {classData.className?.slice(0, 2).toUpperCase() || 'CL'}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{classData.className}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{classData.academicYear}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{classData.totalStudents || 0}</td>
      <td className="px-4 py-3">
        <StatusBadge status={classData.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <ActionButtons
          onView={() => onViewDetails(classData)}
          onEdit={() => onEditClass(classData)}
          onDelete={() => setDeletingClass(classData)}
        />
      </td>
    </>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {Math.min(filteredClasses.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}&ndash;{Math.min(currentPage * ITEMS_PER_PAGE, filteredClasses.length)} of {filteredClasses.length}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Previous
          </button>
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-500">
        <p className="text-sm">Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Classes</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpenIcon} label="Total Classes" value={statistics.totalClasses} color="blue" />
        <StatCard icon={CheckCircleIcon} label="Active Classes" value={statistics.activeClasses} color="green" />
        <StatCard icon={XCircleIcon} label="Inactive Classes" value={statistics.inactiveClasses} color="red" />
        <StatCard icon={UsersIcon} label="Total Students" value={statistics.totalStudents} color="yellow" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end flex-wrap">
        <div className="w-full sm:w-44">
          <FilterDropdown
            label="Academic Year"
            options={academicYearOptions}
            value={academicYearFilter}
            onChange={(v) => { setAcademicYearFilter(v); setCurrentPage(1); }}
          />
        </div>
        <div className="w-full sm:w-36">
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
          />
        </div>
        <div className="w-full sm:w-56">
          <SearchInput
            placeholder="Search Class"
            value={searchQuery}
            onChange={(v) => { setSearchQuery(v); setCurrentPage(1); }}
          />
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer sm:self-end"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Reset
        </button>
        <div className="sm:ml-auto">
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {view === 'table' ? (
        <>
          {filteredClasses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <Table columns={tableColumns} data={paginatedClasses} renderRow={renderTableRow} />
            </div>
          ) : (
            <>
              <Table columns={tableColumns} data={paginatedClasses} renderRow={renderTableRow} />
              {renderPagination()}
            </>
          )}
        </>
      ) : (
        <>
          {paginatedClasses.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm">No classes found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {paginatedClasses.map((classData) => (
                  <ClassCard
                    key={classData._id}
                    classData={classData}
                    onView={() => onViewDetails(classData)}
                    onEdit={() => onEditClass(classData)}
                    onDelete={() => setDeletingClass(classData)}
                  />
                ))}
              </div>
              {renderPagination()}
            </>
          )}
        </>
      )}

      <ConfirmationModal
        isOpen={!!deletingClass}
        onClose={() => setDeletingClass(null)}
        title="Delete Class"
        message="Are you sure you want to delete this class?"
        confirmLabel="Confirm Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AllClasses;
