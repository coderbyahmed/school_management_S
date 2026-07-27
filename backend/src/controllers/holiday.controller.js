import { asyncHandler } from '../utils/asyncHandler.js';
import holidayService from '../services/holiday.service.js';

const createHoliday = asyncHandler(async (req, res) => {
  const holiday = await holidayService.createHoliday(req.body, req.user?._id);

  return res.status(201).json({
    success: true,
    message: 'Holiday created successfully',
    data: { holiday },
  });
});

const getAllHolidays = asyncHandler(async (req, res) => {
  const result = await holidayService.getAllHolidays(req.query);

  return res.status(200).json({
    success: true,
    message: 'Holidays fetched successfully',
    data: result,
  });
});

const getHolidayById = asyncHandler(async (req, res) => {
  const holiday = await holidayService.getHolidayById(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Holiday fetched successfully',
    data: { holiday },
  });
});

const updateHoliday = asyncHandler(async (req, res) => {
  const holiday = await holidayService.updateHoliday(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    message: 'Holiday updated successfully',
    data: { holiday },
  });
});

const deleteHoliday = asyncHandler(async (req, res) => {
  await holidayService.deleteHoliday(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Holiday deleted successfully',
  });
});

export {
  createHoliday,
  getAllHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
};
