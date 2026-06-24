import { useState } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import CardSection from '../../../common/CardSection';
import SelectInput from '../../../common/SelectInput';
import ConfirmationModal from '../../../common/ConfirmationModal';
import EditTimetableModal from './EditTimetableModal';

const academicYears = ['2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];

const classOptions = ['Montessori', 'Nursery', 'KG 1', 'KG 2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

const loadFromStorage = (year, cls) => {
  try {
    const key = `timetable_${year}_${cls}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const removeFromStorage = (year, cls) => {
  localStorage.removeItem(`timetable_${year}_${cls}`);
};

const formatTime = (t) => t || '--:--';

const ClassView = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [viewClicked, setViewClicked] = useState(false);
  const [timetableData, setTimetableData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleView = () => {
    if (!academicYear || !selectedClass) return;
    setDeleted(false);
    setViewClicked(true);
    setTimetableData(loadFromStorage(academicYear, selectedClass));
  };

  const handleEditSave = (updated) => {
    const key = `timetable_${updated.academicYear}_${updated.className}`;
    localStorage.setItem(key, JSON.stringify(updated));
    setTimetableData(updated);
    setShowEditModal(false);
  };

  const handleDeleteConfirm = () => {
    removeFromStorage(academicYear, selectedClass);
    setTimetableData(null);
    setDeleted(true);
    setShowDeleteConfirm(false);
  };

  const renderTimetable = () => {
    if (!timetableData || !timetableData.periods?.length) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <CalendarDaysIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {deleted ? 'Timetable Deleted' : 'No Timetable Found'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            {deleted
              ? 'The timetable has been removed.'
              : `No timetable found for ${selectedClass} (${academicYear}). Create one first.`}
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-800 dark:text-white bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
              {timetableData.className}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{timetableData.academicYear}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              Edit Timetable
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              Delete Timetable
            </button>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {timetableData.periods.map((period, idx) => {
            const isBreak = period.type === 'Break';
            const timeStr = `${formatTime(period.startTime)} - ${formatTime(period.endTime)}`;

            if (isBreak) {
              return (
                <div key={period.id || idx} className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-900/10 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-4 px-4 py-3">
                    <div className="flex items-center justify-center w-16 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 text-[9px] font-bold uppercase tracking-wider flex-shrink-0">
                      Break
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        {period.breakName || 'Break'}
                      </span>
                      <span className="block text-xs text-amber-600 dark:text-amber-400 mt-0.5">{timeStr}</span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={period.id || idx} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex items-stretch">
                  <div className="flex flex-col items-center justify-center min-w-[100px] px-3 py-3 bg-gradient-to-b from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 border-r border-gray-200 dark:border-gray-700">
                    <span className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{timeStr}</span>
                  </div>
                  <div className="flex flex-1 items-center justify-between px-4 py-3">
                    <div>
                      <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">{period.periodName}</span>
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{period.subject || '-'}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full whitespace-nowrap">
                      {period.teacher || '-'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showEditModal && (
          <EditTimetableModal
            timetableData={timetableData}
            onSave={handleEditSave}
            onClose={() => setShowEditModal(false)}
          />
        )}

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Timetable"
          message="Are you sure you want to delete this timetable?"
          confirmLabel="Confirm Delete"
          variant="danger"
          onConfirm={handleDeleteConfirm}
        />
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">View Timetable</h2>
        <CardSection title="">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-full sm:w-56">
              <SelectInput
                label="Academic Year"
                name="academicYear"
                value={academicYear}
                onChange={(e) => { setAcademicYear(e.target.value); setViewClicked(false); }}
                options={academicYears}
                placeholder="Select year"
              />
            </div>
            <div className="w-full sm:w-56">
              <SelectInput
                label="Class"
                name="selectedClass"
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setViewClicked(false); }}
                options={classOptions}
                placeholder="Select class"
              />
            </div>
            <div className="pb-4">
              <button
                onClick={handleView}
                disabled={!academicYear || !selectedClass}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CalendarDaysIcon className="h-4 w-4" />
                View Timetable
              </button>
            </div>
          </div>
        </CardSection>
      </div>

      {viewClicked && renderTimetable()}
    </div>
  );
};

export default ClassView;
