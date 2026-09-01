import { actOnApprovalSchema } from '../../validators/lx/approvalSchema.js';
import { actOnApprovalService, getApprovalsService } from '../../services/lx/approvalService.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

export const getApprovalsController = async (req, res) => {
  try {
    const type = req.query.type || undefined;
    const result = await getApprovalsService({ type });
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'getApprovalsController', req, res);
  }
};

export const actOnApprovalController = async (req, res) => {
  try {
    const validated = actOnApprovalSchema.parse(req.body);
    const result = await actOnApprovalService({ ...validated, actor: req.actor });
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }
    return res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    handleControllerErrorResponse(error, 'actOnApprovalController', req, res);
  }
};
