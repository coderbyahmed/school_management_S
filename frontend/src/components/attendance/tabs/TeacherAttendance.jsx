import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon, XCircleIcon, ClockIcon,
  CalendarDaysIcon, UsersIcon, LockClosedIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import SelectInput from '../../common/SelectInput';
import DateInput from '../../common/DateInput';
import { ACADEMIC_YEARS } from '../../../utils/classNames';
import { getImageUrl } from '../../../utils/imageUrl';
import attendanceService from '../../../services/attendance.service';
import demoDataService from '../../../services/demoData.service';

const STATUS_OPTIONS = ['Present', 'Absent', 'Leave', 'Late'];
const ATTENDANCE_MODES = ['Manual', 'Fingerprint Device', 'Face Recognition Device'];

const STATUS_STYLES = {
  Present: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Absent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  Leave: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  Late: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
};

const DevicePlaceholder = ({ title }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 flex flex-col items-center justify-center text-center">
    <div className="p-4 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 mb-4">
      <LockClosedIcon className="h-10 w-10 text-blue-400 dark:text-blue-500" />
    </div>
    <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">{title} — Hardware Required</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
      Biometric device integration is prepared. Connect the biometric machine to enable fingerprint and face attendance.
    </p>
    <div className="flex items-center gap-2 mt-4">
      <span className="w-2 h-2 rounded-full bg-yellow-400" />
      <span className="text-xs text-gray-400 dark:text-gray-500">Feature planned — Coming Soon</span>
    </div>
  </div>
);

const TeacherAttendance = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMode, setAttendanceMode] = useState('Manual');
  const [teachers, setTeachers] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const statusRecords = useMemo(() => Object.values(attendanceMap), [attendanceMap]);

  const stats = useMemo(() => {
    const present = statusRecords.filter(r => r.status === 'Present').length;
    const absent = statusRecords.filter(r => r.status === 'Absent').length;
    const leave = statusRecords.filter(r => r.status === 'Leave').length;
    const late = statusRecords.filter(r => r.status === 'Late').length;
    return { present, absent, leave, late, total: teachers.length };
  }, [statusRecords, teachers.length]);

  useEffect(() => {
    const list = demoDataService.getDemoTeachers();
    setTeachers(list);
    setTeacherOptions(list.map(t => ({ label: `${t.fullName} (${t.teacherId})`, value: t._id })));
  }, []);

  const loadAttendance = useCallback(() => {
    if (!academicYear) {
      toast.error('Please select Academic Year');
      return;
    }

    setLoading(true);
    setLoaded(false);

    setTimeout(() => {
      let list = demoDataService.getDemoTeachers();
      if (selectedTeacherId) {
        list = list.filter(t => t._id === selectedTeacherId);
      }

      const saved = attendanceService.loadTeacherAttendance(academicYear, date);
      const map = {};
      list.forEach(t => {
        const existing = saved.find(r => r.teacherDbId === t._id || r.teacherId === t.teacherId);
        map[t._id] = existing
          ? { status: existing.status }
          : { status: 'Present' };
      });
      setAttendanceMap(map);
      setLoaded(true);
      setLoading(false);
    }, 300);
  }, [academicYear, date, selectedTeacherId]);

  const updateField = (teacherId, field, value) => {
    setAttendanceMap(prev => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], [field]: value },
    }));
  };

  const markAll = (status) => {
    setAttendanceMap(prev => {
      const next = {};
      Object.keys(prev).forEach(id => {
        next[id] = { ...prev[id], status };
      });
      return next;
    });
  };

  const handleSave = () => {
    if (!loaded || teachers.length === 0) {
      toast.error('No attendance data to save');
      return;
    }

    const filteredTeachers = selectedTeacherId
      ? teachers.filter(t => t._id === selectedTeacherId)
      : teachers;

    const allMarked = filteredTeachers.every(t => attendanceMap[t._id]?.status);
    if (!allMarked) {
      toast.error('Please mark attendance for all teachers before saving');
      return;
    }

    setSaving(true);
    const records = filteredTeachers.map(t => ({
      teacherDbId: t._id,
      teacherId: t.teacherId,
      fullName: t.fullName,
      status: attendanceMap[t._id]?.status || 'Present',
      markedAt: new Date().toISOString(),
      markedBy: attendanceMode,
    }));

    // Merge with existing saved records for non-loaded teachers
    const existingAll = attendanceService.loadTeacherAttendance(academicYear, date);
    const loadedIds = new Set(filteredTeachers.map(t => t._id));
    const merged = [
      ...records,
      ...existingAll.filter(r => !loadedIds.has(r.teacherDbId)),
    ];

    const result = attendanceService.saveTeacherAttendance(academicYear, date, merged);
    if (result.success) {
      toast.success(`Attendance saved for ${records.length} teacher${records.length !== 1 ? 's' : ''}`);
    } else {
      toast.error('Failed to save attendance');
    }
    setSaving(false);
  };

  const handleReset = () => {
    setLoaded(false);
    setAttendanceMap({});
  };

  const renderStatusBadge = (status) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.Present;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        {status}
      </span>
    );
  };

  const filteredTeachers = useMemo(
    () => selectedTeacherId ? teachers.filter(t => t._id === selectedTeacherId) : teachers,
    [teachers, selectedTeacherId]
  );

  const renderEmptyState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 flex flex-col items-center justify-center text-center">
      <UsersIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">No Teachers Loaded</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        Select Academic Year and click Load Teachers.
      </p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 flex flex-col items-center justify-center text-center">
      <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading teachers...</p>
    </div>
  );

  const isDeviceMode = attendanceMode === 'Fingerprint Device' || attendanceMode === 'Face Recognition Device';

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Attendance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage daily teacher attendance records</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={CheckCircleIcon} label="Present Teachers" value={stats.present} color="green" />
        <StatCard icon={XCircleIcon} label="Absent Teachers" value={stats.absent} color="red" />
        <StatCard icon={ClockIcon} label="Teachers on Leave" value={stats.leave} color="yellow" />
        <StatCard icon={CalendarDaysIcon} label="Late Teachers" value={stats.late} color="blue" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SelectInput
            label="Academic Year"
            name="academicYear"
            value={academicYear}
            onChange={(e) => { setAcademicYear(e.target.value); handleReset(); }}
            options={ACADEMIC_YEARS}
            placeholder="Select year"
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Teacher</label>
            <div className="relative">
              <select
                value={selectedTeacherId}
                onChange={(e) => { setSelectedTeacherId(e.target.value); handleReset(); }}
                className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Teachers</option>
                {teacherOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <DateInput
            label="Date"
            name="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); if (loaded) handleReset(); }}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Attendance Mode
              <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700">Coming Soon</span>
            </label>
            <div className="relative">
              <select
                value={attendanceMode}
                onChange={(e) => {
                  if (e.target.value === 'Fingerprint Device' || e.target.value === 'Face Recognition Device') {
                    return;
                  }
                  setAttendanceMode(e.target.value);
                }}
                className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="Manual">Manual Attendance</option>
                <option value="Fingerprint Device" disabled className="text-gray-400">Fingerprint Device</option>
                <option value="Face Recognition Device" disabled className="text-gray-400">Face Recognition Device</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={loadAttendance}
            disabled={!academicYear || loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <UsersIcon className="h-4 w-4" />
            Load Teachers
          </button>

          {loaded && filteredTeachers.length > 0 && !isDeviceMode && (
            <>
              <button
                onClick={() => markAll('Present')}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                Mark All Present
              </button>
              <button
                onClick={() => markAll('Absent')}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                Mark All Absent
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Device Mode Placeholder */}
      {isDeviceMode && (
        <DevicePlaceholder title={attendanceMode} />
      )}

      {/* Teacher Table */}
      {loading && renderLoadingState()}
      {!loading && !loaded && (isDeviceMode ? null : renderEmptyState())}
      {!loading && loaded && !isDeviceMode && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Photo</th>
                <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Teacher Name</th>
                <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Teacher ID</th>
                <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Department</th>
                <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Attendance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                    No teachers found
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => {
                  const record = attendanceMap[teacher._id] || { status: 'Present' };
                  const initials = teacher.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TC';
                  const imgSrc = getImageUrl(teacher.teacherImage);

                  return (
                    <tr
                      key={teacher._id}
                      className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-3 py-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0 overflow-hidden">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={teacher.fullName}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            initials
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {teacher.fullName}
                      </td>
                      <td className="px-3 py-3 text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                        {teacher.teacherId}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {teacher.qualification || '-'}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          {STATUS_OPTIONS.map(action => (
                            <button
                              key={action}
                              onClick={() => updateField(teacher._id, 'status', action)}
                              className={`px-1.5 py-1 rounded text-[10px] font-semibold border leading-none transition-all cursor-pointer ${
                                record.status === action
                                  ? (STATUS_STYLES[action] || STATUS_STYLES.Present) + ' shadow-sm'
                                  : 'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300'
                              }`}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {filteredTeachers.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between">
              <span>{filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} loaded</span>
              <span>{date}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
