import TimetableTemplate from '../models/timetableTemplate.model.js';
import { ApiError } from '../utils/apiError.js';

const createTemplate = async (data, userId) => {
  const { name, baseTemplate, isDefault, ...settings } = data;

  const existing = await TimetableTemplate.findOne({ name });

  if (existing) {
    throw new ApiError(409, 'A template with this name already exists');
  }

  if (isDefault) {
    await TimetableTemplate.updateMany({}, { isDefault: false });
  }

  try {
    const template = await TimetableTemplate.create({
      name,
      baseTemplate,
      ...settings,
      isDefault: isDefault || false,
      createdBy: userId,
    });

    return template;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'A template with this name already exists');
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }

    throw error;
  }
};

const getTemplates = async () => {
  const templates = await TimetableTemplate.find().sort({ createdAt: -1 }).lean();

  return templates;
};

const getTemplateById = async (id) => {
  const template = await TimetableTemplate.findById(id);

  if (!template) {
    throw new ApiError(404, 'Template not found');
  }

  return template;
};

const updateTemplate = async (id, data, userId) => {
  const existing = await TimetableTemplate.findById(id);

  if (!existing) {
    throw new ApiError(404, 'Template not found');
  }

  if (data.name) {
    const duplicate = await TimetableTemplate.findOne({
      _id: { $ne: id },
      name: data.name,
    });

    if (duplicate) {
      throw new ApiError(409, 'A template with this name already exists');
    }
  }

  if (data.isDefault) {
    await TimetableTemplate.updateMany({ _id: { $ne: id } }, { isDefault: false });
  }

  try {
    const updated = await TimetableTemplate.findByIdAndUpdate(
      id,
      { ...data, updatedBy: userId },
      { new: true, runValidators: true },
    );

    return updated;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'A template with this name already exists');
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      throw new ApiError(400, messages.join('. '));
    }

    throw error;
  }
};

const duplicateTemplate = async (id, userId) => {
  const original = await TimetableTemplate.findById(id);

  if (!original) {
    throw new ApiError(404, 'Template not found');
  }

  let copyName = `${original.name} Copy`;
  let counter = 2;
  while (await TimetableTemplate.findOne({ name: copyName })) {
    copyName = `${original.name} Copy ${counter}`;
    counter++;
  }

  const duplicate = await TimetableTemplate.create({
    name: copyName,
    baseTemplate: original.baseTemplate,
    headerSettings: original.headerSettings,
    tableHeaderSettings: original.tableHeaderSettings,
    periodCellSettings: original.periodCellSettings,
    breakCellSettings: original.breakCellSettings,
    rowSettings: original.rowSettings,
    layoutSettings: original.layoutSettings,
    mergeSettings: original.mergeSettings,
    printSettings: original.printSettings,
    isDefault: false,
    isFavorite: false,
    createdBy: userId,
  });

  return duplicate;
};

const deleteTemplate = async (id) => {
  const existing = await TimetableTemplate.findById(id);

  if (!existing) {
    throw new ApiError(404, 'Template not found');
  }

  if (existing.isDefault) {
    throw new ApiError(400, 'Default template cannot be deleted');
  }

  await TimetableTemplate.findByIdAndDelete(id);
};

export default {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  duplicateTemplate,
  deleteTemplate,
};
