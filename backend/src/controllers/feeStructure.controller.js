import { asyncHandler } from '../utils/asyncHandler.js';
import feeStructureService from '../services/feeStructure.service.js';

const createFeeStructure = asyncHandler(async (req, res) => {
  const structure = await feeStructureService.createFeeStructure(req.body, req.user?._id);

  return res.status(201).json({
    success: true,
    message: 'Fee structure created successfully',
    data: { structure },
  });
});

const getAllFeeStructures = asyncHandler(async (req, res) => {
  const result = await feeStructureService.getAllFeeStructures(req.query);

  return res.status(200).json({
    success: true,
    message: 'Fee structures fetched successfully',
    data: result,
  });
});

const getFeeStructureById = asyncHandler(async (req, res) => {
  const structure = await feeStructureService.getFeeStructureById(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Fee structure fetched successfully',
    data: { structure },
  });
});

const updateFeeStructure = asyncHandler(async (req, res) => {
  const structure = await feeStructureService.updateFeeStructure(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    message: 'Fee structure updated successfully',
    data: { structure },
  });
});

const deleteFeeStructure = asyncHandler(async (req, res) => {
  await feeStructureService.deleteFeeStructure(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Fee structure deleted successfully',
  });
});

export {
  createFeeStructure,
  getAllFeeStructures,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
};
