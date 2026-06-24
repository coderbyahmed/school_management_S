import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Modal from '../../../common/Modal';

const teacherOptions = ['Ahmed Ali', 'Usman Khan', 'Sana Ahmed', 'Fatima Noor'];
const subjectOptions = ['English', 'Urdu', 'Mathematics', 'Science', 'Computer'];

const fieldClass = 'w-full px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';
const selectFieldClass = 'appearance-none w-full px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer';
const labelClass = 'block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5';

const EditTimetableModal = ({ timetableData, onSave, onClose }) => {
  const [periods, setPeriods] = useState(() => {
    return (timetableData.periods || []).map((p) => ({ ...p }));
  });

  const addPeriod = () => {
    setPeriods((prev) => [
      ...prev,
      {
        id: Date.now(),
        periodName: `Period ${prev.length + 1}`,
        startTime: '',
        endTime: '',
        subject: '',
        teacher: '',
        breakName: '',
        type: 'Teaching Period',
      },
    ]);
  };

  const updatePeriod = (id, field, value) => {
    setPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleTypeChange = (id, newType) => {
    setPeriods((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (newType === 'Break') return { ...p, type: 'Break', subject: '', teacher: '' };
        return { ...p, type: 'Teaching Period', breakName: '' };
      })
    );
  };

  const deletePeriod = (id) => {
    setPeriods((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = () => {
    if (periods.length === 0) return;
    onSave({
      ...timetableData,
      periods: periods.map((p) => ({ ...p })),
      savedAt: new Date().toISOString(),
    });
  };

  const getIndex = (id) => periods.findIndex((p) => p.id === id) + 1;

  return (
    <Modal isOpen onClose={onClose} title={`Edit Timetable — ${timetableData.className}`} maxWidth="max-w-4xl">
      <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
        {periods.map((period) => {
          const isBreak = period.type === 'Break';
          const idx = getIndex(period.id);

          return (
            <div
              key={period.id}
              className={`flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                isBreak
                  ? 'border-l-4 border-l-amber-400 border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
                  : 'border-l-4 border-l-blue-400 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60'
              }`}
            >
              <span className="text-xs font-semibold text-gray-400 w-5 flex-shrink-0">{idx}.</span>

              <div className="min-w-[90px] flex-1">
                <label className={labelClass}>Period</label>
                <input
                  type="text"
                  value={period.periodName}
                  onChange={(e) => updatePeriod(period.id, 'periodName', e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="min-w-[75px] flex-1">
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

              <div className="min-w-[80px] flex-1">
                <label className={labelClass}>Start</label>
                <input
                  type="time"
                  value={period.startTime}
                  onChange={(e) => updatePeriod(period.id, 'startTime', e.target.value)}
                  className={`${fieldClass} [color-scheme:light] dark:[color-scheme:dark]`}
                />
              </div>

              <div className="min-w-[80px] flex-1">
                <label className={labelClass}>End</label>
                <input
                  type="time"
                  value={period.endTime}
                  onChange={(e) => updatePeriod(period.id, 'endTime', e.target.value)}
                  className={`${fieldClass} [color-scheme:light] dark:[color-scheme:dark]`}
                />
              </div>

              {isBreak ? (
                <div className="min-w-[110px] flex-[2]">
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
                  <div className="min-w-[85px] flex-1">
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
                  <div className="min-w-[85px] flex-1">
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
        })}

        {periods.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No periods. Add one below.</p>
        )}
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={addPeriod}
          className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add Period
        </button>
        <div className="flex-1" />
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={periods.length === 0}
          className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

export default EditTimetableModal;
