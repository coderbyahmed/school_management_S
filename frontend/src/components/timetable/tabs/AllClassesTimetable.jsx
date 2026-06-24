import { useState } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const academicYearOptions = ['2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];

const CLASS_GROUPS = [
  { page: 1, classes: ['Montessori', 'Nursery', 'KG 1', 'KG 2'] },
  { page: 2, classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'] },
  { page: 3, classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'] },
];

const loadGroupData = (year, groupIdx) => {
  const group = CLASS_GROUPS[groupIdx];
  const result = {};
  group.classes.forEach(cls => {
    const key = `timetable_${year}_${cls}`;
    try {
      const saved = localStorage.getItem(key);
      result[cls] = saved ? JSON.parse(saved).periods || [] : [];
    } catch {
      result[cls] = [];
    }
  });
  return result;
};

const AllClassesTimetable = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [viewClicked, setViewClicked] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [groupData, setGroupData] = useState(null);

  const totalPages = CLASS_GROUPS.length;
  const currentGroup = CLASS_GROUPS[currentPage];
  const classes = currentGroup?.classes || [];

  const handleViewTimetable = () => {
    if (!academicYear) return;
    setViewClicked(true);
    setCurrentPage(0);
    setGroupData(loadGroupData(academicYear, 0));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setGroupData(loadGroupData(academicYear, page));
  };

  const handleReset = () => {
    setAcademicYear('');
    setViewClicked(false);
    setCurrentPage(0);
    setGroupData(null);
  };

  const hasData = groupData && Object.values(groupData).some(p => p.length > 0);
  const maxPeriodRows = groupData
    ? Math.max(...Object.values(groupData).map(p => p.length), 0)
    : 0;

  const getPeriodData = (className, idx) => {
    const periods = groupData?.[className];
    return periods?.[idx] || null;
  };

  const getTime = (idx) => {
    for (const cls of classes) {
      const p = getPeriodData(cls, idx);
      if (p?.startTime) return `${p.startTime} - ${p.endTime}`;
    }
    return `Period ${idx + 1}`;
  };

  const isBreak = (idx) => {
    for (const cls of classes) {
      const p = getPeriodData(cls, idx);
      if (p?.type === 'break') return true;
    }
    return false;
  };

  const renderTimetableGrid = () => {
    if (!hasData) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <CalendarDaysIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">No Timetable Data Available</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            No timetables have been created for this academic year. Please create timetables first.
          </p>
        </div>
      );
    }

    const rows = Array.from({ length: maxPeriodRows }, (_, i) => i);

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Academic Year: <span className="font-semibold text-gray-700 dark:text-gray-200">{academicYear}</span>
          </p>
          <div className="flex items-center gap-2">
            {CLASS_GROUPS.map((group, idx) => (
              <button
                key={group.page}
                onClick={() => handlePageChange(idx)}
                disabled={!viewClicked}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentPage === idx
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Group {group.page}
              </button>
            ))}
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
          >
            Reset
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th
                  className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-4 py-3.5 text-left whitespace-nowrap min-w-[140px]"
                  style={{ left: 0 }}
                >
                  Time
                </th>
                {classes.map((cls) => (
                  <th
                    key={cls}
                    className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-4 py-3.5 text-center whitespace-nowrap min-w-[150px]"
                  >
                    {cls}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map((rowIdx) => {
                const breakRow = isBreak(rowIdx);
                const trClass = breakRow
                  ? 'bg-amber-50 dark:bg-amber-900/10'
                  : 'bg-white dark:bg-gray-800/50 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors';

                if (breakRow) {
                  return (
                    <tr key={rowIdx} className={trClass}>
                      <td
                        className="sticky z-10 bg-amber-50 dark:bg-amber-900/10 px-4 py-3.5 text-xs font-semibold text-amber-700 dark:text-amber-300 whitespace-nowrap"
                        style={{ left: 0 }}
                      >
                        {getTime(rowIdx)}
                      </td>
                      <td
                        colSpan={classes.length}
                        className="px-4 py-3.5 text-center text-sm font-semibold text-amber-700 dark:text-amber-300"
                      >
                        BREAK — Recess Time
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={rowIdx} className={trClass}>
                    <td
                      className="sticky z-10 bg-white dark:bg-gray-800 px-4 py-3.5 text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap"
                      style={{ left: 0 }}
                    >
                      {getTime(rowIdx)}
                    </td>
                    {classes.map((cls) => {
                      const p = getPeriodData(cls, rowIdx);
                      return (
                        <td key={cls} className="px-4 py-3 text-center">
                          {p && p.type === 'period' ? (
                            <>
                              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                                {p.teacher || '-'}
                              </span>
                              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {p.subject || '-'}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Daily Timetable — Page {currentPage + 1} of {totalPages}
        </p>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 flex flex-col items-center justify-center text-center">
      <CalendarDaysIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">No Timetable Loaded</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        Please select Academic Year and click View Timetable.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="w-full sm:w-48">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Academic Year
          </label>
          <select
            value={academicYear}
            onChange={(e) => { setAcademicYear(e.target.value); setViewClicked(false); }}
            className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">Select year</option>
            {academicYearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleViewTimetable}
          disabled={!academicYear}
          className="px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <CalendarDaysIcon className="h-4 w-4" />
          View Timetable
        </button>
      </div>

      {viewClicked ? renderTimetableGrid() : renderEmptyState()}
    </div>
  );
};

export default AllClassesTimetable;
