import { getFeedService } from '../../services/lx/feedService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const getFeedController = async (req, res) => {
  try {
    const kind = req.query.kind || undefined; // ACHIEVEMENT | UPDATE | undefined(all)
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const result = await getFeedService({ kind, page, limit });
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getFeedController', req, res);
  }
};
