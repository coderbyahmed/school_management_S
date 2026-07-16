import { ACADEMIC_YEARS, CLASS_NAMES, DEPARTMENTS } from '../utils/classNames';

const STORAGE_KEY = 'attendance_history_records';
const STATUSES = ['Present', 'Absent', 'Leave', 'Late'];
const MODES = ['Manual', 'QR Code', 'Hardware (Coming Soon)'];

const STUDENT_NAMES = [
  'Ahmed Khan', 'Sara Ali', 'Muhammad Usman', 'Fatima Zahra', 'Ali Raza',
  'Ayesha Bibi', 'Hassan Javed', 'Zainab Malik', 'Omar Farooq', 'Hira Batool',
  'Hamza Sheikh', 'Mahnoor Ahmed', 'Bilal Hussain', 'Laiba Noor', 'Tahir Iqbal',
  'Sana Mirza', 'Rayan Akhtar', 'Iqra Aziz', 'Zayan Siddiqui', 'Eman Tariq',
  'Aryan Bhatti', 'Rida Fatima', 'Shahmir Ali', 'Dua Hasan', 'Rohail Shah',
  'Minahil Zafar', 'Saim Riaz', 'Aleena Khan', 'Huzaifa Khalid', 'Amna Rizvi',
];

const TEACHER_NAMES = [
  'Prof. Ahmed Raza', 'Ms. Fatima Hassan', 'Mr. Imran Ali', 'Dr. Saba Khan',
  'Mr. Usman Malik', 'Ms. Ayesha Sheikh', 'Prof. Bilal Ahmed', 'Dr. Hira Batool',
  'Mr. Tariq Mehmood', 'Ms. Sana Javed', 'Prof. Zainab Noor', 'Mr. Kashif Riaz',
  'Dr. Nimrah Tariq', 'Ms. Sidra Iqbal', 'Mr. Ovais Mughal',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function generateRecords() {
  const records = [];
  let id = 1;
  const now = new Date();

  for (let monthsBack = 2; monthsBack >= 0; monthsBack--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth() - monthsBack, day);
      if (date.getDay() === 5 || date.getDay() === 6) continue;

      const dateStr = formatDate(date);
      const yearLabel = ACADEMIC_YEARS[0];

      const studentCount = randomInt(3, 6);
      for (let i = 0; i < studentCount; i++) {
        const name = randomItem(STUDENT_NAMES);
        const status = randomItem(STATUSES);
        const cls = randomItem(CLASS_NAMES);
        const checkIn = status === 'Present' || status === 'Late' ? formatTime(new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomInt(7, 9), randomInt(0, 59))) : '';
        const checkOut = status === 'Present' || status === 'Late' ? formatTime(new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomInt(13, 16), randomInt(0, 59))) : '';

        records.push({
          id: `ah_${id++}`,
          name,
          personId: `STD-${yearLabel.split('-')[0]}-${String(id).padStart(4, '0')}`,
          type: 'Student',
          classOrDept: cls,
          date: dateStr,
          checkIn,
          checkOut,
          status,
          mode: randomItem(MODES),
          academicYear: yearLabel,
        });
      }

      const teacherCount = randomInt(2, 4);
      for (let i = 0; i < teacherCount; i++) {
        const name = randomItem(TEACHER_NAMES);
        const status = randomItem(STATUSES);
        const dept = randomItem(DEPARTMENTS);
        const checkIn = status === 'Present' || status === 'Late' ? formatTime(new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomInt(7, 9), randomInt(0, 59))) : '';
        const checkOut = status === 'Present' || status === 'Late' ? formatTime(new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomInt(13, 16), randomInt(0, 59))) : '';

        records.push({
          id: `ah_${id++}`,
          name,
          personId: `TCH-${yearLabel.split('-')[0]}-${String(id).padStart(4, '0')}`,
          type: 'Teacher',
          classOrDept: dept,
          date: dateStr,
          checkIn,
          checkOut,
          status,
          mode: randomItem(MODES),
          academicYear: yearLabel,
        });
      }
    }
  }

  return records;
}

const attendanceHistoryService = {
  getRecords(filters = {}) {
    let records;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        records = JSON.parse(raw);
      } else {
        records = generateRecords();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      }
    } catch {
      records = generateRecords();
    }

    if (filters.type && filters.type !== 'All') {
      records = records.filter((r) => r.type === filters.type);
    }
    if (filters.academicYear) {
      records = records.filter((r) => r.academicYear === filters.academicYear);
    }
    if (filters.className) {
      records = records.filter((r) => r.classOrDept === filters.className);
    }
    if (filters.status && filters.status !== 'All') {
      records = records.filter((r) => r.status === filters.status);
    }
    if (filters.fromDate) {
      records = records.filter((r) => r.date >= filters.fromDate);
    }
    if (filters.toDate) {
      records = records.filter((r) => r.date <= filters.toDate);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      records = records.filter((r) => r.name.toLowerCase().includes(q) || r.personId.toLowerCase().includes(q));
    }

    records.sort((a, b) => b.date.localeCompare(a.date));
    return records;
  },

  getStats(records) {
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const leave = records.filter((r) => r.status === 'Leave').length;
    const late = records.filter((r) => r.status === 'Late').length;
    return { total, present, absent, leave, late };
  },

  getMonthlyStats(records) {
    const monthly = {};
    records.forEach((r) => {
      const month = r.date.slice(0, 7);
      if (!monthly[month]) monthly[month] = { present: 0, absent: 0, leave: 0, late: 0, total: 0 };
      monthly[month][r.status.toLowerCase()]++;
      monthly[month].total++;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));
  },

  getDailyStats(records, days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const recent = records.filter((r) => r.date >= cutoff.toISOString().split('T')[0]);
    const daily = {};
    recent.forEach((r) => {
      if (!daily[r.date]) daily[r.date] = { present: 0, absent: 0, total: 0 };
      daily[r.date].total++;
      if (r.status === 'Present') daily[r.date].present++;
      else daily[r.date].absent++;
    });
    return Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));
  },

  ACADEMIC_YEARS,
  CLASSES: CLASS_NAMES,
  DEPARTMENTS,
};

export default attendanceHistoryService;
