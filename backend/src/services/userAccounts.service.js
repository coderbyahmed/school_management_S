import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Admin from '../models/admin.model.js';
import { ApiError } from '../utils/apiError.js';

const getAllAccounts = async ({ search, type, status, page = 1, limit = 10 }) => {
  const match = {};

  if (type && type !== 'All Types') {
    match.role = type.toLowerCase();
  } else {
    match.role = { $in: ['student', 'teacher'] };
  }

  if (status && status !== 'All Status') {
    match.status = status;
  }

  if (search && search.trim()) {
    const term = search.trim();
    match.$or = [
      { fullName: { $regex: term, $options: 'i' } },
      { loginId: { $regex: term, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const students = await Student.find(match).select('studentId loginId fullName studentImage status lastLogin lastLogout createdAt role').lean();
  const teachers = await Teacher.find(match).select('teacherId loginId fullName teacherImage status lastLogin lastLogout createdAt role').lean();

  const combined = [
    ...students.map((s) => ({
      _id: s._id,
      loginId: s.loginId || s.studentId,
      fullName: s.fullName,
      type: 'Student',
      status: s.status,
      lastLogin: s.lastLogin,
      lastLogout: s.lastLogout,
      image: s.studentImage || null,
      createdAt: s.createdAt,
    })),
    ...teachers.map((t) => ({
      _id: t._id,
      loginId: t.loginId || t.teacherId,
      fullName: t.fullName,
      type: 'Teacher',
      status: t.status,
      lastLogin: t.lastLogin,
      lastLogout: t.lastLogout,
      image: t.teacherImage || null,
      createdAt: t.createdAt,
    })),
  ];

  combined.sort((a, b) => (b.createdAt || '').toString().localeCompare((a.createdAt || '').toString()));

  const totalRecords = combined.length;
  const totalPages = Math.ceil(totalRecords / limitNum);
  const paginatedAccounts = combined.slice(skip, skip + limitNum);

  const totalStudents = await Student.countDocuments();
  const totalTeachers = await Teacher.countDocuments();
  const inactiveStudents = await Student.countDocuments({ status: 'Inactive' });
  const inactiveTeachers = await Teacher.countDocuments({ status: 'Inactive' });

  return {
    accounts: paginatedAccounts,
    stats: {
      total: totalStudents + totalTeachers,
      students: totalStudents,
      teachers: totalTeachers,
      inactive: inactiveStudents + inactiveTeachers,
    },
    pagination: {
      totalRecords,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

const getAccountByLoginId = async (loginId) => {
  let account = await Student.findOne({ loginId }).select('-password -__v').lean();
  let type = 'Student';

  if (!account) {
    account = await Teacher.findOne({ loginId }).select('-password -__v').lean();
    type = 'Teacher';
  }

  if (!account) {
    throw new ApiError(404, 'Account not found');
  }

  return {
    ...account,
    type,
  };
};

const resetPassword = async (targetId, targetType, newPassword, adminId) => {
  let user;
  if (targetType === 'Student') {
    user = await Student.findById(targetId).select('+password');
  } else if (targetType === 'Teacher') {
    user = await Teacher.findById(targetId).select('+password');
  } else {
    throw new ApiError(400, 'Invalid user type');
  }

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.password = newPassword;
  user.lastPasswordReset = new Date();
  user.passwordResetBy = adminId;
  await user.save();

  return true;
};

const getPasswordManagementData = async ({ search, type, page = 1, limit = 10 }) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const match = {
    lastPasswordReset: { $ne: null, $gte: thirtyDaysAgo },
  };

  if (type && type !== 'All Types') {
    match.role = type.toLowerCase();
  } else {
    match.role = { $in: ['student', 'teacher'] };
  }

  if (search && search.trim()) {
    const term = search.trim();
    match.$or = [
      { fullName: { $regex: term, $options: 'i' } },
      { loginId: { $regex: term, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const students = await Student.find(match)
    .select('loginId fullName studentImage role lastPasswordReset passwordResetBy')
    .populate('passwordResetBy', 'fullName')
    .lean();

  const teachers = await Teacher.find(match)
    .select('loginId fullName teacherImage role lastPasswordReset passwordResetBy')
    .populate('passwordResetBy', 'fullName')
    .lean();

  const combined = [
    ...students.map((s) => ({
      _id: s._id,
      loginId: s.loginId,
      fullName: s.fullName,
      image: s.studentImage || null,
      type: 'Student',
      lastPasswordReset: s.lastPasswordReset,
      resetBy: s.passwordResetBy?.fullName || null,
    })),
    ...teachers.map((t) => ({
      _id: t._id,
      loginId: t.loginId,
      fullName: t.fullName,
      image: t.teacherImage || null,
      type: 'Teacher',
      lastPasswordReset: t.lastPasswordReset,
      resetBy: t.passwordResetBy?.fullName || null,
    })),
  ];

  combined.sort((a, b) => new Date(b.lastPasswordReset) - new Date(a.lastPasswordReset));

  const totalRecords = combined.length;
  const totalPages = Math.ceil(totalRecords / limitNum);
  const paginatedAccounts = combined.slice(skip, skip + limitNum);

  const studentsWithReset = await Student.countDocuments({ lastPasswordReset: { $ne: null, $gte: thirtyDaysAgo } });
  const teachersWithReset = await Teacher.countDocuments({ lastPasswordReset: { $ne: null, $gte: thirtyDaysAgo } });

  return {
    accounts: paginatedAccounts,
    stats: {
      totalResets: studentsWithReset + teachersWithReset,
    },
    pagination: {
      totalRecords,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

export default {
  getAllAccounts,
  getAccountByLoginId,
  resetPassword,
  getPasswordManagementData,
};
