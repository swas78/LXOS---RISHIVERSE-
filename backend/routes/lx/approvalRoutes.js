import express from 'express';
import {
  actOnApprovalController,
  getApprovalsController,
} from '../../controllers/lx/approvalController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';

const router = express.Router();

// The approvals queue is for reviewers (ADMIN/LX/FINANCE). The /act handler
// then checks the specific permission for each approval type.
router.get('/all', requirePermission(PERMISSIONS.VIEW_APPROVALS), getApprovalsController);
router.post('/act', requirePermission(PERMISSIONS.VIEW_APPROVALS), actOnApprovalController);

export default router;
