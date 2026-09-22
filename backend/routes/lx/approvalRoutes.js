import express from 'express';
import {
  actOnApprovalController,
  getApprovalsController,
} from '../../controllers/lx/approvalController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';
import { validateBody } from '../../middleware/lxValidate.js';
import {
  actOnApprovalSchema,
} from '../../validations/lx/approval.validation.js';

const router = express.Router();

// The approvals queue is for reviewers (ADMIN/LX/FINANCE). The /act handler
// then checks the specific permission for each approval type.
router.get('/all', requirePermission(PERMISSIONS.VIEW_APPROVALS), getApprovalsController);
router.post('/act', requirePermission(PERMISSIONS.VIEW_APPROVALS), validateBody(actOnApprovalSchema), actOnApprovalController);

export default router;
