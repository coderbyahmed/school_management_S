import { useState, useCallback, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { CalendarDaysIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { CLASS_NAMES, ACADEMIC_YEARS } from '../../../../utils/classNames';
import TimetableFilters from './TimetableFilters';
import TimetableGrid from './TimetableGrid';
import TimetableEmptyState from './TimetableEmptyState';
import TimetableEditorModal from './TimetableEditorModal';
import ConfirmationModal from '../../../common/ConfirmationModal';
import classService from '../../../../services/class.service';
import timetableService from '../../../../services/timetable.service';

const classFilters = [
  { name: 'academicYear', label: 'Academic Year', options: ACADEMIC_YEARS, placeholder: 'Select year' },
  { name: 'className', label: 'Class', options: CLASS_NAMES, placeholder: 'Select class' },
];

const ClassView = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [className, setClassName] = useState('');
  const [viewClicked, setViewClicked] = useState(false);
  const [timetableData, setTimetableData] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjectNames, setSubjectNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const classMap = useMemo(() => {
    const map = {};
    classes.forEach((c) => { map[c.className] = c._id; });
    return map;
  }, [classes]);

  useEffect(() => {
    classService.getAllClasses()
      .then((res) => {
        if (res?.data?.classes) setClasses(res.data.classes);
      })
      .catch(() => console.error('Failed to load classes'));
  }, []);

  const filterValues = { academicYear, className };

  const handleFilterChange = useCallback((name, value) => {
    if (name === 'academicYear') setAcademicYear(value);
    if (name === 'className') setClassName(value);
    setViewClicked(false);
  }, []);

  const loadSubjectNames = useCallback(async () => {
    try {
      const res = await timetableService.getClassSubjects(classMap[className]);
      if (res?.data?.subjects) {
        const map = {};
        res.data.subjects.forEach((s) => { map[s.id] = s.name; });
        setSubjectNames(map);
      }
    } catch { console.error('Failed to load subject names'); }
  }, [className, classMap]);

  const handleView = useCallback(async () => {
    if (!academicYear || !className) return;
    const classId = classMap[className];
    if (!classId) { toast.error('Class not found'); return; }
    setViewClicked(true);
    setLoading(true);
    setTimetableData(null);
    try {
      const res = await timetableService.getTimetableByClass(classId);
      const timetables = res?.data?.timetables || [];
      const match = timetables.find((t) => t.academicYear === academicYear);
      if (match) {
        setTimetableData(match);
        await loadSubjectNames();
      } else {
        setTimetableData(null);
      }
    } catch {
      toast.error('Failed to load timetable');
      setTimetableData(null);
    } finally {
      setLoading(false);
    }
  }, [academicYear, className, classMap, loadSubjectNames]);

  const handleEditSave = useCallback(async (updatedPeriods) => {
    if (!timetableData?._id) return;
    try {
      toast.dismiss();
      const payload = {
        periods: updatedPeriods.map((p) => ({
          periodNo: p.periodNum,
          type: p.type === 'Break' ? 'break' : 'teaching',
          startTime: p.startTime,
          endTime: p.endTime,
          teacherId: p.type === 'Teaching' ? p.teacher : null,
          subjectId: p.type === 'Teaching' ? p.subject : null,
        })),
      };
      const res = await timetableService.updateTimetable(timetableData._id, payload);
      const updated = res?.data?.timetable;
      const serverWarnings = res?.warnings || [];
      if (updated) {
        setTimetableData(updated);
        await loadSubjectNames();
      }
      setShowEditor(false);
      toast.success('Timetable updated successfully');
      if (serverWarnings.length > 0) {
        toast(
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠️ Timetable Warnings</div>
            {serverWarnings.map((w, i) => (
              <div key={i} style={{ marginLeft: 8 }}>• {w}</div>
            ))}
          </div>
        );
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.message;
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && Array.isArray(serverErrors) && serverErrors.length > 0) {
        serverErrors.forEach((e) => toast.error(e.message || e));
      } else if (serverMsg) {
        toast.error(serverMsg);
      } else {
        toast.error('Failed to update timetable');
      }
    }
  }, [timetableData, loadSubjectNames]);

  const handleDelete = useCallback(async () => {
    if (!timetableData?._id) return;
    setDeleting(true);
    try {
      await timetableService.deleteTimetable(timetableData._id);
      setTimetableData(null);
      setShowDelete(false);
      toast.success('Timetable deleted successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete timetable');
    } finally {
      setDeleting(false);
    }
  }, [timetableData]);

  const resolveSubjectName = (subjectId) => {
    if (!subjectId) return '-';
    if (typeof subjectId === 'object' && subjectId.subjectName) return subjectId.subjectName;
    return subjectNames[subjectId] || subjectId || '-';
  };
  const resolveTeacherName = (teacherId) => (teacherId?.fullName) || (typeof teacherId === 'string' ? teacherId : '-');

  const canView = academicYear && className;
  const hasTimetable = timetableData && timetableData.periods?.length > 0;

  const displayPeriods = timetableData?.periods?.map((p) => ({
    ...p,
    subject: resolveSubjectName(p.subjectId),
    teacher: resolveTeacherName(p.teacherId),
    type: p.type === 'teaching' ? 'Teaching' : 'Break',
  })) || [];

  return (
    <div className="space-y-6">
      <TimetableFilters
        filters={classFilters.map((f) => ({ ...f, value: filterValues[f.name] }))}
        onFilterChange={handleFilterChange}
        onView={handleView}
        viewDisabled={!canView || loading}
        viewLabel={loading ? 'Loading...' : 'View Timetable'}
      />

      {viewClicked && !loading && !hasTimetable && (
        <TimetableEmptyState
          icon={CalendarDaysIcon}
          title="No Timetable Found"
          description={`No timetable found for ${className} (${academicYear}). Create one first.`}
        />
      )}

      {loading && (
        <TimetableEmptyState
          icon={CalendarDaysIcon}
          title="Loading..."
          description="Fetching timetable data."
        />
      )}

      {hasTimetable && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-white bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                <BookOpenIcon className="h-4 w-4 text-blue-500" />
                {className}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">{academicYear}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{timetableData.periods?.length || 0} periods</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditor(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                Edit Timetable
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                Delete Timetable
              </button>
            </div>
          </div>

          <TimetableGrid periods={displayPeriods} mode="class" />
        </>
      )}

      {showEditor && timetableData && (
        <TimetableEditorModal
          timetableData={{ ...timetableData, className, academicYear }}
          onSave={handleEditSave}
          onClose={() => setShowEditor(false)}
        />
      )}

      <ConfirmationModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Timetable"
        message="Are you sure you want to delete this timetable?"
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
};

export default ClassView;
