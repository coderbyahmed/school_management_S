import { useState, useMemo, useCallback } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import CardSection from '../../common/CardSection';
import SelectInput from '../../common/SelectInput';
import SearchInput from '../../common/SearchInput';
import Table from '../../common/Table';
import StatusBadge from '../../common/StatusBadge';
import ConfirmationModal from '../../common/ConfirmationModal';

const classOptions = [
  'Montessori', 'Nursery', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const academicYears = ['2025', '2026', '2027', '2028', '2029', '2030'];

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

const StudentPromotion = () => {
  const [fromYear, setFromYear] = useState('2026');
  const [toYear, setToYear] = useState('2027');
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loaded, setLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const toYearOptions = academicYears.filter((y) => y !== fromYear);
  const fromClassIndex = classOptions.indexOf(fromClass);
  const toClassOptions = fromClass ? classOptions.slice(fromClassIndex + 1) : [];

  const handleFromClassChange = useCallback((e) => {
    const newFromClass = e.target.value;
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
    if (!loaded) return [];
    return [].filter((s) => {
      if (fromClass && s.class !== fromClass) return false;
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (nameSearch && !s.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
      return true;
    });
  }, [loaded, fromClass, statusFilter, nameSearch]);

  const allSelected = filteredStudents.length > 0 && selectedIds.size === filteredStudents.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleLoad = () => {
    setLoaded(true);
    setSelectedIds(new Set());
  };

  const handlePromote = () => {
    setConfirmOpen(true);
  };

  const handleConfirmPromotion = () => {
    setConfirmOpen(false);
    setSelectedIds(new Set());
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
    const suggestedClass = toClass || promotionMap[student.class] || student.class;

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
        <td className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">{suggestedClass}</td>
        <td className="px-4 py-3">
          <StatusBadge status={student.status} />
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
            onChange={(e) => setFromYear(e.target.value)}
            options={['2025', '2026', '2027']}
          />
          <SelectInput
            label="To Academic Year"
            name="toYear"
            value={toYear}
            onChange={(e) => setToYear(e.target.value)}
            options={toYearOptions}
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
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-transparent text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Load Students
            </button>
          </div>
        </div>

        {loaded ? (
          <>
            <div className="mb-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                Select All ({filteredStudents.length} students)
              </label>
            </div>
            <Table columns={columns} data={filteredStudents} renderRow={renderRow} />
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
        onClose={() => setConfirmOpen(false)}
        title={selectedIds.size > 1 ? "Confirm Students Promotion" : "Confirm Student Promotion"}
        confirmLabel="Confirm Promotion"
        onConfirm={handleConfirmPromotion}
        variant="primary"
        maxWidth={selectedIds.size > 1 ? "max-w-lg" : "max-w-md"}
      >
        {selectedIds.size > 1 ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected Students: <span className="font-semibold text-gray-900 dark:text-white">{selectedIds.size}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-7 px-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  {fromClass}
                </span>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-7-7m7 7l-7 7" />
                </svg>
                <span className="inline-flex items-center justify-center h-7 px-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                  {toClass}
                </span>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 -mr-1">
              {filteredStudents
                .filter((s) => selectedIds.has(s.id))
                .map((s) => {
                  const targetClass = toClass || promotionMap[s.class] || s.class;
                  return (
                    <div key={s.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 min-w-0 truncate">{s.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{s.class}</span>
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
                .filter((s) => selectedIds.has(s.id))
                .map((s) => {
                  const targetClass = toClass || promotionMap[s.class] || s.class;
                  return (
                    <div key={s.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                      <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</span>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <span className="inline-flex items-center justify-center w-16 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                          {s.class}
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
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Are you sure you want to promote this student?
            </p>
          </>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default StudentPromotion;
