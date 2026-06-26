import Class from '../models/class.model.js';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Timetable from '../models/timetable.model.js';
import { ApiError } from '../utils/apiError.js';

const createClass = async (data) => {
  const { className, academicYear, status } = data;

  const existing = await Class.findOne({ className, academicYear });

  if (existing) {
    throw new ApiError(409, 'Class already exists for selected academic year');
  }

  try {
    const newClass = await Class.create({ className, academicYear, status });

    return newClass;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'Class already exists for selected academic year');
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }

    throw error;
  }
};

const CLASS_ORDER = [
  'Montessori', 'Nursery', 'KG 1', 'KG 2',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
];

const getAllClasses = async () => {
  const [classes, totalStudents] = await Promise.all([
    Class.find().lean(),
    Student.countDocuments(),
  ]);

  classes.sort((a, b) => CLASS_ORDER.indexOf(a.className) - CLASS_ORDER.indexOf(b.className));

  const classStudentCounts = await Promise.all(
    classes.map(async (cls) => {
      const count = await Student.countDocuments({
        class: cls.className,
        academicYear: cls.academicYear,
      });
      return { ...cls, totalStudents: count };
    }),
  );

  const activeCount = classes.filter((c) => c.status === 'Active').length;
  const inactiveCount = classes.filter((c) => c.status === 'Inactive').length;

  return {
    classes: classStudentCounts,
    statistics: {
      totalClasses: classes.length,
      activeClasses: activeCount,
      inactiveClasses: inactiveCount,
      totalStudents,
    },
  };
};

const updateClass = async (id, data) => {
  const existing = await Class.findById(id);

  if (!existing) {
    throw new ApiError(404, 'Class not found');
  }

  const { className, academicYear, status } = data;

  if (className && academicYear) {
    const duplicate = await Class.findOne({
      _id: { $ne: id },
      className,
      academicYear,
    });

    if (duplicate) {
      throw new ApiError(409, 'Class already exists for selected academic year');
    }
  }

  try {
    const updated = await Class.findByIdAndUpdate(
      id,
      { className, academicYear, status },
      { new: true, runValidators: true },
    );

    return updated;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'Class already exists for selected academic year');
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }

    throw error;
  }
};

const deleteClass = async (id) => {
  const existing = await Class.findById(id);

  if (!existing) {
    throw new ApiError(404, 'Class not found');
  }

  const { className, academicYear } = existing;

  await Promise.all([
    Class.findByIdAndDelete(id),
    Student.updateMany(
      { class: className, academicYear },
      { $unset: { class: '' } },
    ),
    Timetable.deleteMany({ classId: id }),
  ]);
};

const getClassDetails = async (classId) => {
  const classInfo = await Class.findById(classId).populate('assignedSubjects');

  if (!classInfo) {
    throw new ApiError(404, 'Class not found');
  }

  const { className, assignedSubjects } = classInfo;

  const [totalStudents, students, teachers] = await Promise.all([
    Student.countDocuments({ class: className }),
    Student.find({ class: className }).select('studentImage studentId fullName status').sort({ fullName: 1 }),
    Teacher.find({ assignedSubjects: { $in: assignedSubjects } }).select('teacherImage teacherId fullName status'),
  ]);

  const subjects = assignedSubjects.map((s) => ({
    _id: s._id,
    subjectName: s.subjectName,
    subjectCode: s.subjectCode,
  }));

  return {
    classInfo: {
      _id: classInfo._id,
      className: classInfo.className,
      academicYear: classInfo.academicYear,
      status: classInfo.status,
    },
    totalStudents,
    totalSubjects: assignedSubjects.length,
    totalTeachers: teachers.length,
    subjects,
    teachers,
    students,
  };
};

export default { createClass, getAllClasses, updateClass, deleteClass, getClassDetails };
