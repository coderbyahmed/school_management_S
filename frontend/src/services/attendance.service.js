const STORAGE_PREFIX = 'attendance';

const attendanceService = {
  loadAttendance: (year, className, date) => {
    const key = `${STORAGE_PREFIX}_${year}_${className}_${date}`;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  saveAttendance: (year, className, date, records) => {
    const key = `${STORAGE_PREFIX}_${year}_${className}_${date}`;
    try {
      localStorage.setItem(key, JSON.stringify(records));
      return { success: true, count: records.length };
    } catch {
      return { success: false, count: 0 };
    }
  },

  getStats: (records) => {
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const leave = records.filter(r => r.status === 'Leave').length;
    const late = records.filter(r => r.status === 'Late').length;
    return { present, absent, leave, late, total: records.length };
  },

  loadTeacherAttendance: (year, date) => {
    const key = `${STORAGE_PREFIX}_teachers_${year}_${date}`;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  saveTeacherAttendance: (year, date, records) => {
    const key = `${STORAGE_PREFIX}_teachers_${year}_${date}`;
    try {
      localStorage.setItem(key, JSON.stringify(records));
      return { success: true, count: records.length };
    } catch {
      return { success: false, count: 0 };
    }
  },
};

export default attendanceService;
