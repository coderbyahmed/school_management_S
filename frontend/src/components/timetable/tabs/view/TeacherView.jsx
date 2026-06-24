import { useState, useEffect, useCallback } from 'react';
import { CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline';
import CardSection from '../../../common/CardSection';
import SelectInput from '../../../common/SelectInput';
import ConfirmationModal from '../../../common/ConfirmationModal';

const academicYears = ['2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];

const getTeachersFromStorage = (year) => {
  const teachers = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('timetable_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (year && data.academicYear !== year) continue;
        data.periods?.forEach((p) => {
          if (p.type === 'Teaching Period' && p.teacher) teachers.add(p.teacher);
        });
      } catch {}
    }
  }
  return [...teachers].sort();
};

const getTeacherSchedule = (year, teacher) => {
  const periods = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('timetable_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data.academicYear === year) {
          data.periods?.forEach((p) => {
            if (p.type === 'Teaching Period' && p.teacher === teacher) {
              periods.push({ ...p, className: data.className });
            }
          });
        }
      } catch {}
    }
  }
  return periods.sort((a, b) => a.startTime.localeCompare(b.startTime));
};

const formatTime = (t) => t || '--:--';

const TeacherView = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [viewClicked, setViewClicked] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const refreshTeachers = useCallback(() => {
    const teachers = getTeachersFromStorage(academicYear || undefined);
    setTeacherOptions(teachers);
    if (selectedTeacher && !teachers.includes(selectedTeacher)) {
      setSelectedTeacher('');
    }
  }, [academicYear, selectedTeacher]);

  useEffect(() => {
    refreshTeachers();
  }, [refreshTeachers, academicYear, viewClicked]);

  const handleView = () => {
    if (!academicYear || !selectedTeacher) return;
    setViewClicked(true);
    setSchedule(getTeacherSchedule(academicYear, selectedTeacher));
  };

  const handleDeleteAll = () => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('timetable_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.academicYear === academicYear) {
            const hasTeacher = data.periods?.some(
              (p) => p.type === 'Teaching Period' && p.teacher === selectedTeacher
            );
            if (hasTeacher) localStorage.removeItem(key);
          }
        } catch {}
      }
    }
    setSchedule([]);
    setShowDeleteConfirm(false);
    setViewClicked(false);
    setTeacherOptions(getTeachersFromStorage());
  };

  const renderSchedule = () => {
    if (schedule.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <UserIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">No Schedule Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            No timetable entries found for {selectedTeacher} ({academicYear}).
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-800 dark:text-white bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
              {selectedTeacher}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{academicYear}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              Delete Timetable
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {schedule.map((period, idx) => {
            const timeStr = `${formatTime(period.startTime)} - ${formatTime(period.endTime)}`;
            return (
              <div
                key={period.id || idx}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2">
                  <span className="block text-xs font-medium text-blue-100">{timeStr}</span>
                </div>
                <div className="px-4 py-3 space-y-1.5">
                  <span className="block text-[11px] font-medium text-gray-400 dark:text-gray-500">{period.periodName}</span>
                  <span className="block text-xs font-semibold text-gray-900 dark:text-white">{period.className}</span>
                  <span className="inline-block text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-full">
                    {period.subject || '-'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Teacher Timetable"
          message={`This will remove all timetables containing ${selectedTeacher}'s classes. Are you sure?`}
          confirmLabel="Confirm Delete"
          variant="danger"
          onConfirm={handleDeleteAll}
        />
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Teacher Timetable</h2>
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
                label="Teacher"
                name="selectedTeacher"
                value={selectedTeacher}
                onChange={(e) => { setSelectedTeacher(e.target.value); setViewClicked(false); }}
                options={teacherOptions}
                placeholder={teacherOptions.length > 0 ? 'Select teacher' : 'No teachers available'}
              />
            </div>
            <div className="pb-4">
              <button
                onClick={handleView}
                disabled={!academicYear || !selectedTeacher}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CalendarDaysIcon className="h-4 w-4" />
                View Timetable
              </button>
            </div>
          </div>
        </CardSection>
      </div>

      {viewClicked && renderSchedule()}
    </div>
  );
};

export default TeacherView;
