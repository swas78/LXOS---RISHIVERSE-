import { actOnApprovalSchema } from '../../validators/lx/approvalSchema.js';
import { actOnApprovalService, getApprovalsService } from '../../services/lx/approvalService.js';
import { hasPermission, PERMISSIONS } from '../../helper/lxPermissions.js';
import { handleControllerErrorResponse } from '../../utils/responseUtils.js';

// The permission required to act on each approval type/action.
const permissionFor = (type, action) => {
  switch (type) {
    case 'EVENT':
      return PERMISSIONS.APPROVE_EVENT;
    case 'ACHIEVEMENT':
      return PERMISSIONS.APPROVE_ACHIEVEMENT;
    case 'PRODUCT':
      return PERMISSIONS.APPROVE_PRODUCT;
    case 'EXPENSE':
      return PERMISSIONS.APPROVE_EXPENSE;
    case 'REIMBURSEMENT':
      return action === 'process'
        ? PERMISSIONS.PROCESS_REIMBURSEMENT
        : PERMISSIONS.REVIEW_REIMBURSEMENT;
    default:
      return null;
  }
};

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

    // Enforce the correct permission for this approval type + action.
    const needed = permissionFor(validated.type, validated.action);
    if (!needed || !hasPermission(req.actor?.role, needed)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden — your role (${req.actor?.role ?? 'none'}) cannot ${validated.action} a ${validated.type.toLowerCase()}`,
      });
    }

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
