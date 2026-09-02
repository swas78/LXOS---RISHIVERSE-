import { getBudgetSummaryService } from '../../services/lx/budgetService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const getBudgetSummaryController = async (req, res) => {
  try {
    const result = await getBudgetSummaryService(req.actor);
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getBudgetSummaryController', req, res);
  }
};
