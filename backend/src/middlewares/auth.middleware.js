import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Admin from '../models/admin.model.js';
import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized, no token');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;

    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.role === 'teacher') {
      user = await Teacher.findById(decoded.id).select('-password');
    } else if (decoded.role === 'student') {
      user = await Student.findById(decoded.id).select('-password');
    }

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    user.role = decoded.role;

    if (decoded.adminAccess) {
      user.isAdminAccess = true;
      user.adminId = decoded.adminId;
    }

    if (user.isActive === false) {
      throw new ApiError(403, 'Your account has been deactivated. Please contact the school administrator.');
    }

    if (decoded.role === 'student' && user.status === 'Inactive') {
      throw new ApiError(403, 'Your account has been deactivated. Please contact the school administrator.');
    }

    if (decoded.role === 'teacher' && user.status === 'Inactive') {
      throw new ApiError(403, 'Your account has been deactivated. Please contact the school administrator.');
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token');
    }
    throw new ApiError(401, 'Not authorized');
  }
});

export { protect };
