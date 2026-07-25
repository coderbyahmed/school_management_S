import StudentAttendance from '../models/studentAttendance.model.js';
import Student from '../models/student.model.js';
import { ApiError } from '../utils/apiError.js';

const VALID_CLASS_NAMES = [
  'Montessori', 'Nursery', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const saveAttendance = async (data, userId) => {
  const { academicYear, class: className, date, records } = data;

  const studentFilter = {
    academicYear,
    status: 'Active',
  };

  if (className) {
    studentFilter.class = className;
  }

  const students = await Student.find(studentFilter)
    .select('_id studentId fullName studentImage class academicYear').lean();

  if (students.length === 0) {
    throw new ApiError(404, `No active students found for ${className || 'any class'} in ${academicYear}`);
  }

  const studentClassMap = {};
  students.forEach((s) => {
    studentClassMap[s._id.toString()] = s.class;
  });

  const studentIds = new Set(students.map((s) => s._id.toString()));
  const invalidRecords = records.filter((r) => !studentIds.has(r.student));
  if (invalidRecords.length > 0) {
    throw new ApiError(400, 'Some student IDs do not belong to the selected class and academic year');
  }

  const bulkOps = records.map((record) => ({
    updateOne: {
      filter: {
        student: record.student,
        date: new Date(date),
      },
      update: {
        $set: {
          student: record.student,
          class: studentClassMap[record.student] || className,
          academicYear,
          date: new Date(date),
          status: record.status,
          method: record.method || 'Manual',
          checkIn: record.checkIn ? new Date(record.checkIn) : record.status !== 'Absent' ? new Date() : undefined,
          remarks: record.remarks || '',
          markedBy: userId,
        },
      },
      upsert: true,
    },
  }));

  await StudentAttendance.bulkWrite(bulkOps);

  const attendanceMap = {};
  records.forEach((r) => {
    attendanceMap[r.student] = {
      status: r.status,
      method: r.method || 'Manual',
    };
  });

  return {
    academicYear,
    class: className,
    date,
    totalStudents: students.length,
    markedCount: records.length,
    attendanceMap,
  };
};

const getStudentsWithAttendance = async (academicYear, className, date) => {
  const studentFilter = {
    academicYear,
    status: 'Active',
  };

  if (className && className !== 'All Classes') {
    studentFilter.class = className;
  }

  const students = await Student.find(studentFilter)
    .select('studentId fullName studentImage class academicYear')
    .sort({ fullName: 1 })
    .lean();

  if (students.length === 0) {
    return { students: [], attendanceMap: {} };
  }

  const attendanceDate = new Date(date);
  const studentIds = students.map((s) => s._id);

  const attendanceRecords = await StudentAttendance.find({
    student: { $in: studentIds },
    date: attendanceDate,
  })
    .select('student status checkIn method')
    .lean();

  const attendanceMap = {};
  attendanceRecords.forEach((record) => {
    attendanceMap[record.student.toString()] = {
      status: record.status,
      checkIn: record.checkIn,
      method: record.method,
    };
  });

  return { students, attendanceMap };
};

const getAttendanceByClass = async (className, academicYear, date) => {
  const filter = {};

  if (className && className !== 'All Classes') {
    filter.class = className;
  }

  if (academicYear) {
    filter.academicYear = academicYear;
  }

  if (date) {
    filter.date = new Date(date);
  }

  return StudentAttendance.find(filter)
    .populate('student', 'studentId fullName class')
    .sort({ date: -1 })
    .lean();
};

const getAttendanceByDate = async (date, academicYear) => {
  const filter = { date: new Date(date) };

  if (academicYear) {
    filter.academicYear = academicYear;
  }

  return StudentAttendance.find(filter)
    .populate('student', 'studentId fullName class')
    .sort({ createdAt: -1 })
    .lean();
};

const getAttendanceByStudent = async (studentId, academicYear) => {
  const filter = { student: studentId };

  if (academicYear) {
    filter.academicYear = academicYear;
  }

  return StudentAttendance.find(filter)
    .populate('student', 'studentId fullName class')
    .sort({ date: -1 })
    .lean();
};

const getAttendanceHistory = async (filters = {}) => {
  const {
    academicYear,
    class: className,
    status,
    fromDate,
    toDate,
    search,
    page = 1,
    limit = 500,
  } = filters;

  const studentFilter = { status: 'Active' };

  if (academicYear) {
    studentFilter.academicYear = academicYear;
  }

  if (className) {
    studentFilter.class = className;
  }

  if (search) {
    studentFilter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
    ];
  }

  const matchingStudents = await Student.find(studentFilter)
    .select('_id studentId fullName studentImage class academicYear')
    .lean();

  if (matchingStudents.length === 0) {
    return { records: [], total: 0 };
  }

  const studentIdMap = {};
  matchingStudents.forEach((s) => {
    studentIdMap[s._id.toString()] = s;
  });

  const attendanceFilter = {
    student: { $in: matchingStudents.map((s) => s._id) },
  };

  if (status && status !== 'All') {
    attendanceFilter.status = status;
  }

  if (fromDate || toDate) {
    attendanceFilter.date = {};
    if (fromDate) attendanceFilter.date.$gte = new Date(fromDate);
    if (toDate) attendanceFilter.date.$lte = new Date(toDate);
  }

  const total = await StudentAttendance.countDocuments(attendanceFilter);

  const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * parseInt(limit, 10);

  const attendanceRecords = await StudentAttendance.find(attendanceFilter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean();

  const records = attendanceRecords.map((record) => {
    const student = studentIdMap[record.student.toString()] || {};
    const checkInTime = record.checkIn
      ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      : null;

    return {
      id: record._id.toString(),
      name: student.fullName || 'Unknown',
      personId: student.studentId || '',
      type: 'Student',
      classOrDept: student.class || record.class,
      academicYear: student.academicYear || record.academicYear,
      date: record.date.toISOString().split('T')[0],
      checkIn: checkInTime,
      status: record.status,
      mode: record.method === 'QR' ? 'QR Code' : 'Manual',
    };
  });

  return { records, total };
};

const getAttendanceReports = async (filters = {}) => {
  return getAttendanceHistory(filters);
};

const deleteAttendance = async (id) => {
  const record = await StudentAttendance.findById(id);

  if (!record) {
    throw new ApiError(404, 'Attendance record not found');
  }

  await StudentAttendance.findByIdAndDelete(id);

  return record;
};

const deleteBulkAttendance = async (className, academicYear, date) => {
  const filter = {};

  if (className && className !== 'All Classes') {
    filter.class = className;
  }

  if (academicYear) {
    filter.academicYear = academicYear;
  }

  if (date) {
    filter.date = new Date(date);
  }

  const result = await StudentAttendance.deleteMany(filter);

  return { deletedCount: result.deletedCount };
};

export default {
  saveAttendance,
  getStudentsWithAttendance,
  getAttendanceByClass,
  getAttendanceByDate,
  getAttendanceByStudent,
  getAttendanceHistory,
  getAttendanceReports,
  deleteAttendance,
  deleteBulkAttendance,
};
