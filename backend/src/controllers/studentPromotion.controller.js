import { asyncHandler } from '../utils/asyncHandler.js';
import studentPromotionService from '../services/studentPromotion.service.js';

const filterStudentsForPromotion = asyncHandler(async (req, res) => {
  const students = await studentPromotionService.filterStudentsForPromotion(req.query);

  return res.status(200).json({
    success: true,
    message: 'Students fetched for promotion',
    data: { students },
  });
});

const promoteStudents = asyncHandler(async (req, res) => {
  const { studentIds, fromClass, toClass, fromAcademicYear, toAcademicYear, remarks } = req.body;

  const result = await studentPromotionService.promoteStudents(
    studentIds,
    fromClass,
    toClass,
    fromAcademicYear,
    toAcademicYear,
    remarks,
    req.user._id,
    req.user.fullName,
  );

  return res.status(200).json({
    success: true,
    message: 'Students promoted successfully',
    updatedCount: result.updatedCount,
  });
});

const getPromotionHistory = asyncHandler(async (req, res) => {
  const data = await studentPromotionService.getPromotionHistory(req.query);

  return res.status(200).json({
    success: true,
    message: 'Promotion history fetched successfully',
    data,
  });
});

const getStudentPromotions = asyncHandler(async (req, res) => {
  const data = await studentPromotionService.getStudentPromotions(req.query);

  return res.status(200).json({
    success: true,
    message: 'Student promotions fetched successfully',
    data,
  });
});

const deleteStudentPromotion = asyncHandler(async (req, res) => {
  await studentPromotionService.deleteStudentPromotion(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Promotion history deleted successfully',
  });
});

export { filterStudentsForPromotion, promoteStudents, getPromotionHistory, getStudentPromotions, deleteStudentPromotion };
