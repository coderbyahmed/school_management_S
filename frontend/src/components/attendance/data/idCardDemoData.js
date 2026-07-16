import { ACADEMIC_YEARS, CLASS_NAMES } from '../../../utils/classNames';
const CLASS_LIST = CLASS_NAMES;

const NAMES = [
  'Ahmed Khan', 'Sara Ali', 'Muhammad Usman', 'Fatima Zahra', 'Ali Raza',
  'Ayesha Bibi', 'Hassan Javed', 'Zainab Malik', 'Omar Farooq', 'Hira Batool',
  'Hamza Sheikh', 'Mahnoor Ahmed', 'Bilal Hussain', 'Laiba Noor', 'Tahir Iqbal',
  'Sana Mirza', 'Rayan Akhtar', 'Iqra Aziz', 'Zayan Siddiqui', 'Eman Tariq',
  'Aryan Bhatti', 'Rida Fatima', 'Shahmir Ali', 'Dua Hasan', 'Rohail Shah',
  'Minahil Zafar', 'Saim Riaz', 'Aleena Khan', 'Huzaifa Khalid', 'Amna Rizvi',
  'Arham Sheikh', 'Sehrish Ali', 'Ibrahim Hashmi', 'Fiza Qureshi', 'Rayyan Ansari',
  'Noor Fatima', 'Moin Abbas', 'Sidra Iqbal', 'Rafay Mansoor', 'Hania Amir',
];

const FATHER_NAMES = [
  'Mohammad Khan', 'Abdul Ali', 'Rashid Usman', 'Khaled Zahra', 'Hassan Raza',
  'Jamal Bibi', 'Imran Javed', 'Tariq Malik', 'Saeed Farooq', 'Nadeem Batool',
  'Farhan Sheikh', 'Akram Ahmed', 'Javed Hussain', 'Aslam Noor', 'Shafiq Iqbal',
  'Arif Mirza', 'Irfan Akhtar', 'Zafar Aziz', 'Tanveer Siddiqui', 'Naeem Tariq',
  'Shabbir Bhatti', 'Anwar Fatima', 'Rizwan Ali', 'Pervaiz Hasan', 'Iqbal Shah',
  'Shahid Zafar', 'Khalid Riaz', 'Asghar Khan', 'Naveed Khalid', 'Faisal Rizvi',
  'Waqar Sheikh', 'Bashir Ali', 'Shahzad Hashmi', 'Aamir Qureshi', 'Junaid Ansari',
  'Riaz Fatima', 'Arshad Abbas', 'Qadir Iqbal', 'Nasir Mansoor', 'Saleem Amir',
];

function generateId(yearLabel, index) {
  const prefix = yearLabel.split('-')[0];
  return `STD-${prefix}-${String(index).padStart(4, '0')}`;
}

function generateDummyStudents() {
  const students = [];
  let globalIdx = 1;

  ACADEMIC_YEARS.slice(0, 3).forEach((year) => {
    CLASS_LIST.forEach((cls) => {
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        const fullName = NAMES[Math.floor(Math.random() * NAMES.length)];
        const fatherName = FATHER_NAMES[Math.floor(Math.random() * FATHER_NAMES.length)];
        const phoneDigits = String(Math.floor(1000000 + Math.random() * 9000000));
        students.push({
          id: `idc_${globalIdx}`,
          fullName,
          studentId: generateId(year, globalIdx),
          class: cls,
          academicYear: year,
          fatherName,
          fatherPhone: `+92-3${Math.floor(Math.random() * 10)}-${phoneDigits}`,
          qrStatus: Math.random() > 0.2 ? 'Generated' : 'Not Generated',
          cardStatus: Math.random() > 0.5 ? 'Printed' : 'Not Printed',
        });
        globalIdx++;
      }
    });
  });

  return students;
}

const idCardDemoData = {
  getStudents() {
    return generateDummyStudents();
  },
};

export { ACADEMIC_YEARS, CLASS_LIST };
export default idCardDemoData;
