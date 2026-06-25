import { asyncHandler } from '../utils/asyncHandler.js';
import timetableTemplateService from '../services/timetableTemplate.service.js';

const createTemplate = asyncHandler(async (req, res) => {
  const template = await timetableTemplateService.createTemplate(req.body, req.user?._id);

  return res.status(201).json({
    success: true,
    message: 'Template created successfully',
    data: { template },
  });
});

const getTemplates = asyncHandler(async (req, res) => {
  const templates = await timetableTemplateService.getTemplates();

  return res.status(200).json({
    success: true,
    message: 'Templates fetched successfully',
    data: { templates },
  });
});

const getTemplateById = asyncHandler(async (req, res) => {
  const template = await timetableTemplateService.getTemplateById(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Template fetched successfully',
    data: { template },
  });
});

const updateTemplate = asyncHandler(async (req, res) => {
  const template = await timetableTemplateService.updateTemplate(req.params.id, req.body, req.user?._id);

  return res.status(200).json({
    success: true,
    message: 'Template updated successfully',
    data: { template },
  });
});

const duplicateTemplate = asyncHandler(async (req, res) => {
  const template = await timetableTemplateService.duplicateTemplate(req.params.id, req.user?._id);

  return res.status(201).json({
    success: true,
    message: 'Template duplicated successfully',
    data: { template },
  });
});

const deleteTemplate = asyncHandler(async (req, res) => {
  await timetableTemplateService.deleteTemplate(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Template deleted successfully',
  });
});

export {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  duplicateTemplate,
  deleteTemplate,
};
