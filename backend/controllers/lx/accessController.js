import { assignAccessSchema, removeAccessSchema } from '../../validators/lx/accessSchema.js';
import {
  assignAccessService,
  getAccessOverviewService,
  removeAccessService,
} from '../../services/lx/accessService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const getAccessController = async (req, res) => {
  try {
    const result = await getAccessOverviewService();
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getAccessController', req, res);
  }
};

export const assignAccessController = async (req, res) => {
  try {
    const validated = assignAccessSchema.parse(req.body);
    const result = await assignAccessService(validated);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'assignAccessController', req, res);
  }
};

export const removeAccessController = async (req, res) => {
  try {
    const validated = removeAccessSchema.parse(req.body);
    const result = await removeAccessService(validated);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'removeAccessController', req, res);
  }
};
