import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from '../models/student.model.js';
import User from '../models/user.model.js';
import StudentPromotion from '../models/studentPromotion.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import AuditLog from '../models/auditLog.model.js';
import { ApiError } from '../utils/apiError.js';
import { stripBaseUrl } from '../utils/imageUrl.js';
import { writeUploadFile } from '../middlewares/upload.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deleteFileAtPath = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.resolve(__dirname, '../..', relativePath);
  try {
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch { /* ignore */ }
};

const createStudent = async (data, file, baseUrl = '') => {
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
  delete studentData.loginId;

  const filename = writeUploadFile(file.buffer, 'student-images', file.originalname);
  const imagePath = `uploads/student-images/${filename}`;
  studentData.studentImage = baseUrl ? `${baseUrl}/${imagePath}` : imagePath;

  let savedStudent;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      savedStudent = await Student.create(studentData);

      await User.create({
        loginId: savedStudent.studentId,
        fullName: savedStudent.fullName,
        password,
        role: 'student',
        referenceId: savedStudent._id,
        isActive: true,
      });

      return await Student.findById(savedStudent._id);
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.loginId && savedStudent) {
        await Student.deleteOne({ _id: savedStudent._id }).catch(() => {});
        savedStudent = null;
        continue;
      }

      deleteFileAtPath(imagePath);
      if (savedStudent) {
        await Student.deleteOne({ _id: savedStudent._id }).catch(() => {});
      }

      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const fieldLabel = { loginId: 'Login ID', studentId: 'Student ID', admissionNumber: 'Admission Number' };
        throw new ApiError(409, `${fieldLabel[field] || field} already exists`);
      }

      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        throw new ApiError(400, messages.join('. '));
      }

      throw error;
    }
  }
  deleteFileAtPath(imagePath);
  throw new ApiError(409, 'Login ID conflict. Please try again.');
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

const updateStudent = async (studentId, updateData, file, baseUrl = '') => {
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
      deleteFileAtPath(stripBaseUrl(existing.studentImage));
    }
    const filename = writeUploadFile(file.buffer, 'student-images', file.originalname);
    const imagePath = `uploads/student-images/${filename}`;
    cleanData.studentImage = baseUrl ? `${baseUrl}/${imagePath}` : imagePath;
  }

  const updated = await Student.findOneAndUpdate(
    { studentId },
    { $set: cleanData },
    { returnDocument: "after", runValidators: true },
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
    deleteFileAtPath(stripBaseUrl(existing.studentImage));
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
