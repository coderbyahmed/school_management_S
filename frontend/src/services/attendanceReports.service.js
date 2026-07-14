const STORAGE_KEY = 'attendance_reports_records';
const ACADEMIC_YEARS = [
  '2025', '2026', '2027', '2028', '2029', '2030',
  '2031', '2032', '2033', '2034', '2035',
];
const CLASSES = [
  'Montessori', 'Nursery', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];
const DEPARTMENTS = ['Science', 'Arts', 'Mathematics', 'Languages', 'Computer Science', 'Physical Education', 'Islamic Studies'];
const MODES = ['Manual', 'QR Code', 'Hardware (Coming Soon)'];

const STUDENT_NAMES = [
  'Ahmed Khan', 'Sara Ali', 'Muhammad Usman', 'Fatima Zahra', 'Ali Raza',
  'Ayesha Bibi', 'Hassan Javed', 'Zainab Malik', 'Omar Farooq', 'Hira Batool',
  'Hamza Sheikh', 'Mahnoor Ahmed', 'Bilal Hussain', 'Laiba Noor', 'Tahir Iqbal',
  'Sana Mirza', 'Rayan Akhtar', 'Iqra Aziz', 'Zayan Siddiqui', 'Eman Tariq',
  'Arham Sheikh', 'Sehrish Ali', 'Ibrahim Hashmi', 'Fiza Qureshi', 'Rayyan Ansari',
  'Noor Fatima', 'Moin Abbas', 'Sidra Iqbal', 'Rafay Mansoor', 'Hania Amir',
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

let nameCounter = {};

function uniqueName(name) {
  if (!nameCounter[name]) nameCounter[name] = 0;
  nameCounter[name]++;
  if (nameCounter[name] > 1) return `${name} ${nameCounter[name]}`;
  return name;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function generateRecords() {
  const records = [];
  let id = 1;
  const now = new Date();
  const yearLabel = ACADEMIC_YEARS[0];

  nameCounter = {};

  const persons = [];

  for (let i = 0; i < 25; i++) {
    const name = uniqueName(randomItem(STUDENT_NAMES));
    persons.push({
      name,
      personId: `STD-${yearLabel.split('-')[0]}-${String(i + 1).padStart(4, '0')}`,
      type: 'Student',
      classOrDept: randomItem(CLASSES),
    });
  }

  for (let i = 0; i < 12; i++) {
    const name = uniqueName(randomItem(TEACHER_NAMES));
    persons.push({
      name,
      personId: `TCH-${yearLabel.split('-')[0]}-${String(i + 1).padStart(4, '0')}`,
      type: 'Teacher',
      classOrDept: randomItem(DEPARTMENTS),
    });
  }

  for (let monthsBack = 3; monthsBack >= 0; monthsBack--) {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth() - monthsBack, day);
      if (date.getDay() === 5 || date.getDay() === 6) continue;

      const dateStr = formatDate(date);

      persons.forEach((person) => {
        const rand = Math.random();
        const status = rand < 0.55 ? 'Present' : rand < 0.72 ? 'Absent' : rand < 0.86 ? 'Late' : 'Leave';
        const checkIn = status === 'Present' || status === 'Late'
          ? formatTime(new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomInt(7, 9), randomInt(0, 59)))
          : '';
        const checkOut = status === 'Present' || status === 'Late'
          ? formatTime(new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomInt(13, 16), randomInt(0, 59)))
          : '';

        records.push({
          id: `rep_${id++}`,
          name: person.name,
          personId: person.personId,
          type: person.type,
          classOrDept: person.classOrDept,
          date: dateStr,
          checkIn,
          checkOut,
          status,
          mode: randomItem(MODES),
          academicYear: yearLabel,
        });
      });
    }
  }

  return records;
}

function applyFilters(records, filters) {
  let list = [...records];
  if (filters.type && filters.type !== 'All') {
    list = list.filter((r) => r.type === filters.type);
  }
  if (filters.academicYear) {
    list = list.filter((r) => r.academicYear === filters.academicYear);
  }
  if (filters.className) {
    list = list.filter((r) => r.classOrDept === filters.className);
  }
  if (filters.fromDate) {
    list = list.filter((r) => r.date >= filters.fromDate);
  }
  if (filters.toDate) {
    list = list.filter((r) => r.date <= filters.toDate);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter((r) => r.name.toLowerCase().includes(q) || r.personId.toLowerCase().includes(q));
  }
  return list.sort((a, b) => b.date.localeCompare(a.date));
}

const attendanceReportsService = {
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
      records = [];
    }
    return applyFilters(records, filters);
  },

  clearCache() {
    localStorage.removeItem(STORAGE_KEY);
  },

  getStats(records) {
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const leave = records.filter((r) => r.status === 'Leave').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, leave, late, percentage };
  },

  getMonthlyTrend(records) {
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

  getClassWiseStats(records) {
    const grouped = {};
    records.forEach((r) => {
      const key = r.classOrDept;
      if (!grouped[key]) grouped[key] = { present: 0, absent: 0, total: 0 };
      grouped[key].total++;
      if (r.status === 'Present') grouped[key].present++;
      else grouped[key].absent++;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, data]) => ({ name, present: data.present, absent: data.absent, total: data.total, percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0 }));
  },

  getTeacherOverview(records) {
    const teacherRecords = records.filter((r) => r.type === 'Teacher');
    return this.getClassWiseStats(teacherRecords);
  },

  getPersonSummaries(records) {
    const personMap = {};
    records.forEach((r) => {
      if (!personMap[r.personId]) {
        personMap[r.personId] = {
          name: r.name,
          personId: r.personId,
          type: r.type,
          classOrDept: r.classOrDept,
          present: 0, absent: 0, leave: 0, late: 0, total: 0,
        };
      }
      personMap[r.personId].total++;
      personMap[r.personId][r.status.toLowerCase()]++;
    });
    return Object.values(personMap)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => ({ ...p, percentage: p.total > 0 ? Math.round((p.present / p.total) * 100) : 0 }));
  },

  getPersonSummary(records, personId) {
    const personRecords = records.filter((r) => r.personId === personId);
    if (!personRecords.length) return null;

    const person = personRecords[0];
    const stats = this.getStats(personRecords);
    const monthly = this.getMonthlyTrend(personRecords);

    const modeStats = {};
    personRecords.forEach((r) => {
      modeStats[r.mode] = (modeStats[r.mode] || 0) + 1;
    });

    return {
      name: person.name,
      personId: person.personId,
      type: person.type,
      classOrDept: person.classOrDept,
      academicYear: person.academicYear,
      ...stats,
      monthly,
      modeStats,
      records: personRecords,
    };
  },

  ACADEMIC_YEARS,
  CLASSES,
  DEPARTMENTS,
};

export default attendanceReportsService;
