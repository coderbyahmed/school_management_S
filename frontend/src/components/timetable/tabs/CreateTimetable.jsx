import { useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import CardSection from '../../common/CardSection';
import SelectInput from '../../common/SelectInput';
import ConfirmationModal from '../../common/ConfirmationModal';
import { ACADEMIC_YEARS } from '../../../utils/classNames';
import classService from '../../../services/class.service';
import teacherService from '../../../services/teacher.service';
import timetableService from '../../../services/timetable.service';
import { useTimetableYear } from '../../../contexts/TimetableContext';

const GROUPS = {
  1: { name: 'Group 1', classes: ['Montessori', 'Nursery', 'KG 1', 'KG 2'] },
  2: { name: 'Group 2', classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'] },
  3: { name: 'Group 3', classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'] },
};

const PERIOD_DEFAULTS = [
  { start: '07:30', end: '08:10' },
  { start: '08:10', end: '08:50' },
  { start: '08:50', end: '09:30' },
  { start: '09:30', end: '10:10' },
  { start: '10:30', end: '11:10' },
  { start: '11:10', end: '11:50' },
  { start: '11:50', end: '12:30' },
  { start: '12:30', end: '13:10' },
];

const timeToMinutes = (t) => {
  if (!t) return -1;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const buildPeriodCells = (classNames) => {
  const cells = {};
  classNames.forEach((name) => { cells[name] = { teacher: '', subject: '' }; });
  return cells;
};

const CreateTimetable = () => {
  const { selectedYear, setSelectedYear } = useTimetableYear();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classIdMap, setClassIdMap] = useState({});
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classSubjectsMap, setClassSubjectsMap] = useState({});
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingExisting, setLoadingExisting] = useState(true);

  const groupClasses = useMemo(() => {
    if (!selectedGroup) return [];
    return GROUPS[selectedGroup]?.classes || [];
  }, [selectedGroup]);

  useEffect(() => {
    classService.getAllClasses()
      .then((res) => {
        const list = res?.data?.classes || [];
        const map = {};
        list.forEach((c) => { if (c.className) map[c.className] = c._id; });
        setClassIdMap(map);
      })
      .catch(() => toast.error('Failed to load classes'))
      .finally(() => setLoadingClasses(false));
  }, []);

  useEffect(() => {
    teacherService.getAllTeachers({ limit: 100, status: 'Active' })
      .then((res) => {
        const list = res?.data?.teachers || res?.data?.data?.teachers || [];
        setTeachers(Array.isArray(list) ? list : []);
      })
      .catch(() => toast.error('Failed to load teachers'))
      .finally(() => setLoadingTeachers(false));
  }, []);

  useEffect(() => {
    if (!selectedGroup || Object.keys(classIdMap).length === 0) {
      return;
    }
    const load = async () => {
      const map = {};
      for (const name of groupClasses) {
        const cid = classIdMap[name];
        if (!cid) { map[name] = []; continue; }
        try {
          const res = await timetableService.getClassSubjects(cid);
          map[name] = res?.data?.subjects || [];
        } catch { map[name] = []; }
      }
      setClassSubjectsMap(map);
      setLoadingSubjects(false);
    };
    load();
  }, [selectedGroup, classIdMap, groupClasses]);

  useEffect(() => {
    if (!selectedGroup || !selectedYear || Object.keys(classIdMap).length === 0) {
      return;
    }
    const load = async () => {
      const classTts = {};
      for (const name of groupClasses) {
        const cid = classIdMap[name];
        if (!cid) continue;
        try {
          const res = await timetableService.getTimetableByClass(cid);
          const tts = res?.data?.timetables || [];
          const match = tts.find((t) => t.academicYear === selectedYear);
          if (match) classTts[name] = match;
        } catch { /* empty */ }
      }
      if (Object.keys(classTts).length === 0) {
        setPeriods([]);
        setLoadingExisting(false);
        return;
      }
      const slotMap = {};
      Object.values(classTts).forEach((tt) => {
        (tt.periods || []).forEach((p) => {
          const key = `${p.startTime}-${p.endTime}`;
          if (!slotMap[key]) slotMap[key] = { startTime: p.startTime, endTime: p.endTime, type: p.type || 'teaching', idx: Object.keys(slotMap).length };
        });
      });
      const sortedSlots = Object.values(slotMap).sort((a, b) => a.startTime.localeCompare(b.startTime));
      const merged = sortedSlots.map((slot, idx) => {
        const cells = {};
        groupClasses.forEach((name) => {
          const tt = classTts[name];
          if (!tt) { cells[name] = { teacher: '', subject: '' }; return; }
          const match = (tt.periods || []).find((p) => p.startTime === slot.startTime && p.endTime === slot.endTime);
          cells[name] = {
            teacher: match?.teacherId?._id || match?.teacherId || '',
            subject: match?.subjectId?._id || match?.subjectId || '',
          };
        });
        return {
          id: Date.now() + Math.random() + idx,
          periodNo: idx + 1,
          type: slot.type || 'teaching',
          startTime: slot.startTime,
          endTime: slot.endTime,
          cells,
          completed: true,
        };
      });
      setPeriods(merged);
      setLoadingExisting(false);
    };
    load();
  }, [selectedGroup, selectedYear, classIdMap, groupClasses]);

  const getAvailableSubjects = useCallback((className, teacherId) => {
    if (!teacherId || !teachers.length || !classSubjectsMap[className]) return [];
    const teacher = teachers.find((t) => t._id === teacherId);
    if (!teacher?.assignedSubjects) return [];
    const tSet = new Set(teacher.assignedSubjects.map((id) => id.toString()));
    return classSubjectsMap[className].filter((s) => tSet.has(s.id));
  }, [teachers, classSubjectsMap]);

  const addPeriod = useCallback(() => {
    const nextNo = periods.length + 1;
    const defaults = PERIOD_DEFAULTS[nextNo - 1] || { start: '08:00', end: '08:40' };
    const cells = buildPeriodCells(groupClasses);
    setPeriods((prev) => [...prev, {
      id: Date.now() + Math.random(),
      periodNo: nextNo,
      type: 'teaching',
      startTime: defaults.start,
      endTime: defaults.end,
      cells,
      completed: false,
    }]);
  }, [periods.length, groupClasses]);

  const removePeriod = useCallback((id) => {
    const p = periods.find((p) => p.id === id);
    if (p?.completed) return;
    setDeleteTarget(id);
  }, [periods]);

  const confirmRemovePeriod = useCallback(() => {
    if (deleteTarget === null) return;
    setPeriods((prev) => prev.filter((p) => p.id !== deleteTarget));
    setDeleteTarget(null);
  }, [deleteTarget]);

  const updateCell = useCallback((periodId, className, field, value) => {
    setPeriods((prev) => prev.map((p) => {
      if (p.id !== periodId || p.completed) return p;
      const updatedCells = { ...p.cells };
      if (field === 'teacher') {
        updatedCells[className] = { teacher: value, subject: '' };
      } else {
        updatedCells[className] = { ...p.cells[className], [field]: value };
      }
      return { ...p, cells: updatedCells };
    }));
  }, []);

  const updatePeriodTime = useCallback((periodId, field, value) => {
    setPeriods((prev) => prev.map((p) => p.id === periodId && !p.completed ? { ...p, [field]: value } : p));
  }, []);

  const updatePeriodType = useCallback((periodId, value) => {
    setPeriods((prev) => prev.map((p) => {
      if (p.id !== periodId || p.completed) return p;
      const cells = { ...p.cells };
      if (value === 'break') {
        Object.keys(cells).forEach((name) => { cells[name] = { teacher: '', subject: '' }; });
      }
      return { ...p, type: value, cells };
    }));
  }, []);

  const fieldErrors = useMemo(() => {
    const errs = {};
    if (periods.length === 0) return errs;
    const timeSlots = [];
    periods.forEach((p) => {
      if (p.completed) return;
      const row = {};
      const startM = timeToMinutes(p.startTime);
      const endM = timeToMinutes(p.endTime);
      const hasStart = p.startTime !== '';
      const hasEnd = p.endTime !== '';
      if (!hasStart) row.startTime = 'Start time required';
      if (!hasEnd) row.endTime = 'End time required';
      if (hasStart && hasEnd && endM <= startM) {
        row.timeOverlap = 'End must be later than start';
      }
      if (hasStart && hasEnd && endM > startM) {
        for (const slot of timeSlots) {
          if (startM < slot.endM && endM > slot.startM) {
            row.timeOverlap = 'Time overlap detected';
            if (!errs[slot.id]) errs[slot.id] = {};
            errs[slot.id].timeOverlap = 'Time overlap detected';
            break;
          }
        }
        timeSlots.push({ id: p.id, startM, endM });
      }
      const isBreak = p.type === 'break';
      if (!isBreak) {
        const hasTeaching = groupClasses.some((name) => {
          const cell = p.cells[name];
          return cell?.teacher || cell?.subject;
        });
        if (hasTeaching) {
          groupClasses.forEach((name) => {
            const cell = p.cells[name];
            if (!cell?.teacher) {
              if (!row.cellErrors) row.cellErrors = {};
              row.cellErrors[name] = { ...(row.cellErrors[name] || {}), teacher: 'Teacher required' };
            }
            if (!cell?.subject) {
              if (!row.cellErrors) row.cellErrors = {};
              row.cellErrors[name] = { ...(row.cellErrors[name] || {}), subject: 'Subject required' };
            }
          });
        }
      }
      if (Object.keys(row).length > 0) errs[p.id] = row;
    });
    return errs;
  }, [periods, groupClasses]);

  const canSave = useMemo(() => {
    if (!selectedYear || !selectedGroup) return false;
    const newPeriods = periods.filter((p) => !p.completed);
    if (newPeriods.length === 0) return false;
    if (Object.values(fieldErrors).some((r) => r.timeOverlap)) return false;
    const hasNewWithErrors = newPeriods.some((p) => {
      const err = fieldErrors[p.id];
      return err && Object.keys(err).length > 0;
    });
    if (hasNewWithErrors) return false;
    const allFilled = newPeriods.every((p) => {
      if (!p.startTime || !p.endTime) return false;
      if (p.type === 'break') return true;
      return groupClasses.every((name) => {
        const cell = p.cells[name];
        return cell?.teacher && cell?.subject;
      });
    });
    return allFilled;
  }, [selectedYear, selectedGroup, periods, fieldErrors, groupClasses]);

  const handleSave = useCallback(async () => {
    if (!selectedYear || !selectedGroup) return;
    if (periods.length === 0) { toast.error('Add at least one period'); return; }
    const timeErr = Object.values(fieldErrors).find((r) => r.timeOverlap);
    if (timeErr) { toast.error('Fix time errors before saving'); return; }
    setSaving(true);
    let successCount = 0;
    let failCount = 0;
    let allWarnings = [];
    for (const className of groupClasses) {
      const classId = classIdMap[className];
      if (!classId) { failCount++; continue; }
      const classPeriods = periods.map((p, i) => ({
        periodNo: i + 1,
        type: p.type === 'break' ? 'break' : 'teaching',
        startTime: p.startTime,
        endTime: p.endTime,
        teacherId: p.type === 'teaching' ? (p.cells[className]?.teacher || null) : null,
        subjectId: p.type === 'teaching' ? (p.cells[className]?.subject || null) : null,
      }));
      const payload = { academicYear: selectedYear, classId, periods: classPeriods };
      try {
        let existingId = null;
        try {
          const res = await timetableService.getTimetableByClass(classId);
          const tts = res?.data?.timetables || [];
          const match = tts.find((t) => t.academicYear === selectedYear);
          if (match) existingId = match._id;
        } catch { /* empty */ }
        if (existingId) {
          const res = await timetableService.updateTimetable(existingId, payload);
          if (res?.warnings) allWarnings = allWarnings.concat(res.warnings);
        } else {
          const res = await timetableService.createTimetable(payload);
          if (res?.warnings) allWarnings = allWarnings.concat(res.warnings);
        }
        successCount++;
      } catch (err) {
        failCount++;
        const msg = err?.response?.data?.message || 'Failed';
        toast.error(`${className}: ${msg}`);
      }
    }
    if (successCount > 0) {
      toast.success(`Saved ${successCount} timetable(s) for ${GROUPS[selectedGroup]?.name}`);
      if (allWarnings.length > 0) {
        allWarnings.forEach((w) => toast.error(w.message || w));
      }
    }
    if (failCount > 0) toast.error(`${failCount} class(es) failed`);
    setSaving(false);
    if (successCount > 0) {
      const classTts = {};
      for (const name of groupClasses) {
        const cid = classIdMap[name];
        if (!cid) continue;
        try {
          const res = await timetableService.getTimetableByClass(cid);
          const tts = res?.data?.timetables || [];
          const match = tts.find((t) => t.academicYear === selectedYear);
          if (match) classTts[name] = match;
        } catch { /* empty */ }
      }
      if (Object.keys(classTts).length > 0) {
        const slotMap = {};
        Object.values(classTts).forEach((tt) => {
          (tt.periods || []).forEach((p) => {
            const key = `${p.startTime}-${p.endTime}`;
            if (!slotMap[key]) slotMap[key] = { startTime: p.startTime, endTime: p.endTime, type: p.type || 'teaching', idx: Object.keys(slotMap).length };
          });
        });
        const sortedSlots = Object.values(slotMap).sort((a, b) => a.startTime.localeCompare(b.startTime));
        const merged = sortedSlots.map((slot, idx) => {
          const cells = {};
          groupClasses.forEach((name) => {
            const tt = classTts[name];
            if (!tt) { cells[name] = { teacher: '', subject: '' }; return; }
            const match = (tt.periods || []).find((p) => p.startTime === slot.startTime && p.endTime === slot.endTime);
            cells[name] = {
              teacher: match?.teacherId?._id || match?.teacherId || '',
              subject: match?.subjectId?._id || match?.subjectId || '',
            };
          });
          return {
            id: Date.now() + Math.random() + idx,
            periodNo: idx + 1,
            type: slot.type || 'teaching',
            startTime: slot.startTime,
            endTime: slot.endTime,
            cells,
            completed: true,
          };
        });
        setPeriods(merged);
      }
    }
  }, [selectedYear, selectedGroup, groupClasses, periods, fieldErrors, classIdMap]);

  const handleGroupChange = useCallback((g) => {
    setSelectedGroup(g);
    setPeriods([]);
  }, []);

  const handleYearChange = useCallback((value) => {
    setSelectedYear(value);
    setPeriods([]);
  }, [setSelectedYear]);

  const hasOverlap = useMemo(() => Object.values(fieldErrors).some((r) => r.timeOverlap), [fieldErrors]);

  const selectCls = 'appearance-none w-full px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer';
  const inputCls = 'w-full px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all [color-scheme:light] dark:[color-scheme:dark]';
  const labelCls = 'block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5';

  return (
    <div className="space-y-6">
      <CardSection title="Timetable Settings">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="w-full sm:w-48">
            <SelectInput
              label="Academic Year"
              name="academicYear"
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              options={ACADEMIC_YEARS}
              placeholder="Select year"
            />
          </div>
          <div className="flex items-center gap-2">
            {[
              { g: 1, activeCls: 'bg-blue-600 text-white shadow-md shadow-blue-300/30 dark:shadow-blue-900/40 scale-105', inactiveCls: 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400' },
              { g: 2, activeCls: 'bg-emerald-600 text-white shadow-md shadow-emerald-300/30 dark:shadow-emerald-900/40 scale-105', inactiveCls: 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400' },
              { g: 3, activeCls: 'bg-violet-600 text-white shadow-md shadow-violet-300/30 dark:shadow-violet-900/40 scale-105', inactiveCls: 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400' },
            ].map(({ g, activeCls, inactiveCls }) => (
              <button key={g} onClick={() => handleGroupChange(g)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${selectedGroup === g ? activeCls : inactiveCls}`}>
                {GROUPS[g].name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={addPeriod}
              disabled={!selectedYear || !selectedGroup || loadingClasses || loadingSubjects}
              className="px-5 py-2 rounded-lg text-[13px] font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add Period
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
        {loadingExisting && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3">Loading existing timetables...</p>
        )}
        {!loadingExisting && selectedGroup && selectedYear && periods.length > 0 && (
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-3">{periods.filter((p) => p.completed).length} completed, {periods.filter((p) => !p.completed).length} pending &middot; {GROUPS[selectedGroup]?.name}</p>
        )}
        {!loadingExisting && selectedGroup && selectedYear && periods.length === 0 && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3">No periods yet. Click "Add Period" to start building.</p>
        )}
      </CardSection>

      {periods.length > 0 && (
        <div className="space-y-3">
          {hasOverlap && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/50">
              <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <span className="font-medium">Time overlap detected</span> &mdash; Fix overlapping periods to enable Save.
              </p>
            </div>
          )}
          {periods.map((period, pi) => {
            const err = fieldErrors[period.id];
            const locked = period.completed;

            const disabledInputCls = 'w-full px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-xs text-gray-400 dark:text-gray-500 cursor-default transition-all [color-scheme:light] dark:[color-scheme:dark]';

            const pInputCls = locked ? disabledInputCls : inputCls;

            return (
              <div key={period.id} className={`relative ${locked ? 'cursor-not-allowed' : ''}`} title={locked ? 'This period has already been assigned and cannot be edited or deleted.' : ''}>
                <div className={`bg-white dark:bg-gray-800 rounded-xl border ${err?.timeOverlap ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'} shadow-sm overflow-hidden ${locked ? 'opacity-70' : ''}`}>
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Period {period.periodNo || pi + 1}</span>

                      {!locked && (
                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                          <button onClick={() => updatePeriodType(period.id, 'teaching')} className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${period.type === 'teaching' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Teaching</button>
                          <button onClick={() => updatePeriodType(period.id, 'break')} className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${period.type === 'break' ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Break</button>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <div>
                          <label className={labelCls}>Start</label>
                          <input type="time" value={period.startTime} onChange={(e) => updatePeriodTime(period.id, 'startTime', e.target.value)} disabled={locked} className={`${pInputCls} w-28`} />
                        </div>
                        <span className="text-gray-400 mt-4">&ndash;</span>
                        <div>
                          <label className={labelCls}>End</label>
                          <input type="time" value={period.endTime} onChange={(e) => updatePeriodTime(period.id, 'endTime', e.target.value)} disabled={locked} className={`${pInputCls} w-28`} />
                        </div>
                      </div>
                    </div>

                    {locked ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/50">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Completed
                      </span>
                    ) : (
                      <button onClick={() => removePeriod(period.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer" title="Remove period">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    {period.type === 'break' ? (
                      <div className="px-4 py-6 flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-sm font-medium">Break Period</span>
                      </div>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700">
                            <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">Class</th>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teacher</th>
                            <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                          {groupClasses.map((name) => {
                            const cell = period.cells[name] || { teacher: '', subject: '' };
                            const availSubjects = getAvailableSubjects(name, cell.teacher);
                            const noSubjectFile = !locked && cell.teacher && availSubjects.length === 0;
                            const cellErr = err?.cellErrors?.[name];

                            const displayTeacher = locked ? (teachers.find((t) => t._id === cell.teacher)?.fullName || cell.teacher || '-') : '';
                            const displaySubject = locked ? (classSubjectsMap[name]?.find((s) => s.id === cell.subject)?.name || cell.subject || '-') : '';

                            return (
                              <tr key={name} className={`transition-colors ${locked ? 'bg-gray-50/50 dark:bg-gray-800/30' : noSubjectFile ? 'bg-amber-50/40 dark:bg-amber-900/5' : ''}`}>
                                <td className="px-3 py-2 align-middle"><span className={`text-[11px] font-medium ${locked ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>{name}</span></td>
                                <td className="px-3 py-2 align-middle">
                                  {locked ? (
                                    <div className="w-full px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 cursor-default">{displayTeacher}</div>
                                  ) : (
                                    <>
                                      <select value={cell.teacher} onChange={(e) => updateCell(period.id, name, 'teacher', e.target.value)} className={`${selectCls} max-w-[200px]`}>
                                        <option value="" disabled>{loadingTeachers ? 'Loading...' : 'Select teacher'}</option>
                                        {teachers.map((t) => (
                                          <option key={t._id} value={t._id}>{t.fullName}</option>
                                        ))}
                                      </select>
                                      {cellErr?.teacher && <p className="text-[9px] text-red-500 mt-0.5">{cellErr.teacher}</p>}
                                    </>
                                  )}
                                </td>
                                <td className="px-3 py-2 align-middle">
                                  {locked ? (
                                    <div className="w-full px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 cursor-default">{displaySubject}</div>
                                  ) : (
                                    <>
                                      <select value={cell.subject} onChange={(e) => updateCell(period.id, name, 'subject', e.target.value)} disabled={!cell.teacher || availSubjects.length === 0} className={`${selectCls} max-w-[200px]`}>
                                        <option value="" disabled>
                                          {!cell.teacher ? 'Select teacher first' : loadingSubjects ? 'Loading...' : availSubjects.length === 0 ? 'No subjects' : 'Select subject'}
                                        </option>
                                        {availSubjects.map((s) => (
                                          <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                      </select>
                                      {noSubjectFile && <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5">No valid subjects for this teacher</p>}
                                      {cellErr?.subject && !noSubjectFile && <p className="text-[9px] text-red-500 mt-0.5">{cellErr.subject}</p>}
                                    </>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {periods.length === 0 && (
        <CardSection title="Timetable Builder">
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <svg className="h-14 w-14 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">No periods yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              {!selectedYear || !selectedGroup
                ? 'Select Academic Year and Group to begin.'
                : loadingClasses || loadingSubjects
                  ? 'Loading data...'
                  : 'Click "Add Period" to start building the group timetable.'}
            </p>
          </div>
        </CardSection>
      )}

      <ConfirmationModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Remove Period"
        message="Remove this period and its data?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmRemovePeriod}
      />
    </div>
  );
};

export default CreateTimetable;
