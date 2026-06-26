import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon, XCircleIcon, ClockIcon,
  CalendarDaysIcon, UserGroupIcon, CameraIcon, LockClosedIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../../common/StatCard';
import SelectInput from '../../common/SelectInput';
import DateInput from '../../common/DateInput';
import { CLASS_NAMES, ACADEMIC_YEARS } from '../../../utils/classNames';
import { getImageUrl } from '../../../utils/imageUrl';
import attendanceService from '../../../services/attendance.service';
import demoDataService from '../../../services/demoData.service';

const STATUS_OPTIONS = ['Present', 'Absent', 'Leave', 'Late'];
const ATTENDANCE_MODES = ['Manual', 'QR Code Scanner'];
const isQrDisabled = true;

const STATUS_STYLES = {
  Present: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  Absent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  Leave: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
  Late: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
};

const StudentAttendance = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [className, setClassName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMode, setAttendanceMode] = useState('Manual');
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  const stats = useMemo(() => {
    const records = Object.values(attendanceMap);
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const leave = records.filter(r => r.status === 'Leave').length;
    const late = records.filter(r => r.status === 'Late').length;
    return { present, absent, leave, late, total: students.length };
  }, [attendanceMap, students.length]);

  const loadStudents = useCallback(() => {
    if (!academicYear || !className) {
      toast.error('Please select Academic Year and Class');
      return;
    }

    setLoading(true);
    setLoaded(false);
    setScannerActive(false);
    stopScanner();

    setTimeout(() => {
      const all = demoDataService.getDemoStudents();
      const list = all.filter(s => s.class === className && s.academicYear === academicYear);
      setStudents(list);

      const saved = attendanceService.loadAttendance(academicYear, className, date);
      const map = {};
      list.forEach(s => {
        const existing = saved.find(r => r.studentDbId === s._id || r.studentId === s.studentId);
        map[s._id] = existing
          ? { status: existing.status }
          : { status: 'Present' };
      });
      setAttendanceMap(map);
      setLoaded(true);
      setLoading(false);
    }, 300);
  }, [academicYear, className, date]);

  const updateAttendance = (studentId, field, value) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
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
    if (!loaded || students.length === 0) {
      toast.error('No attendance data to save');
      return;
    }

    const allMarked = students.every(s => attendanceMap[s._id]?.status);
    if (!allMarked) {
      toast.error('Please mark attendance for all students before saving');
      return;
    }

    setSaving(true);
    const records = students.map(s => ({
      studentDbId: s._id,
      studentId: s.studentId,
      fullName: s.fullName,
      status: attendanceMap[s._id]?.status || 'Present',
      markedAt: new Date().toISOString(),
      markedBy: attendanceMode,
    }));

    const result = attendanceService.saveAttendance(academicYear, className, date, records);
    if (result.success) {
      toast.success(`Attendance saved for ${result.count} students`);
    } else {
      toast.error('Failed to save attendance');
    }
    setSaving(false);
  };

  const stopScanner = useCallback(() => {
    if (scannerInstanceRef.current) {
      try {
        scannerInstanceRef.current.stop().catch(() => {});
      } catch {}
      scannerInstanceRef.current = null;
    }
    setScannerActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  useEffect(() => {
    if (attendanceMode === 'QR Code Scanner' && loaded && !scannerActive) {
      const startScanner = async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode');
          const scannerId = 'qr-scanner-element';
          const existingEl = document.getElementById(scannerId);
          if (!existingEl) return;

          const scanner = new Html5Qrcode(scannerId);
          scannerInstanceRef.current = scanner;

          await scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              const matched = students.find(
                s => s.studentId === decodedText || s._id === decodedText || decodedText.includes(s.studentId)
              );
              if (matched) {
                if (attendanceMap[matched._id]?.status === 'Present' && attendanceMap[matched._id]?.markedBy !== 'QR') {
                  toast(`${matched.fullName} already marked`, { icon: 'ℹ️' });
                  return;
                }
                updateAttendance(matched._id, 'status', 'Present');
                setHighlightedId(matched._id);
                toast.success(`${matched.fullName} marked Present`);
                setTimeout(() => setHighlightedId(null), 1500);
              } else {
                toast.error('Student not found in loaded list');
              }
            },
            () => {}
          );

          setScannerActive(true);
        } catch {
          toast.error('Camera access denied or unavailable');
        }
      };
      startScanner();
    } else if (attendanceMode !== 'QR Code Scanner') {
      stopScanner();
    }
  }, [attendanceMode, loaded, students, attendanceMap, stopScanner]);

  const handleReset = () => {
    stopScanner();
    setLoaded(false);
    setStudents([]);
    setAttendanceMap({});
    setHighlightedId(null);
  };

  const renderStatusBadge = (status) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.Present;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        {status}
      </span>
    );
  };

  const renderEmptyState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 flex flex-col items-center justify-center text-center">
      <UserGroupIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">No Students Loaded</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        Select Academic Year, Class, and Date, then click Load Students.
      </p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 flex flex-col items-center justify-center text-center">
      <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading students...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Attendance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage daily student attendance records</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={CheckCircleIcon} label="Present" value={stats.present} color="green" />
        <StatCard icon={XCircleIcon} label="Absent" value={stats.absent} color="red" />
        <StatCard icon={ClockIcon} label="Leave" value={stats.leave} color="yellow" />
        <StatCard icon={CalendarDaysIcon} label="Late" value={stats.late} color="blue" />
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
          <SelectInput
            label="Class"
            name="className"
            value={className}
            onChange={(e) => { setClassName(e.target.value); handleReset(); }}
            options={CLASS_NAMES}
            placeholder="Select class"
          />
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
                  if (e.target.value === 'QR Code Scanner') {
                    return;
                  }
                  setAttendanceMode(e.target.value);
                }}
                className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="Manual">Manual Attendance</option>
                <option value="QR Code Scanner" disabled className="text-gray-400">QR Code Scanner</option>
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
            onClick={loadStudents}
            disabled={!academicYear || !className || loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            <UserGroupIcon className="h-4 w-4" />
            Load Students
          </button>

          {loaded && students.length > 0 && (
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

      {/* QR Scanner Placeholder */}
      {attendanceMode === 'QR Code Scanner' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 mb-4">
            <LockClosedIcon className="h-10 w-10 text-blue-400 dark:text-blue-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">QR Scanner — Hardware Required</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            QR Scanner integration is prepared. Connect the scanner hardware to enable this feature.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-xs text-gray-400 dark:text-gray-500">Feature planned — Coming Soon</span>
          </div>
        </div>
      )}

      {/* Student Table */}
      {loading && renderLoadingState()}
      {!loading && !loaded && renderEmptyState()}
      {!loading && loaded && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Photo</th>
                <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Student Name</th>
                <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Student ID</th>
                <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Class</th>
                <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Academic Year</th>
                <th className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Attendance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                    No students found for the selected criteria
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const record = attendanceMap[student._id] || { status: 'Present' };
                  const isHighlighted = highlightedId === student._id;

                  return (
                    <tr
                      key={student._id}
                      className={`bg-white dark:bg-gray-800/50 transition-all duration-500 ${
                        isHighlighted
                          ? 'bg-green-50 dark:bg-green-900/20 scale-[1.002]'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <td className="px-3 py-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-1 ring-yellow-400/50 flex-shrink-0 overflow-hidden">
                          {getImageUrl(student.studentImage) ? (
                            <img
                              src={getImageUrl(student.studentImage)}
                              alt={student.fullName}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            student.fullName?.charAt(0) || 'S'
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {student.fullName}
                      </td>
                      <td className="px-3 py-3 text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                        {student.studentId}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {student.class}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {student.academicYear}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          {STATUS_OPTIONS.map(action => (
                            <button
                              key={action}
                              onClick={() => updateAttendance(student._id, 'status', action)}
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

          {students.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between">
              <span>{students.length} student{students.length !== 1 ? 's' : ''} loaded</span>
              <span>{date}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentAttendance;
