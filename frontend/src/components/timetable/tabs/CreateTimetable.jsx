import { useState } from 'react';
import { PlusIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import CardSection from '../../common/CardSection';
import SelectInput from '../../common/SelectInput';
import Alert from '../../common/Alert';

const academicYears = ['2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];

const classOptions = ['Montessori', 'Nursery', 'KG 1', 'KG 2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

const teacherOptions = ['Ahmed Ali', 'Usman Khan', 'Sana Ahmed', 'Fatima Noor'];

const subjectOptions = ['English', 'Urdu', 'Mathematics', 'Science', 'Computer'];

const fieldClass = 'w-full px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';

const selectFieldClass = 'appearance-none w-full px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer';

const labelClass = 'block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5';

const CreateTimetable = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [periods, setPeriods] = useState([]);
  const [saved, setSaved] = useState(false);

  const addPeriod = () => {
    const newPeriod = {
      id: Date.now(),
      periodName: `Period ${periods.length + 1}`,
      startTime: '',
      endTime: '',
      subject: '',
      teacher: '',
      breakName: '',
      type: 'Teaching Period',
    };
    setPeriods([...periods, newPeriod]);
    setSaved(false);
  };

  const updatePeriod = (id, field, value) => {
    setPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    setSaved(false);
  };

  const handleTypeChange = (id, newType) => {
    setPeriods((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (newType === 'Break') {
          return { ...p, type: 'Break', subject: '', teacher: '' };
        }
        return { ...p, type: 'Teaching Period', breakName: '' };
      })
    );
    setSaved(false);
  };

  const deletePeriod = (id) => {
    setPeriods((prev) => prev.filter((p) => p.id !== id));
    setSaved(false);
  };

  const handleSave = () => {
    if (!academicYear || !selectedClass || periods.length === 0) return;
    const key = `timetable_${academicYear}_${selectedClass}`;
    const data = {
      id: Date.now(),
      academicYear,
      className: selectedClass,
      periods: periods.map((p) => ({ ...p })),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(data));
    setSaved(true);
  };

  const canSave = academicYear && selectedClass && periods.length > 0;

  const getPeriodNumber = (period) => {
    return periods.findIndex((p) => p.id === period.id) + 1;
  };

  const renderPeriodRow = (period) => {
    const isBreak = period.type === 'Break';
    const index = getPeriodNumber(period);

    return (
      <div
        key={period.id}
        className={`flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
          isBreak
            ? 'border-l-4 border-l-amber-400 border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
            : 'border-l-4 border-l-blue-400 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60'
        }`}
      >
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 w-5 flex-shrink-0">{index}.</span>

        <div className="min-w-[100px] flex-1">
          <label className={labelClass}>Period</label>
          <input
            type="text"
            value={period.periodName}
            onChange={(e) => updatePeriod(period.id, 'periodName', e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="min-w-[80px] flex-1">
          <label className={labelClass}>Type</label>
          <select
            value={period.type}
            onChange={(e) => handleTypeChange(period.id, e.target.value)}
            className={selectFieldClass}
          >
            <option value="Teaching Period">Teaching</option>
            <option value="Break">Break</option>
          </select>
        </div>

        <div className="min-w-[90px] flex-1">
          <label className={labelClass}>Start</label>
          <input
            type="time"
            value={period.startTime}
            onChange={(e) => updatePeriod(period.id, 'startTime', e.target.value)}
            className={`${fieldClass} [color-scheme:light] dark:[color-scheme:dark]`}
          />
        </div>

        <div className="min-w-[90px] flex-1">
          <label className={labelClass}>End</label>
          <input
            type="time"
            value={period.endTime}
            onChange={(e) => updatePeriod(period.id, 'endTime', e.target.value)}
            className={`${fieldClass} [color-scheme:light] dark:[color-scheme:dark]`}
          />
        </div>

        {isBreak ? (
          <div className="min-w-[120px] flex-[2]">
            <label className={labelClass}>Break Name</label>
            <input
              type="text"
              value={period.breakName}
              onChange={(e) => updatePeriod(period.id, 'breakName', e.target.value)}
              placeholder="e.g. Lunch Break"
              className={fieldClass}
            />
          </div>
        ) : (
          <>
            <div className="min-w-[90px] flex-1">
              <label className={labelClass}>Subject</label>
              <select
                value={period.subject}
                onChange={(e) => updatePeriod(period.id, 'subject', e.target.value)}
                className={selectFieldClass}
              >
                <option value="" disabled>Select</option>
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[90px] flex-1">
              <label className={labelClass}>Teacher</label>
              <select
                value={period.teacher}
                onChange={(e) => updatePeriod(period.id, 'teacher', e.target.value)}
                className={selectFieldClass}
              >
                <option value="" disabled>Select</option>
                {teacherOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <button
          onClick={() => deletePeriod(period.id)}
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors self-end mb-0.5 cursor-pointer flex-shrink-0"
          title="Delete"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <CardSection title="Timetable Settings">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-full sm:w-56">
            <SelectInput
              label="Academic Year"
              name="academicYear"
              value={academicYear}
              onChange={(e) => { setAcademicYear(e.target.value); setSaved(false); }}
              options={academicYears}
              placeholder="Select year"
            />
          </div>
          <div className="w-full sm:w-56">
            <SelectInput
              label="Class"
              name="selectedClass"
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setSaved(false); }}
              options={classOptions}
              placeholder="Select class"
            />
          </div>
          <div className="flex items-center gap-3 pb-4">
            <button
              onClick={addPeriod}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Period
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Save Timetable
            </button>
          </div>
        </div>
      </CardSection>

      {saved && (
        <Alert
          type="success"
          message={`Timetable saved successfully for ${selectedClass} (${academicYear}).`}
        />
      )}

      <CardSection title="Timetable Builder">
        {periods.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <ClockIcon className="h-14 w-14 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">No periods added yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Click &quot;Add Period&quot; to start building timetable.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {periods.map((period) => renderPeriodRow(period))}
          </div>
        )}
      </CardSection>
    </div>
  );
};

export default CreateTimetable;
