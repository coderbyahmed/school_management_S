const DEMO_STUDENTS_KEY = 'demo_students';
const DEMO_TEACHERS_KEY = 'demo_teachers';

const CLASSES = [
  'Montessori', 'Nursery', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const DEPARTMENTS = ['Science', 'Arts', 'Mathematics', 'Languages', 'Computer Science', 'Physical Education', 'Islamic Studies'];

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

function generateDemoStudents() {
  const students = [];
  const usedNames = new Set();

  for (let i = 1; i <= 20; i++) {
    let name;
    do { name = randomItem(STUDENT_NAMES); } while (usedNames.has(name));
    usedNames.add(name);

    students.push({
      _id: `demo_stu_${i}`,
      studentId: `STD-2025-${String(i).padStart(4, '0')}`,
      fullName: name,
      studentImage: null,
      admissionNumber: `ADM-${String(i).padStart(4, '0')}`,
      class: randomItem(CLASSES),
      academicYear: '2025-26',
    });
  }

  return students;
}

function generateDemoTeachers() {
  const teachers = [];
  const usedNames = new Set();

  for (let i = 1; i <= 15; i++) {
    let name;
    do { name = randomItem(TEACHER_NAMES); } while (usedNames.has(name));
    usedNames.add(name);

    teachers.push({
      _id: `demo_tch_${i}`,
      teacherId: `TCH-2025-${String(i).padStart(4, '0')}`,
      fullName: name,
      teacherImage: null,
      qualification: `Department of ${randomItem(DEPARTMENTS)}`,
      assignedSubjects: [randomItem(['Mathematics', 'Physics', 'Chemistry', 'English', 'Urdu', 'Computer Science', 'Islamic Studies'])],
    });
  }

  return teachers;
}

const demoDataService = {
  getDemoStudents() {
    try {
      const raw = localStorage.getItem(DEMO_STUDENTS_KEY);
      if (raw) return JSON.parse(raw);
      const data = generateDemoStudents();
      localStorage.setItem(DEMO_STUDENTS_KEY, JSON.stringify(data));
      return data;
    } catch {
      return [];
    }
  },

  getDemoTeachers() {
    try {
      const raw = localStorage.getItem(DEMO_TEACHERS_KEY);
      if (raw) return JSON.parse(raw);
      const data = generateDemoTeachers();
      localStorage.setItem(DEMO_TEACHERS_KEY, JSON.stringify(data));
      return data;
    } catch {
      return [];
    }
  },
};

export default demoDataService;
