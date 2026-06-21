import { useState, useEffect } from 'react';
import { BookOpenIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import FilterDropdown from '../../common/FilterDropdown';
import SearchInput from '../../common/SearchInput';
import ViewToggle from '../../common/ViewToggle';
import Table from '../../common/Table';
import StatusBadge from '../../common/StatusBadge';
import ActionButtons from '../../common/ActionButtons';
import SubjectCard from '../../common/SubjectCard';
import SubjectViewModal from '../../common/SubjectViewModal';
import EditSubjectModal from '../../common/EditSubjectModal';
import ConfirmationModal from '../../common/ConfirmationModal';

const ITEMS_PER_PAGE = 10;

const statusOptions = ['All', 'Active', 'Inactive'];

const AllSubjects = () => {
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);

  const filteredSubjects = subjects.filter((s) => {
    if (search && !s.subjectName?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleReset = () => {
    setStatusFilter('All');
    setSearch('');
    setCurrentPage(1);
  };

  const totalSubjects = subjects.length;
  const activeSubjects = subjects.filter((s) => s.status === 'Active').length;
  const inactiveSubjects = subjects.filter((s) => s.status === 'Inactive').length;

  const tableColumns = [
    { key: 'subjectName', label: 'Subject Name' },
    { key: 'subjectCode', label: 'Subject Code' },
    { key: 'classes', label: 'Class Assigned' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderTableRow = (subject) => (
    <>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0">
            {subject.subjectName?.slice(0, 2).toUpperCase() || 'SB'}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{subject.subjectName}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{subject.subjectCode}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
        {(subject.assignedClasses?.length || 0) > 0
          ? subject.assignedClasses.slice(0, 2).join(', ') + ((subject.assignedClasses?.length || 0) > 2 ? '...' : '')
          : '-'}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={subject.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <ActionButtons
          onView={() => setSelectedSubject(subject)}
          onEdit={() => setEditingSubject(subject)}
          onDelete={() => setDeletingSubject(subject)}
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
          Showing {Math.min(filteredSubjects.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}&ndash;{Math.min(currentPage * ITEMS_PER_PAGE, filteredSubjects.length)} of {filteredSubjects.length}
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Subjects</h1>
        <div className="w-full sm:w-56">
          <SearchInput
            placeholder="Search Subject Name"
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={BookOpenIcon} label="Total Subjects" value={totalSubjects} color="blue" />
        <StatCard icon={CheckCircleIcon} label="Active Subjects" value={activeSubjects} color="green" />
        <StatCard icon={XCircleIcon} label="Inactive Subjects" value={inactiveSubjects} color="red" />
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
          {filteredSubjects.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <Table columns={tableColumns} data={paginatedSubjects} renderRow={renderTableRow} />
            </div>
          ) : (
            <>
              <Table columns={tableColumns} data={paginatedSubjects} renderRow={renderTableRow} />
              {renderPagination()}
            </>
          )}
        </>
      ) : (
        <>
          {paginatedSubjects.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm">No subjects found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {paginatedSubjects.map((subject) => (
                  <SubjectCard
                    key={subject.subjectCode}
                    subject={subject}
                    onView={() => setSelectedSubject(subject)}
                    onEdit={() => setEditingSubject(subject)}
                    onDelete={() => setDeletingSubject(subject)}
                  />
                ))}
              </div>
              {renderPagination()}
            </>
          )}
        </>
      )}

      <SubjectViewModal
        subject={selectedSubject}
        isOpen={!!selectedSubject}
        onClose={() => setSelectedSubject(null)}
      />

      <EditSubjectModal
        key={editingSubject?.subjectCode || 'new'}
        subject={editingSubject}
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        onSave={(subjectCode, formData) => {
          return Promise.resolve();
        }}
      />

      <ConfirmationModal
        isOpen={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        title="Delete Subject"
        message="Are you sure you want to delete this subject?"
        confirmLabel="Confirm Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          setSubjects((prev) => prev.filter((s) => s.subjectCode !== deletingSubject.subjectCode));
          setDeletingSubject(null);
        }}
      />
    </div>
  );
};

export default AllSubjects;
