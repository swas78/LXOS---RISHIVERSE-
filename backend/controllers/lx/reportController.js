import { rolloverSchema } from '../../validators/lx/reportSchema.js';
import {
  getReportService,
  getSemestersService,
  rolloverSemesterService,
} from '../../services/lx/reportService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const getReportController = async (req, res) => {
  try {
    const semester = req.query.semester || undefined;
    const result = await getReportService(semester);
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getReportController', req, res);
  }
};

export const getSemestersController = async (req, res) => {
  try {
    const result = await getSemestersService();
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getSemestersController', req, res);
  }
};

export const rolloverController = async (req, res) => {
  try {
    const validated = rolloverSchema.parse(req.body);
    const result = await rolloverSemesterService(validated);
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'rolloverController', req, res);
  }
};
