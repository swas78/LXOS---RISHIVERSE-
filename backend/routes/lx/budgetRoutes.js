import express from 'express';
import { getBudgetSummaryController } from '../../controllers/lx/budgetController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';

const router = express.Router();

router.get('/summary', requirePermission(PERMISSIONS.VIEW_LX), getBudgetSummaryController);

export default router;
