import Subject from '../models/subject.model.js';
import Class from '../models/class.model.js';
import Teacher from '../models/teacher.model.js';
import { ApiError } from '../utils/apiError.js';

const createSubject = async (data) => {
  const { subjectName, status, description } = data;

  const existing = await Subject.findOne({ subjectName });

  if (existing) {
    throw new ApiError(409, 'Subject with this name already exists');
  }

  try {
    const subject = await Subject.create({ subjectName, status: status || 'Active', description: description || '' });

    return subject;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'Subject with this name already exists');
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }

    throw error;
  }
};

const getAllSubjects = async () => {
  const subjects = await Subject.find().sort({ createdAt: -1 }).lean();

  return subjects;
};

const getSubjectById = async (id) => {
  const subject = await Subject.findById(id);

  if (!subject) {
    throw new ApiError(404, 'Subject not found');
  }

  return subject;
};

const updateSubject = async (id, data) => {
  const existing = await Subject.findById(id);

  if (!existing) {
    throw new ApiError(404, 'Subject not found');
  }

  if (data.subjectName) {
    const duplicate = await Subject.findOne({
      _id: { $ne: id },
      subjectName: data.subjectName,
    });

    if (duplicate) {
      throw new ApiError(409, 'Subject with this name already exists');
    }
  }

  try {
    const updated = await Subject.findByIdAndUpdate(id, data, { new: true, runValidators: true });

    return updated;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'Subject with this name already exists');
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }

    throw error;
  }
};

const deleteSubject = async (id) => {
  const existing = await Subject.findById(id);

  if (!existing) {
    throw new ApiError(404, 'Subject not found');
  }

  const subjectId = existing._id;

  await Subject.findByIdAndDelete(id);

  const classesWithSubject = await Class.find({ assignedSubjects: subjectId });

  for (const cls of classesWithSubject) {
    cls.assignedSubjects.pull(subjectId);
    await cls.save();
  }

  const teachersWithSubject = await Teacher.find({ assignedSubjects: subjectId });

  for (const teacher of teachersWithSubject) {
    teacher.assignedSubjects.pull(subjectId);
    await teacher.save();
  }

  await updateAssignmentCounts();
};

const assignSubjectsToClass = async (className, academicYear, subjectIds) => {
  const classDoc = await Class.findOne({ className, academicYear });

  if (!classDoc) {
    throw new ApiError(404, 'Class not found');
  }

  const validSubjects = await Subject.find({ _id: { $in: subjectIds } });

  if (validSubjects.length !== subjectIds.length) {
    throw new ApiError(400, 'One or more subjects not found');
  }

  const existingIds = (classDoc.assignedSubjects || []).map((id) => id.toString());
  const newIds = subjectIds.filter((id) => !existingIds.includes(id));

  if (newIds.length === 0) {
    throw new ApiError(409, 'Subject is already assigned to this class');
  }

  classDoc.assignedSubjects = [...classDoc.assignedSubjects, ...newIds];
  await classDoc.save();

  await updateAssignmentCounts();

  return classDoc;
};

const getClassAssignments = async (className, academicYear) => {
  const classDoc = await Class.findOne({ className, academicYear }).populate('assignedSubjects');

  if (!classDoc) {
    throw new ApiError(404, 'Class not found');
  }

  const allSubjects = await Subject.find().lean();

  return {
    class: classDoc,
    assignedSubjects: classDoc.assignedSubjects || [],
    allSubjects,
  };
};

const assignSubjectsToTeacher = async (teacherId, subjectIds) => {
  const teacher = await Teacher.findOne({ teacherId });

  if (!teacher) {
    throw new ApiError(404, 'Teacher not found');
  }

  const validSubjects = await Subject.find({ _id: { $in: subjectIds } });

  if (validSubjects.length !== subjectIds.length) {
    throw new ApiError(400, 'One or more subjects not found');
  }

  const existingIds = (teacher.assignedSubjects || []).map((id) => id.toString());
  const newIds = subjectIds.filter((id) => !existingIds.includes(id));

  if (newIds.length === 0) {
    throw new ApiError(409, 'Subject is already assigned to this teacher');
  }

  teacher.assignedSubjects = [...teacher.assignedSubjects, ...newIds];
  await teacher.save();

  await updateAssignmentCounts();

  return teacher;
};

const getTeacherAssignments = async (teacherId) => {
  const teacher = await Teacher.findOne({ teacherId }).populate('assignedSubjects');

  if (!teacher) {
    throw new ApiError(404, 'Teacher not found');
  }

  const allSubjects = await Subject.find().lean();

  return {
    teacher,
    assignedSubjects: teacher.assignedSubjects || [],
    allSubjects,
  };
};

const updateAssignmentCounts = async () => {
  const allSubjects = await Subject.find();

  for (const subject of allSubjects) {
    const classesCount = await Class.countDocuments({ assignedSubjects: subject._id });
    const teachersCount = await Teacher.countDocuments({ assignedSubjects: subject._id });

    if (subject.assignedClassesCount !== classesCount || subject.assignedTeachersCount !== teachersCount) {
      await Subject.findByIdAndUpdate(subject._id, {
        assignedClassesCount: classesCount,
        assignedTeachersCount: teachersCount,
      });
    }
  }
};

export default {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  assignSubjectsToClass,
  getClassAssignments,
  assignSubjectsToTeacher,
  getTeacherAssignments,
};
