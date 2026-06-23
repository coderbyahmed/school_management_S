import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Teacher from '../models/teacher.model.js';
import User from '../models/user.model.js';
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

const createTeacher = async (data, file, baseUrl = '') => {
  const { password, ...rest } = data;

  if (!password) {
    throw new ApiError(400, 'Password is required');
  }

  if (!file) {
    throw new ApiError(400, 'Teacher image is required');
  }

  const teacherData = { ...rest };
  delete teacherData.teacherId;
  delete teacherData.loginId;
  if (teacherData.joiningDate === '' || teacherData.joiningDate === null || teacherData.joiningDate === undefined) {
    delete teacherData.joiningDate;
  }

  const filename = writeUploadFile(file.buffer, 'teachers-images', file.originalname);
  const imagePath = `uploads/teachers-images/${filename}`;
  teacherData.teacherImage = baseUrl ? `${baseUrl}/${imagePath}` : imagePath;

  try {
    const teacher = await Teacher.create(teacherData);

    const user = await User.create({
      fullName: teacher.fullName,
      teacherId: teacher.teacherId,
      loginId: teacher.teacherId,
      referenceId: teacher._id,
      password,
      role: 'teacher',
      isActive: true,
    });

    const updates = {};
    if (teacher.phoneNumber) updates.phone = teacher.phoneNumber;
    if (teacher.teacherImage) updates.profileImage = teacher.teacherImage;
    if (Object.keys(updates).length > 0) {
      await User.updateOne({ _id: user._id }, { $set: updates });
    }

    const created = await Teacher.findById(teacher._id);

    return created;
  } catch (error) {
    deleteFileAtPath(imagePath);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw new ApiError(409, `Teacher with this ${field} already exists`);
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }

    throw error;
  }
};

const getAllTeachers = async (query) => {
  const { page: rawPage, limit: rawLimit, status, search } = query;

  const page = Math.max(1, parseInt(rawPage, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(rawLimit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = {};

  if (status) filter.status = status;

  if (search && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { fullName: { $regex: term, $options: 'i' } },
      { fatherName: { $regex: term, $options: 'i' } },
      { teacherId: { $regex: term, $options: 'i' } },
      { cnic: { $regex: term, $options: 'i' } },
    ];
  }

  const [teachers, totalTeachers] = await Promise.all([
    Teacher.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Teacher.countDocuments(filter),
  ]);

  return {
    teachers,
    totalTeachers,
    totalPages: Math.ceil(totalTeachers / limit),
    currentPage: page,
  };
};

const getTeacherById = async (teacherId) => {
  return await Teacher.findOne({ teacherId });
};

const updateTeacher = async (teacherId, updateData, file, baseUrl = '') => {
  const existing = await Teacher.findOne({ teacherId });
  if (!existing) {
    throw new ApiError(404, 'Teacher not found');
  }

  const forbidden = ['teacherId', '_id', 'loginId'];
  const cleanData = {};
  for (const key of Object.keys(updateData)) {
    if (!forbidden.includes(key)) {
      cleanData[key] = updateData[key];
    }
  }

  if (file) {
    if (existing.teacherImage) {
      deleteFileAtPath(stripBaseUrl(existing.teacherImage));
    }
    const filename = writeUploadFile(file.buffer, 'teachers-images', file.originalname);
    const imagePath = `uploads/teachers-images/${filename}`;
    cleanData.teacherImage = baseUrl ? `${baseUrl}/${imagePath}` : imagePath;
  }

  const updated = await Teacher.findOneAndUpdate(
    { teacherId },
    { $set: cleanData },
    { returnDocument: "after", runValidators: true },
  );

  if (cleanData.fullName || cleanData.status) {
    const syncFields = {};
    if (cleanData.fullName) syncFields.fullName = cleanData.fullName;
    if (cleanData.status) syncFields.isActive = cleanData.status === 'Active';
    await User.findOneAndUpdate(
      { referenceId: existing._id, role: 'teacher' },
      { $set: syncFields },
    );
  }

  return updated;
};

const deleteTeacher = async (teacherId, performedBy) => {
  const existing = await Teacher.findOne({ teacherId });
  if (!existing) {
    throw new ApiError(404, 'Teacher not found');
  }

  if (existing.teacherImage) {
    deleteFileAtPath(stripBaseUrl(existing.teacherImage));
  }

  const teacherUser = await User.findOne({ referenceId: existing._id, role: 'teacher' });

  await Promise.all([
    Teacher.deleteOne({ teacherId }),
    teacherUser ? User.deleteOne({ _id: teacherUser._id }) : Promise.resolve(),
  ]);

  return existing;
};

export default { createTeacher, getAllTeachers, getTeacherById, updateTeacher, deleteTeacher };
