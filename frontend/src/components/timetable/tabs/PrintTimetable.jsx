import { useState, useEffect } from 'react';
import { PrinterIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import CardSection from '../../common/CardSection';
import SelectInput from '../../common/SelectInput';
import Alert from '../../common/Alert';

const academicYears = ['2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];

const GROUPS = [
  { name: 'Montessori to KG 2', classes: ['Montessori', 'Nursery', 'KG 1', 'KG 2'] },
  { name: 'Class 1 to Class 5', classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'] },
  { name: 'Class 6 to Class 10', classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'] },
];

const formatTime = (t) => t || '--:--';

const loadGroupData = (year, groupIndex) => {
  const group = GROUPS[groupIndex];
  if (!group) return null;
  const classes = group.classes;

  const classPeriods = {};
  let maxPeriods = 0;
  let hasAny = false;

  classes.forEach((cls) => {
    try {
      const key = `timetable_${year}_${cls}`;
      const saved = localStorage.getItem(key);
      const data = saved ? JSON.parse(saved) : null;
      const periods = data?.periods || [];
      classPeriods[cls] = periods;
      if (periods.length > 0) hasAny = true;
      maxPeriods = Math.max(maxPeriods, periods.length);
    } catch {
      classPeriods[cls] = [];
    }
  });

  if (!hasAny) return null;

  const rows = [];
  for (let i = 0; i < maxPeriods; i++) {
    const cells = {};
    let isBreak = false;
    let breakName = '';
    let timeStr = '';
    let anyHasData = false;

    classes.forEach((cls) => {
      const period = classPeriods[cls]?.[i];
      if (period) {
        anyHasData = true;
        cells[cls] = {
          teacher: period.teacher || '',
          subject: period.subject || '',
          type: period.type || 'Teaching Period',
          breakName: period.breakName || '',
          startTime: period.startTime,
          endTime: period.endTime,
        };
        if (!timeStr && period.startTime) {
          timeStr = `${formatTime(period.startTime)} - ${formatTime(period.endTime)}`;
        }
        if (period.type === 'Break') {
          isBreak = true;
          breakName = period.breakName || 'Break';
        }
      } else {
        cells[cls] = null;
      }
    });

    if (anyHasData) {
      rows.push({ cells, isBreak, breakName, timeStr });
    }
  }

  return { rows, classes, groupName: group.name, academicYear: year };
};

const Template1Colorful = ({ data }) => {
  const { rows, classes, groupName, academicYear } = data;

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/40 flex-shrink-0">IQ</div>
          <div>
            <h1 className="text-sm font-bold tracking-wide">IQRA ANWAR UL QURAN SECONDARY SCHOOL</h1>
            <p className="text-[10px] text-blue-200">Teachers Period Time Table</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2 text-[10px] text-blue-100 border-t border-blue-500 pt-2">
          <span className="font-medium">{groupName}</span>
          <span className="font-medium">Academic Year: {academicYear}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold text-gray-600 bg-gradient-to-b from-gray-50 to-white border-b-2 border-blue-500 w-28">Time</th>
              {classes.map((cls) => (
                <th key={cls} className="px-3 py-2.5 text-center font-semibold bg-gradient-to-b from-blue-50 to-white border-b-2 border-blue-500 min-w-[100px]">
                  <span className="text-blue-800">{cls}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              if (row.isBreak) {
                return (
                  <tr key={ri}>
                    <td className="px-3 py-3 align-middle font-medium text-amber-700 bg-amber-50 border-b border-amber-200 text-xs">{row.timeStr}</td>
                    <td colSpan={classes.length} className="px-4 py-3 text-center font-bold italic text-amber-800 bg-amber-50 border-b border-amber-200 text-xs">
                      <span className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider text-[9px] font-bold">
                        {row.breakName}
                      </span>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={ri} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-3 py-2.5 align-middle font-semibold text-blue-700 bg-blue-50/30 border-b border-gray-200 text-[10px]">{row.timeStr}</td>
                  {classes.map((cls) => {
                    const cell = row.cells[cls];
                    return (
                      <td key={cls} className="px-3 py-2.5 text-center border-b border-gray-200">
                        {cell ? (
                          <div className="space-y-0.5">
                            <span className="block text-[11px] font-bold text-gray-800">{cell.teacher}</span>
                            <span className="block text-[9px] text-gray-500">{cell.subject}</span>
                          </div>
                        ) : (
                          <span className="text-gray-200 text-xs">—</span>
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

      <div className="border-t border-gray-200 px-5 py-2.5 text-center text-[8px] text-gray-400 space-y-0.5 bg-gray-50/50">
        <p className="font-medium text-gray-500 text-[9px]">IQRA Anwar Ul Quran Secondary School</p>
        <p>Phone: (021) 1234-5678 | Email: info@iqraschool.edu.pk</p>
      </div>
    </div>
  );
};

const Template2BW = ({ data }) => {
  const { rows, classes, groupName, academicYear } = data;

  return (
    <div className="bg-white text-black" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <div className="text-center border-b-2 border-black pb-2 mb-3">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-bold flex-shrink-0">IQ</div>
          <h1 className="text-sm font-bold tracking-wide uppercase">IQRA ANWAR UL QURAN SECONDARY SCHOOL</h1>
        </div>
        <p className="text-[11px] text-gray-600 italic">Teachers Period Time Table</p>
      </div>

      <div className="flex justify-between items-center mb-3 text-[10px] border-b border-gray-300 pb-2">
        <span className="font-bold">{groupName}</span>
        <span className="font-bold">Academic Year: {academicYear}</span>
      </div>

      <table className="w-full border-collapse border border-gray-800 text-[9px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-800 px-2 py-1.5 text-left font-bold w-24">Time</th>
            {classes.map((cls) => (
              <th key={cls} className="border border-gray-800 px-2 py-1.5 text-center font-bold">{cls}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            if (row.isBreak) {
              return (
                <tr key={ri} className="bg-gray-50">
                  <td className="border border-gray-800 px-2 py-2 align-middle font-medium text-xs">{row.timeStr}</td>
                  <td colSpan={classes.length} className="border border-gray-800 px-4 py-2 text-center font-bold italic text-gray-600 text-[10px]">
                    {row.breakName}
                  </td>
                </tr>
              );
            }

            return (
              <tr key={ri}>
                <td className="border border-gray-800 px-2 py-1.5 align-middle font-medium text-[9px]">{row.timeStr}</td>
                {classes.map((cls) => {
                  const cell = row.cells[cls];
                  return (
                    <td key={cls} className="border border-gray-800 px-2 py-1.5 text-center">
                      {cell ? (
                        <div className="space-y-0.5">
                          <span className="block text-[10px] font-bold">{cell.teacher}</span>
                          <span className="block text-[8px] text-gray-600">{cell.subject}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-[9px]">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-3 pt-2 border-t border-gray-400 text-center text-[8px] text-gray-600 space-y-0.5">
        <p className="font-semibold text-gray-700 text-[9px]">IQRA Anwar Ul Quran Secondary School</p>
        <p>Phone: (021) 1234-5678 | Email: info@iqraschool.edu.pk</p>
      </div>
    </div>
  );
};

const templates = [
  { id: 1, name: 'Template 1 — Colorful', desc: 'Modern colorful school display board design' },
  { id: 2, name: 'Template 2 — B/W Classic', desc: 'Black & white professional printable design' },
];

const PrintTimetable = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTemplate, setActiveTemplate] = useState(1);
  const [gridData, setGridData] = useState(null);

  useEffect(() => {
    if (!academicYear) {
      setGridData(null);
      return;
    }
    setGridData(loadGroupData(academicYear, currentPage));
  }, [academicYear, currentPage]);

  const handlePrint = () => {
    window.print();
  };

  const printStyles = `
    @media print {
      body * { visibility: hidden; }
      #print-timetable, #print-timetable * { visibility: visible; }
      #print-timetable { position: absolute; left: 0; top: 0; width: 100%; }
      @page { margin: 10mm; size: A4 landscape; }
    }
  `;

  return (
    <div className="space-y-6">
      <style>{printStyles}</style>

      <div className="print:hidden">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Print Timetable</h2>

        <CardSection title="">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-full sm:w-56">
              <SelectInput
                label="Academic Year"
                name="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                options={academicYears}
                placeholder="Select year"
              />
            </div>
            <div className="pb-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0 || !academicYear}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous group"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                {GROUPS.map((group, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    disabled={!academicYear}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      currentPage === idx
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(2, currentPage + 1))}
                  disabled={currentPage === 2 || !academicYear}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next group"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {academicYear && (
            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTemplate(t.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTemplate === t.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {t.name}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={handlePrint}
                disabled={!gridData}
                className="px-5 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <PrinterIcon className="h-4 w-4" />
                Print Timetable
              </button>
            </div>
          )}
        </CardSection>

        {gridData && gridData.rows.length > 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 md:p-6" id="print-timetable">
              <div className="max-w-full mx-auto print:max-w-none">
                {activeTemplate === 1 ? (
                  <Template1Colorful data={gridData} />
                ) : (
                  <Template2BW data={gridData} />
                )}
              </div>
            </div>
          </div>
        ) : academicYear ? (
          <Alert
            type="warning"
            message={`No timetable data found for ${GROUPS[currentPage]?.name || 'the selected group'} (${academicYear}). Create timetables first in the Create Timetable tab.`}
          />
        ) : null}
      </div>
    </div>
  );
};

export default PrintTimetable;
