import { getDashboardStatsService } from '../../services/lx/dashboardService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const getDashboardStatsController = async (req, res) => {
  try {
    const result = await getDashboardStatsService(req.actor);
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getDashboardStatsController', req, res);
  }
};
