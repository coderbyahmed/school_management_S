import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from '../models/student.model.js';
import User from '../models/user.model.js';
import StudentPromotion from '../models/studentPromotion.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import AuditLog from '../models/auditLog.model.js';
import { ApiError } from '../utils/apiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createStudent = async (data, file) => {
  const { password, ...rest } = data;

  if (!password) {
    throw new ApiError(400, 'Password is required');
  }

  if (!file) {
    throw new ApiError(400, 'Student image is required');
  }

  const studentData = { ...rest };
  delete studentData.studentId;
  delete studentData.admissionNumber;

  studentData.studentImage = `uploads/student-images/${file.filename}`;

  try {
    const student = await Student.create(studentData);

    await User.create({
      loginId: student.studentId,
      fullName: student.fullName,
      password,
      role: 'student',
      referenceId: student._id,
      isActive: true,
    });

    const created = await Student.findById(student._id);

    return created;
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw new ApiError(409, `Student with this ${field} already exists`);
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }

    throw error;
  }
};

const getAllStudents = async (query) => {
  const { page: rawPage, limit: rawLimit, class: classFilter, status, academicYear, search, studentId } = query;

  const page = Math.max(1, parseInt(rawPage, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(rawLimit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = {};

  if (classFilter) filter.class = classFilter;
  if (status) filter.status = status;
  if (academicYear) filter.academicYear = academicYear;

  if (studentId) {
    let idTerm = studentId.trim().toUpperCase();
    if (/^\d+$/.test(idTerm)) {
      idTerm = `STD-${idTerm.padStart(6, '0')}`;
    }
    filter.studentId = idTerm;
  }

  if (search && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { fullName: { $regex: term, $options: 'i' } },
      { fatherName: { $regex: term, $options: 'i' } },
      { studentId: { $regex: term, $options: 'i' } },
    ];
  }

  const [students, totalStudents] = await Promise.all([
    Student.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Student.countDocuments(filter),
  ]);

  return {
    students,
    totalStudents,
    totalPages: Math.ceil(totalStudents / limit),
    currentPage: page,
  };
};

const getStudentById = async (studentId) => {
  return await Student.findOne({ studentId });
};

const updateStudent = async (studentId, updateData, file) => {
  const existing = await Student.findOne({ studentId });
  if (!existing) {
    throw new ApiError(404, 'Student not found');
  }

  const forbidden = ['studentId', 'admissionNumber', 'loginId', 'password', '_id'];
  const cleanData = {};
  for (const key of Object.keys(updateData)) {
    if (!forbidden.includes(key)) {
      cleanData[key] = updateData[key];
    }
  }

  if (file) {
    if (existing.studentImage) {
      const oldPath = path.resolve(__dirname, '../..', existing.studentImage);
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch {
        // silently ignore
      }
    }
    cleanData.studentImage = `uploads/student-images/${file.filename}`;
  }

  const updated = await Student.findOneAndUpdate(
    { studentId },
    { $set: cleanData },
    { new: true, runValidators: true },
  );

  if (cleanData.fullName || cleanData.status) {
    const syncFields = {};
    if (cleanData.fullName) syncFields.fullName = cleanData.fullName;
    if (cleanData.status) syncFields.isActive = cleanData.status === 'Active';
    await User.findOneAndUpdate(
      { referenceId: existing._id, role: 'student' },
      { $set: syncFields },
    );
  }

  return updated;
};

const deleteStudent = async (studentId, performedBy) => {
  const existing = await Student.findOne({ studentId });
  if (!existing) {
    throw new ApiError(404, 'Student not found');
  }

  if (existing.studentImage) {
    const imagePath = path.resolve(__dirname, '../..', existing.studentImage);
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch {
      // silently ignore
    }
  }

  const studentUser = await User.findOne({ referenceId: existing._id, role: 'student' });

  await Promise.all([
    Student.deleteOne({ studentId }),
    studentUser ? User.deleteOne({ _id: studentUser._id }) : Promise.resolve(),
    StudentPromotion.deleteMany({ studentId: existing._id }),
    studentUser ? RefreshToken.deleteMany({ user: studentUser._id }) : Promise.resolve(),
  ]);

  if (performedBy) {
    await AuditLog.create({
      action: 'DELETE',
      module: 'STUDENT',
      entityId: existing.studentId,
      entityType: 'Student',
      performedBy,
      details: {
        fullName: existing.fullName,
        class: existing.class,
        academicYear: existing.academicYear,
      },
    });
  }

  return existing;
};

export default { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent };
