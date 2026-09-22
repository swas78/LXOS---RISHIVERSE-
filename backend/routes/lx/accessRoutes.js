import express from 'express';
import {
  assignAccessController,
  getAccessController,
  removeAccessController,
} from '../../controllers/lx/accessController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';

const router = express.Router();

// Access management is admin-only (MANAGE_ACCESS → ADMIN).
router.use(requirePermission(PERMISSIONS.MANAGE_ACCESS));

router.get('/', requirePermission(PERMISSIONS.VIEW_LX), getAccessController);
router.get('/all', requirePermission(PERMISSIONS.VIEW_LX), getAccessController);
router.post('/assign', requirePermission(PERMISSIONS.MANAGE_ACCESS), assignAccessController);
router.post('/remove', requirePermission(PERMISSIONS.MANAGE_ACCESS), removeAccessController);

export default router;
