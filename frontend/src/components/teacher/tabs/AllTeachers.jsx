import { useState, useEffect } from 'react';
import { UsersIcon, UserGroupIcon, UserMinusIcon, UserPlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import FilterDropdown from '../../common/FilterDropdown';
import SearchInput from '../../common/SearchInput';
import ViewToggle from '../../common/ViewToggle';
import Table from '../../common/Table';
import StatusBadge from '../../common/StatusBadge';
import ActionButtons from '../../common/ActionButtons';
import TeacherCard from '../../common/TeacherCard';
import TeacherViewModal from '../../common/TeacherViewModal';
import EditTeacherModal from '../../common/EditTeacherModal';
import ConfirmationModal from '../../common/ConfirmationModal';

const ITEMS_PER_PAGE = 10;

const statusOptions = ['All', 'Active', 'Inactive'];

const AllTeachers = () => {
  const [view, setView] = useState('table');
  const [teacherIdSearch, setTeacherIdSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [nameSearch, setNameSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [deletingTeacher, setDeletingTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);

  const filteredTeachers = teachers.filter((t) => {
    if (teacherIdSearch && !t.teacherId?.toLowerCase().includes(teacherIdSearch.toLowerCase())) return false;
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (nameSearch && !t.fullName?.toLowerCase().includes(nameSearch.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [teacherIdSearch, statusFilter, nameSearch]);

  const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleReset = () => {
    setStatusFilter('All');
    setNameSearch('');
    setCurrentPage(1);
  };

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.status === 'Active').length;
  const inactiveTeachers = teachers.filter((t) => t.status === 'Inactive').length;

  const tableColumns = [
    { key: 'teacher', label: 'Teacher' },
    { key: 'teacherId', label: 'Teacher ID' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'joiningDate', label: 'Joining Date' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderTableRow = (teacher) => {
    const initials = teacher.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TC';

    return (
      <>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{teacher.fullName}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{teacher.teacherId}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{teacher.phone}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{teacher.joiningDate}</td>
        <td className="px-4 py-3">
          <StatusBadge status={teacher.status} />
        </td>
        <td className="px-4 py-3 text-right">
          <ActionButtons
            onView={() => setSelectedTeacher(teacher)}
            onEdit={() => setEditingTeacher(teacher)}
            onDelete={() => setDeletingTeacher(teacher)}
          />
        </td>
      </>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {Math.min(filteredTeachers.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}&ndash;{Math.min(currentPage * ITEMS_PER_PAGE, filteredTeachers.length)} of {filteredTeachers.length}
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Teachers</h1>
        <div className="w-full sm:w-64">
          <SearchInput
            placeholder="Enter Teacher ID"
            value={teacherIdSearch}
            onChange={setTeacherIdSearch}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UsersIcon} label="Total Teachers" value={totalTeachers} color="blue" />
        <StatCard icon={UserGroupIcon} label="Active Teachers" value={activeTeachers} color="green" />
        <StatCard icon={UserMinusIcon} label="Inactive Teachers" value={inactiveTeachers} color="red" />
        <StatCard icon={UserPlusIcon} label="New Teachers" value={0} color="yellow" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end flex-wrap">
        <div className="w-full sm:w-36">
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
        <div className="w-full sm:w-56">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
            Search By Name
          </label>
          <SearchInput
            placeholder="Search Teacher Name"
            value={nameSearch}
            onChange={setNameSearch}
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
          {filteredTeachers.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <Table columns={tableColumns} data={paginatedTeachers} renderRow={renderTableRow} />
            </div>
          ) : (
            <>
              <Table columns={tableColumns} data={paginatedTeachers} renderRow={renderTableRow} />
              {renderPagination()}
            </>
          )}
        </>
      ) : (
        <>
          {paginatedTeachers.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm">No teachers found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {paginatedTeachers.map((teacher) => (
                  <TeacherCard
                    key={teacher.teacherId}
                    teacher={teacher}
                    onView={() => setSelectedTeacher(teacher)}
                    onEdit={() => setEditingTeacher(teacher)}
                    onDelete={() => setDeletingTeacher(teacher)}
                  />
                ))}
              </div>
              {renderPagination()}
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
        teacher={editingTeacher}
        isOpen={!!editingTeacher}
        onClose={() => setEditingTeacher(null)}
        onSave={(teacherId, formData) => {
          return Promise.resolve();
        }}
      />

      <ConfirmationModal
        isOpen={!!deletingTeacher}
        onClose={() => setDeletingTeacher(null)}
        title="Delete Teacher"
        message="Are you sure you want to delete this teacher?"
        confirmLabel="Confirm Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          setTeachers((prev) => prev.filter((t) => t.teacherId !== deletingTeacher.teacherId));
          setDeletingTeacher(null);
        }}
      />
    </div>
  );
};

export default AllTeachers;
