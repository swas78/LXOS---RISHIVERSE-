import { getAnalyticsService } from '../../services/lx/analyticsService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const getAnalyticsController = async (req, res) => {
  try {
    const result = await getAnalyticsService();
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getAnalyticsController', req, res);
  }
};
