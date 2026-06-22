import { useState, useMemo, useCallback } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import CardSection from '../../common/CardSection';
import SelectInput from '../../common/SelectInput';
import SearchInput from '../../common/SearchInput';
import Table from '../../common/Table';
import StatusBadge from '../../common/StatusBadge';
import ConfirmationModal from '../../common/ConfirmationModal';
import studentService from '../../../services/student.service';
import { toast } from 'react-hot-toast';

const classOptions = [
  'Montessori', 'Nursery', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const statusOptions = ['All', 'Active', 'Inactive'];

const promotionMap = {
  'Montessori': 'Nursery',
  'Nursery': 'KG 1',
  'KG 1': 'KG 2',
  'KG 2': 'Class 1',
  'Class 1': 'Class 2',
  'Class 2': 'Class 3',
  'Class 3': 'Class 4',
  'Class 4': 'Class 5',
  'Class 5': 'Class 6',
  'Class 6': 'Class 7',
  'Class 7': 'Class 8',
  'Class 8': 'Class 9',
  'Class 9': 'Class 10',
  'Class 10': 'Class 10',
};

const safeName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return '??';
  return fullName.split(' ').map(n => n ? n[0] : '').join('').slice(0, 2).toUpperCase() || '??';
};

const safeSplitName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return '';
  return fullName;
};

const getImageUrl = (path) => {
  if (!path) return null;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
  return `${base}/${path}`;
};

const MIN_YEAR = 2025;
const MAX_YEAR = 2035;
const yearRange = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => String(MIN_YEAR + i));

const StudentPromotion = () => {
  const [fromYear, setFromYear] = useState('2026');
  const [toYear, setToYear] = useState('2027');
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loaded, setLoaded] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const toYearOptions = fromYear ? yearRange.filter((y) => Number(y) > Number(fromYear)) : [];
  const noValidToYear = fromYear && toYearOptions.length === 0;
  const fromClassIndex = classOptions.indexOf(fromClass);
  const toClassOptions = fromClass ? classOptions.slice(fromClassIndex + 1) : [];

  const handleFromYearChange = useCallback((e) => {
    const newFromYear = e?.target?.value || '';
    setFromYear(newFromYear);
    setToYear('');
  }, []);

  const handleFromClassChange = useCallback((e) => {
    const newFromClass = e?.target?.value || '';
    setFromClass(newFromClass);
    const idx = classOptions.indexOf(newFromClass);
    const remaining = classOptions.slice(idx + 1);
    if (remaining.length > 0 && !remaining.includes(toClass)) {
      setToClass(remaining[0]);
    } else if (remaining.length === 0) {
      setToClass('');
    }
  }, [toClass]);

  const filteredStudents = useMemo(() => {
    if (!loaded || !Array.isArray(students)) return [];
    return students.filter((s) => {
      if (!s) return false;
      if (fromClass && s.class !== fromClass) return false;
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (nameSearch && s.name && !s.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
      return true;
    });
  }, [loaded, students, fromClass, statusFilter, nameSearch]);

  const allSelected = filteredStudents.length > 0 && selectedIds.size === filteredStudents.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s?.id).filter(Boolean)));
    }
  };

  const toggleSelect = (id) => {
    if (!id) return;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const mapStudent = (s) => ({
    _id: s._id,
    id: s.studentId,
    name: s.fullName,
    fatherName: s.fatherName,
    class: s.class,
    status: s.status || 'Active',
    studentImage: s.studentImage,
    academicYear: s.academicYear,
  });

  const handleLoad = async () => {
    if (!fromYear) return toast.error('Please select From Academic Year.');
    if (!toYear) return toast.error('Please select To Academic Year.');
    if (!fromClass) return toast.error('Please select Current Class.');
    if (!toClass) return toast.error('Please select Target Class.');
    if (fromYear === toYear) return toast.error('From Academic Year and To Academic Year must be different.');
    if (fromClass === toClass) return toast.error('From Class and To Class cannot be the same.');

    setLoading(true);
    setError(null);
    try {
      const params = { class: fromClass };
      if (fromYear) params.academicYear = fromYear;

      const data = await studentService.filterStudentsForPromotion(params);
      if (data.success) {
        const mapped = (data.data?.students || []).map(mapStudent);
        setStudents(mapped);
        setLoaded(true);
        setSelectedIds(new Set());
        if (mapped.length === 0) {
          toast.error('No students found for the selected criteria.');
        } else {
          toast.success(`${mapped.length} student${mapped.length !== 1 ? 's' : ''} loaded successfully.`);
        }
      } else {
        toast.error(data.message || 'Failed to load students.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Network error.');
      setStudents([]);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = () => {
    setConfirmOpen(true);
  };

  const handleConfirmPromotion = async () => {
    setPromoting(true);
    try {
      const selectedStudents = students.filter((st) => selectedIds.has(st.id));
      const payload = {
        studentIds: selectedStudents.map((st) => st.id),
        fromClass,
        toClass,
        fromAcademicYear: fromYear,
        toAcademicYear: toYear,
      };
      const data = await studentService.promoteStudents(payload);
      if (data.success) {
        toast.success('Student(s) promoted successfully.');
        setConfirmOpen(false);
        setSelectedIds(new Set());
        setStudents([]);
        setLoaded(false);
        handleLoad();
      } else {
        toast.error(data.message || 'Promotion failed.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Promotion failed.');
    } finally {
      setPromoting(false);
    }
  };

  const columns = [
    { key: 'checkbox', label: '' },
    { key: 'student', label: 'Student' },
    { key: 'id', label: 'Student ID' },
    { key: 'currentClass', label: 'Current Class' },
    { key: 'promoteTo', label: 'Promote To' },
    { key: 'status', label: 'Status' },
  ];

  const renderRow = (student) => {
    if (!student) {
      return (
        <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
          No data available
        </td>
      );
    }

    const suggestedClass = toClass || promotionMap[student.class] || student.class || '—';

    return (
      <>
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={selectedIds.has(student.id)}
            onChange={() => toggleSelect(student.id)}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0 overflow-hidden">
              {getImageUrl(student.studentImage) ? (
                <img src={getImageUrl(student.studentImage)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : null}
              <span className={getImageUrl(student.studentImage) ? 'hidden' : ''}>{safeName(student.name)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{safeSplitName(student.name) || 'Unknown'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {student.fatherName ? `Son of ${student.fatherName}` : '—'}
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.id || '—'}</td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{student.class || '—'}</td>
        <td className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">{suggestedClass}</td>
        <td className="px-4 py-3">
          <StatusBadge status={student.status || 'Active'} />
        </td>
      </>
    );
  };

  return (
    <div className="space-y-5">
      <CardSection title="Promotion Settings">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 sm:gap-3">
          <SelectInput
            label="From Academic Year"
            name="fromYear"
            value={fromYear}
            onChange={handleFromYearChange}
            options={yearRange}
          />
          <SelectInput
            label="To Academic Year"
            name="toYear"
            value={toYear}
            onChange={(e) => setToYear(e.target.value)}
            options={toYearOptions}
            disabled={noValidToYear}
            placeholder={noValidToYear ? 'No higher academic year available.' : 'Select'}
          />
          <SelectInput
            label="From Class"
            name="fromClass"
            value={fromClass}
            onChange={handleFromClassChange}
            options={classOptions}
          />
          <SelectInput
            label="To Class"
            name="toClass"
            value={toClass}
            onChange={(e) => setToClass(e.target.value)}
            options={toClassOptions}
          />
        </div>
      </CardSection>

      <CardSection title="Student List">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-4">
          <div className="w-full sm:w-56">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Search Student Name
            </label>
            <SearchInput
              placeholder="Search student name"
              value={nameSearch}
              onChange={setNameSearch}
            />
          </div>
          <div className="w-full sm:w-36">
            <SelectInput
              label="Status"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              className="mb-0"
            />
          </div>
          <div className="sm:ml-auto">
            <button
              onClick={handleLoad}
              disabled={loading || !fromClass || !toYear}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-transparent text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Load Students'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {loaded ? (
          <>
            {filteredStudents.length > 0 ? (
              <>
                <div className="mb-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    Select All ({filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''})
                  </label>
                </div>
                <Table columns={columns} data={filteredStudents} renderRow={renderRow} />
              </>
            ) : (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                <p className="text-sm">No students found for the selected criteria</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <p className="text-sm">Select promotion criteria and click Load Students</p>
          </div>
        )}
      </CardSection>

      {loaded && selectedIds.size > 0 && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedIds.size} student{selectedIds.size > 1 ? 's' : ''} selected
          </p>
          <button
            onClick={handlePromote}
            className="px-5 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            Promote Selected Students
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => { if (!promoting) setConfirmOpen(false); }}
        title={selectedIds.size > 1 ? 'Confirm Students Promotion' : 'Confirm Student Promotion'}
        confirmLabel="Confirm Promotion"
        onConfirm={handleConfirmPromotion}
        variant="primary"
        loading={promoting}
        maxWidth={selectedIds.size > 1 ? 'max-w-lg' : 'max-w-md'}
      >
        {selectedIds.size > 1 ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected Students: <span className="font-semibold text-gray-900 dark:text-white">{selectedIds.size}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-7 px-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  {fromClass || '—'}
                </span>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-7-7m7 7l-7 7" />
                </svg>
                <span className="inline-flex items-center justify-center h-7 px-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                  {toClass || '—'}
                </span>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 -mr-1">
              {filteredStudents
                .filter((s) => s && selectedIds.has(s.id))
                .map((s, idx) => {
                  const targetClass = toClass || (s && promotionMap[s.class]) || (s && s.class) || '—';
                  return (
                    <div key={s?.id || `student-${idx}`} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
                        {getImageUrl(s?.studentImage) ? (
                          <img src={getImageUrl(s.studentImage)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : null}
                        <span className={getImageUrl(s?.studentImage) ? 'hidden' : ''}>{safeName(s?.name)}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 min-w-0 truncate">
                        {safeSplitName(s?.name) || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{s?.class || '—'}</span>
                      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-7-7m7 7l-7 7" />
                      </svg>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">{targetClass}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {filteredStudents
                .filter((s) => s && selectedIds.has(s.id))
                .map((s, idx) => {
                  const targetClass = toClass || (s && promotionMap[s.class]) || (s && s.class) || '—';
                  return (
                    <div key={s?.id || `single-${idx}`} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                      <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                          {getImageUrl(s?.studentImage) ? (
                            <img src={getImageUrl(s.studentImage)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : null}
                          <span className={getImageUrl(s?.studentImage) ? 'hidden' : ''}>{safeName(s?.name)}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {safeSplitName(s?.name) || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <span className="inline-flex items-center justify-center w-16 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                          {s?.class || '—'}
                        </span>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-7-7m7 7l-7 7" />
                        </svg>
                        <span className="inline-flex items-center justify-center w-16 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                          {targetClass}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
            {filteredStudents.filter((s) => s && selectedIds.has(s.id)).length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Are you sure you want to promote this student?
              </p>
            )}
          </>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default StudentPromotion;
