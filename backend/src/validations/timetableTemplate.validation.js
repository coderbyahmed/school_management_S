import { ApiError } from '../utils/apiError.js';

const validateCreateTemplate = (req, res, next) => {
  const { name, baseTemplate, isDefault } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Template name is required');
  }

  if (!baseTemplate || !baseTemplate.trim()) {
    throw new ApiError(400, 'Base template is required');
  }

  if (isDefault !== undefined && typeof isDefault !== 'boolean') {
    throw new ApiError(400, 'isDefault must be a boolean');
  }

  req.body.name = name.trim();
  req.body.baseTemplate = baseTemplate.trim();

  next();
};

const validateUpdateTemplate = (req, res, next) => {
  const { name, baseTemplate, isDefault } = req.body;

  if (!name && !baseTemplate && isDefault === undefined && Object.keys(req.body).length === 0) {
    throw new ApiError(400, 'At least one field must be provided for update');
  }

  if (name !== undefined) {
    if (!name.trim()) throw new ApiError(400, 'Template name cannot be empty');
    req.body.name = name.trim();
  }

  if (baseTemplate !== undefined) {
    if (!baseTemplate.trim()) throw new ApiError(400, 'Base template cannot be empty');
    req.body.baseTemplate = baseTemplate.trim();
  }

  if (isDefault !== undefined && typeof isDefault !== 'boolean') {
    throw new ApiError(400, 'isDefault must be a boolean');
  }

  next();
};

export { validateCreateTemplate, validateUpdateTemplate };
