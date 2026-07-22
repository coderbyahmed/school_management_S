import studentFeesService from './studentFees.service';

const SETTINGS_KEY = 'fee_reports_settings';

const SESSIONS = ['2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034', '2035'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CLASSES = ['All', 'Montessori', 'Nursery', 'KG-1', 'KG-2', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const STATUS_OPTIONS = ['All', 'Paid', 'Partial', 'Due'];

const defaultSettings = {
  schoolFee: {
    currency: 'PKR',
    academicYear: '2025',
    admissionFeeEnabled: true,
    examFeeEnabled: true,
    labFeeEnabled: false,
    libraryFeeEnabled: false,
    transportFeeEnabled: false,
    autoAssignFee: true,
  },
  receipt: {
    prefix: 'RCP',
    showSchoolLogo: true,
    showStudentPhoto: true,
    showClassInfo: true,
    showFeeBreakdown: true,
    showPaymentMethod: true,
    showRemarks: true,
    showSignature: true,
    autoGenerate: true,
  },
  fine: {
    lateFeeEnabled: true,
    lateFeeAmount: 100,
    lateFeeDays: 7,
    maxFine: 500,
    autoApplyFine: true,
    fineOnHoliday: false,
  },
  reminder: {
    enabled: true,
    reminderDaysBefore: 3,
    reminderDaysAfter: 5,
    maxReminders: 3,
    reminderMethod: 'SMS',
    includeAmount: true,
    includeDueDate: true,
    autoReminder: true,
  },
};

const reportsSettingsService = {
  getReportData(filters = {}) {
    const students = studentFeesService.getAll();
    let entries = [];

    students.forEach((student) => {
      (student.paymentHistory || []).forEach((ph) => {
        const feeAmount = student.monthlyFee;
        entries.push({
          id: ph.id,
          studentId: student.id,
          studentName: student.name,
          admissionNo: student.admissionNo,
          class: student.class,
          month: ph.month,
          feeAmount,
          discount: ph.discount || 0,
          paidAmount: ph.paidAmount || 0,
          dueAmount: Math.max(0, feeAmount - (ph.discount || 0) - (ph.paidAmount || 0)),
          lateFine: ph.lateFine || 0,
          status: ph.status || 'Due',
          date: ph.date || '-',
          receiptNo: ph.receiptNo || '-',
          paymentMethod: ph.paymentMethod || '-',
          academicYear: student.academicYear || '2025',
        });
      });
    });

    if (filters.year && filters.year !== 'All') {
      entries = entries.filter((e) => e.academicYear === filters.year);
    }
    if (filters.month && filters.month !== 'All') {
      entries = entries.filter((e) => e.month === filters.month);
    }
    if (filters.class && filters.class !== 'All') {
      entries = entries.filter((e) => e.class === filters.class);
    }
    if (filters.status && filters.status !== 'All') {
      entries = entries.filter((e) => e.status === filters.status);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      entries = entries.filter((e) =>
        e.studentName.toLowerCase().includes(q) ||
        e.admissionNo.toLowerCase().includes(q) ||
        e.receiptNo.toLowerCase().includes(q)
      );
    }

    entries.sort((a, b) => b.date.localeCompare(a.date));
    return entries;
  },

  getStats(filters = {}) {
    const entries = this.getReportData(filters);
    const totalReports = entries.length;
    const feeCollected = entries.reduce((s, e) => s + e.paidAmount, 0);
    const totalFee = entries.reduce((s, e) => s + e.feeAmount, 0);
    const pendingDues = entries.reduce((s, e) => s + e.dueAmount, 0);
    const paidCount = entries.filter((e) => e.status === 'Paid').length;
    const collectionRate = totalReports > 0 ? Math.round((paidCount / totalReports) * 100) : 0;
    return { totalReports, feeCollected, pendingDues, collectionRate };
  },

  getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        return {
          schoolFee: { ...defaultSettings.schoolFee, ...(saved.schoolFee || {}) },
          receipt: { ...defaultSettings.receipt, ...(saved.receipt || {}) },
          fine: { ...defaultSettings.fine, ...(saved.fine || {}) },
          reminder: { ...defaultSettings.reminder, ...(saved.reminder || {}) },
        };
      }
    } catch {}
    return { ...defaultSettings };
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch {
      return false;
    }
  },

  resetSettings() {
    try {
      localStorage.removeItem(SETTINGS_KEY);
    } catch {}
    return JSON.parse(JSON.stringify(defaultSettings));
  },

  sessions: SESSIONS,
  months: MONTHS,
  classes: CLASSES,
  statusOptions: STATUS_OPTIONS,
  defaultSettings,
};

export default reportsSettingsService;
