import { useState, useEffect } from 'react';
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
import dummyStudentsData from '../../../data/dummyStudents';

const ITEMS_PER_PAGE = 10;

const classOptions = [
  'All Classes', 'Montessori', 'Nursery', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const statusOptions = ['All', 'Active', 'Inactive'];

const AllStudents = () => {
  const [view, setView] = useState('table');
  const [studentIdSearch, setStudentIdSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [statusFilter, setStatusFilter] = useState('All');
  const [nameSearch, setNameSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [students, setStudents] = useState(dummyStudentsData);

  const filteredStudents = students.filter((s) => {
    if (studentIdSearch && !s.id.toLowerCase().includes(studentIdSearch.toLowerCase())) return false;
    if (classFilter !== 'All Classes' && s.class !== classFilter) return false;
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (nameSearch && !s.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [studentIdSearch, classFilter, statusFilter, nameSearch]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleReset = () => {
    setClassFilter('All Classes');
    setStatusFilter('All');
    setNameSearch('');
    setCurrentPage(1);
  };

  const totalStudents = students.length;
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0">
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Son of {student.fatherName}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.id}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.class}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.gender}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.parentPhone}</td>
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
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {Math.min(filteredStudents.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length}
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Students</h1>
        <div className="w-full sm:w-64">
          <SearchInput
            placeholder="Enter Student ID"
            value={studentIdSearch}
            onChange={setStudentIdSearch}
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
            onChange={setClassFilter}
          />
        </div>
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
            placeholder="Search Student Name"
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
          <Table columns={tableColumns} data={paginatedStudents} renderRow={renderTableRow} />
          {renderPagination()}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedStudents.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-400 dark:text-gray-500">
                No records found
              </div>
            ) : (
              paginatedStudents.map((student) => (
                <StudentCard
                  key={student.id}
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

      <StudentViewModal
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      <EditStudentModal
        student={editingStudent}
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={(updatedStudent) => {
          setStudents((prev) =>
            prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
          );
          setEditingStudent(null);
        }}
      />

      <ConfirmationModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        title="Delete Student"
        message="Are you sure you want to delete this student?"
        confirmLabel="Confirm Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          setStudents((prev) => prev.filter((s) => s.id !== deletingStudent.id));
          setDeletingStudent(null);
        }}
      />
    </div>
  );
};

export default AllStudents;
