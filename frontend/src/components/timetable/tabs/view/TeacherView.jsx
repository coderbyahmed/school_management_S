import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UserIcon } from '@heroicons/react/24/outline';
import { ACADEMIC_YEARS } from '../../../../utils/classNames';
import TimetableFilters from './TimetableFilters';
import TimetableGrid from './TimetableGrid';
import TimetableEmptyState from './TimetableEmptyState';
import teacherService from '../../../../services/teacher.service';
import timetableService from '../../../../services/timetable.service';

const TeacherView = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [viewClicked, setViewClicked] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const teacherMap = {};
  teachers.forEach((t) => { teacherMap[t.fullName] = t; });

  useEffect(() => {
    teacherService.getAllTeachers()
      .then((res) => {
        const list = res?.data?.teachers || [];
        setTeachers(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoadingTeachers(false));
  }, []);

  const handleFilterChange = useCallback((name, value) => {
    if (name === 'academicYear') {
      setAcademicYear(value);
      setSelectedTeacher('');
    }
    if (name === 'teacher') {
      setSelectedTeacher(value);
    }
    setViewClicked(false);
  }, []);

  const handleView = useCallback(async () => {
    if (!academicYear || !selectedTeacher) return;
    setViewClicked(true);
    setLoadingSchedule(true);
    setSchedule([]);
    const teacherObj = teacherMap[selectedTeacher];
    const teacherId = teacherObj?._id;
    try {
      const res = await timetableService.getAllTimetables();
      const allTts = res?.data?.timetables || [];
      const filtered = [];

      allTts.forEach((tt) => {
        if (tt.academicYear !== academicYear) return;
        (tt.periods || []).forEach((p) => {
          const tId = p.teacherId?._id?.toString() || p.teacherId?.toString();
          if (teacherId && tId === teacherId.toString()) {
            filtered.push({
              id: p._id || p.id || `${tt._id}-${p.periodNo}`,
              startTime: p.startTime,
              endTime: p.endTime,
              subject: p.subjectId?.subjectName || p.subjectId || '-',
              className: tt.classId?.className || 'Unknown',
              type: 'Teaching',
            });
          }
        });
      });

      filtered.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      setSchedule(filtered);
    } catch {
      toast.error('Failed to load schedule');
    } finally {
      setLoadingSchedule(false);
    }
  }, [academicYear, selectedTeacher, teacherMap]);

  const canView = academicYear && selectedTeacher;
  const hasData = schedule.length > 0;

  const teacherOptions = teachers.map((t) => t.fullName);

  return (
    <div className="space-y-6">
      <TimetableFilters
        filters={[
          { name: 'academicYear', label: 'Academic Year', value: academicYear, options: ACADEMIC_YEARS, placeholder: 'Select year' },
          { name: 'teacher', label: 'Teacher', value: selectedTeacher, options: teacherOptions, placeholder: loadingTeachers ? 'Loading...' : 'Select teacher' },
        ]}
        onFilterChange={handleFilterChange}
        onView={handleView}
        viewDisabled={!canView || loadingSchedule}
        viewLabel={loadingSchedule ? 'Loading...' : 'View Timetable'}
      />

      {viewClicked && !loadingSchedule && !hasData && (
        <TimetableEmptyState
          icon={UserIcon}
          title="No Schedule Found"
          description={`No timetable entries found for ${selectedTeacher} (${academicYear}).`}
        />
      )}

      {loadingSchedule && (
        <TimetableEmptyState
          icon={UserIcon}
          title="Loading..."
          description="Fetching schedule data."
        />
      )}

      {hasData && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-white bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                <UserIcon className="h-4 w-4 text-blue-500" />
                {selectedTeacher}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">{academicYear}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{schedule.length} periods</span>
            </div>
          </div>

          <TimetableGrid periods={schedule} mode="teacher" />
        </>
      )}
    </div>
  );
};

export default TeacherView;
