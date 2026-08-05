import { asyncHandler } from '../utils/asyncHandler.js';
import { toFullUrl } from '../utils/imageUrl.js';
import studentFeeCollectionService from '../services/studentFeeCollection.service.js';

const searchStudents = asyncHandler(async (req, res) => {
  const { students } = await studentFeeCollectionService.searchStudents(req.query.q);

  const mapped = students.map((s) => ({
    ...s,
    studentImage: toFullUrl(req, s.studentImage),
  }));

  return res.status(200).json({
    success: true,
    message: 'Students fetched successfully',
    data: { students: mapped },
  });
});

const loadStudentFeeDetails = asyncHandler(async (req, res) => {
  const result = await studentFeeCollectionService.loadStudentFeeDetails(req.params.studentId);

  if (result.student.studentImage) {
    result.student.studentImage = toFullUrl(req, result.student.studentImage);
  }

  return res.status(200).json({
    success: true,
    message: 'Student fee details fetched successfully',
    data: result,
  });
});

const collectFee = asyncHandler(async (req, res) => {
  const collection = await studentFeeCollectionService.collectFee(req.body, req.user?._id);

  if (collection.studentId?.studentImage) {
    collection.studentId.studentImage = toFullUrl(req, collection.studentId.studentImage);
  }

  return res.status(201).json({
    success: true,
    message: 'Fee collected successfully',
    data: { collection },
  });
});

const getFeeCollections = asyncHandler(async (req, res) => {
  const result = await studentFeeCollectionService.getFeeCollections(req.query);

  const collections = result.collections.map((c) => {
    if (c.studentId?.studentImage) {
      c.studentId.studentImage = toFullUrl(req, c.studentId.studentImage);
    }
    return c;
  });

  return res.status(200).json({
    success: true,
    message: 'Fee collections fetched successfully',
    data: {
      collections,
      pagination: result.pagination,
      stats: result.stats,
    },
  });
});

const getFeeCollectionById = asyncHandler(async (req, res) => {
  const collection = await studentFeeCollectionService.getFeeCollectionById(req.params.id);

  if (collection.studentId?.studentImage) {
    collection.studentId.studentImage = toFullUrl(req, collection.studentId.studentImage);
  }

  return res.status(200).json({
    success: true,
    message: 'Fee collection fetched successfully',
    data: { collection },
  });
});

const updateFeeCollection = asyncHandler(async (req, res) => {
  const collection = await studentFeeCollectionService.updateFeeCollection(
    req.params.id,
    req.body,
    req.user?._id,
  );

  if (collection.studentId?.studentImage) {
    collection.studentId.studentImage = toFullUrl(req, collection.studentId.studentImage);
  }

  return res.status(200).json({
    success: true,
    message: 'Fee collection updated successfully',
    data: { collection },
  });
});

const deleteFeeCollection = asyncHandler(async (req, res) => {
  await studentFeeCollectionService.deleteFeeCollection(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Fee collection deleted successfully',
  });
});

export {
  searchStudents,
  loadStudentFeeDetails,
  collectFee,
  getFeeCollections,
  getFeeCollectionById,
  updateFeeCollection,
  deleteFeeCollection,
};
