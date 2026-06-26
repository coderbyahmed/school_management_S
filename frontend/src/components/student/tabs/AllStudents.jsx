import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { UsersIcon, UserGroupIcon, UserMinusIcon, UserPlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import FilterDropdown from '../../common/FilterDropdown';
import SearchInput from '../../common/SearchInput';
import ViewToggle from '../../common/ViewToggle';
import Table from '../../common/Table';
import StatusBadge from '../../common/StatusBadge';
import ActionButtons from '../../common/ActionButtons';
import StudentCard from '../../common/StudentCard';
import StudentViewModal from '../../common/StudentViewModal';
import EditStudentModal from '../../common/EditStudentModal';
import ConfirmationModal from '../../common/ConfirmationModal';
import { getImageUrl } from '../../../utils/imageUrl';
import studentService from '../../../services/student.service';
import { CLASS_NAMES } from '../../../utils/classNames';

const ITEMS_PER_PAGE = 10;

const classOptions = ['All Classes', ...CLASS_NAMES];

const statusOptions = ['All', 'Active', 'Inactive'];

const AllStudents = () => {
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [studentIdFilter, setStudentIdFilter] = useState('');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ totalStudents: 0, totalPages: 0, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const debounceRef = useRef(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setFetchError('');

    try {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (classFilter !== 'All Classes') params.class = classFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      if (studentIdFilter.trim()) params.studentId = studentIdFilter.trim();

      const result = await studentService.getAllStudents(params);
      setStudents(result.data.students);
      setPagination(result.data.pagination);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load students';
      setFetchError(msg);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, classFilter, statusFilter, search, studentIdFilter]);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      fetchStudents();
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [currentPage, classFilter, statusFilter, search, studentIdFilter, fetchStudents]);

  const handleReset = () => {
    setClassFilter('All Classes');
    setStatusFilter('All');
    setSearch('');
    setStudentIdFilter('');
    setCurrentPage(1);
  };

  const handleEditSave = async (studentId, formData) => {
    await studentService.updateStudent(studentId, formData);
    setEditingStudent(null);
    fetchStudents();
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await studentService.deleteStudent(deletingStudent.studentId);
      toast.success('Student deleted successfully');
      setDeletingStudent(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalStudents = pagination.totalStudents;
  const activeStudents = students.filter((s) => s.status === 'Active').length;
  const inactiveStudents = students.filter((s) => s.status === 'Inactive').length;
  const newAdmissions = students.filter((s) => ['Nursery', 'Montessori', 'KG 1'].includes(s.class)).length;

  const tableColumns = [
    { key: 'student', label: 'Student' },
    { key: 'id', label: 'Student ID' },
    { key: 'class', label: 'Class' },
    { key: 'gender', label: 'Gender' },
    { key: 'parentPhone', label: 'Parent Phone' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', className: 'text-right' },
  ];

  const renderTableRow = (student) => (
    <>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0 overflow-hidden">
            {getImageUrl(student.studentImage) ? (
              <img src={getImageUrl(student.studentImage)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{student.fullName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Son of {student.fatherName}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.studentId}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.class}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.gender}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.fatherPhone}</td>
      <td className="px-4 py-3">
        <StatusBadge status={student.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <ActionButtons
          onView={() => setSelectedStudent(student)}
          onEdit={() => setEditingStudent(student)}
          onDelete={() => setDeletingStudent(student)}
        />
      </td>
    </>
  );

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const totalPages = pagination.totalPages;
    const safeCurrentPage = pagination.currentPage;

    let start = Math.max(1, safeCurrentPage - 2);
    let end = Math.min(totalPages, safeCurrentPage + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, start + 4);
      else start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    const startRecord = (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
    const endRecord = Math.min(safeCurrentPage * ITEMS_PER_PAGE, pagination.totalStudents);

    return (
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {startRecord}–{endRecord} of {pagination.totalStudents}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage === 1 || loading}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Previous
          </button>
          {start > 1 && (
            <>
              <button onClick={() => setCurrentPage(1)} className="w-9 h-9 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">1</button>
              {start > 2 && <span className="px-1 text-gray-400">...</span>}
            </>
          )}
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              disabled={loading}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                safeCurrentPage === page
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="px-1 text-gray-400">...</span>}
              <button onClick={() => setCurrentPage(totalPages)} className="w-9 h-9 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">{totalPages}</button>
            </>
          )}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage === totalPages || loading}
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
      {fetchError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {fetchError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Students</h1>
        <div className="w-full sm:w-56">
          <SearchInput
            placeholder="Student ID"
            value={studentIdFilter}
            onChange={(v) => { setStudentIdFilter(v); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UsersIcon} label="Total Students" value={totalStudents} color="blue" />
        <StatCard icon={UserGroupIcon} label="Active Students" value={activeStudents} color="green" />
        <StatCard icon={UserMinusIcon} label="Inactive Students" value={inactiveStudents} color="red" />
        <StatCard icon={UserPlusIcon} label="New Admissions" value={newAdmissions} color="yellow" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end flex-wrap">
        <div className="w-full sm:w-44">
          <FilterDropdown
            label="Class"
            options={classOptions}
            value={classFilter}
            onChange={(v) => { setClassFilter(v); setCurrentPage(1); }}
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
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
            Search (ID, Name, Father Name)
          </label>
          <SearchInput
            placeholder="Search..."
            value={search}
            onChange={(v) => { setSearch(v); setCurrentPage(1); }}
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

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <>
          {view === 'table' ? (
            <>
              <Table columns={tableColumns} data={students} renderRow={renderTableRow} />
              {renderPagination()}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {students.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-400 dark:text-gray-500">
                    No records found
                  </div>
                ) : (
                  students.map((student) => (
                    <StudentCard
                      key={student.studentId}
                      student={student}
                      onView={() => setSelectedStudent(student)}
                      onEdit={() => setEditingStudent(student)}
                      onDelete={() => setDeletingStudent(student)}
                    />
                  ))
                )}
              </div>
              {renderPagination()}
            </>
          )}
        </>
      )}

      <StudentViewModal
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      <EditStudentModal
        key={editingStudent?.studentId || 'new'}
        student={editingStudent}
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={handleEditSave}
      />

      <ConfirmationModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        title="Delete Student"
        message={`Are you sure you want to delete ${deletingStudent?.fullName || 'this student'}?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AllStudents;
