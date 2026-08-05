import FeeStructure from '../models/feeStructure.model.js';
import { ApiError } from '../utils/apiError.js';

const createFeeStructure = async (data, userId) => {
  const { academicYear, class: className } = data;

  const duplicate = await FeeStructure.findOne({ academicYear, class: className });
  if (duplicate) {
    throw new ApiError(
      409,
      `A fee structure for ${className} already exists in the academic year ${academicYear}`,
    );
  }

  try {
    const structure = await FeeStructure.create({
      ...data,
      createdBy: userId,
    });
    return structure;
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }
    if (error.code === 11000) {
      throw new ApiError(
        409,
        `A fee structure for ${className} already exists in the academic year ${academicYear}`,
      );
    }
    throw error;
  }
};

const getAllFeeStructures = async (filters = {}) => {
  const {
    academicYear,
    class: className,
    status,
    search,
    page = 1,
    limit = 10,
  } = filters;

  const filter = {};

  if (academicYear) filter.academicYear = academicYear;
  if (className) filter.class = className;
  if (status) filter.status = status;

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { class: regex },
      { academicYear: regex },
    ];
  }

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const itemsPerPage = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (currentPage - 1) * itemsPerPage;

  const estimateFilter = { status: 'Active' };
  if (academicYear) estimateFilter.academicYear = academicYear;
  if (className) estimateFilter.class = className;

  const [structures, totalItems, estimate] = await Promise.all([
    FeeStructure.find(filter)
      .sort({ class: 1, academicYear: 1 })
      .skip(skip)
      .limit(itemsPerPage)
      .lean(),
    FeeStructure.countDocuments(filter),
    FeeStructure.aggregate([
      { $match: estimateFilter },
      { $group: { _id: null, monthlyCollectionEstimate: { $sum: '$monthlyFee' } } },
    ]),
  ]);

  return {
    structures,
    summary: {
      monthlyCollectionEstimate: estimate[0]?.monthlyCollectionEstimate || 0,
    },
    pagination: {
      currentPage,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      totalItems,
    },
  };
};

const getFeeStructureById = async (id) => {
  const structure = await FeeStructure.findById(id).lean();

  if (!structure) {
    throw new ApiError(404, 'Fee structure not found');
  }

  return structure;
};

const updateFeeStructure = async (id, data) => {
  const existing = await FeeStructure.findById(id);

  if (!existing) {
    throw new ApiError(404, 'Fee structure not found');
  }

  const newAcademicYear = data.academicYear || existing.academicYear;
  const newClass = data.class || existing.class;

  const duplicate = await FeeStructure.findOne({
    academicYear: newAcademicYear,
    class: newClass,
    _id: { $ne: id },
  });
  if (duplicate) {
    throw new ApiError(
      409,
      `A fee structure for ${newClass} already exists in the academic year ${newAcademicYear}`,
    );
  }

  try {
    const updated = await FeeStructure.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return updated;
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }
    if (error.code === 11000) {
      throw new ApiError(
        409,
        `A fee structure for ${newClass} already exists in the academic year ${newAcademicYear}`,
      );
    }
    throw error;
  }
};

const deleteFeeStructure = async (id) => {
  const structure = await FeeStructure.findById(id);

  if (!structure) {
    throw new ApiError(404, 'Fee structure not found');
  }

  await FeeStructure.findByIdAndDelete(id);

  return structure;
};

export default {
  createFeeStructure,
  getAllFeeStructures,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
};
