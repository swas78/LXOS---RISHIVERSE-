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

router.get('/', getAccessController);
router.get('/all', getAccessController);
router.post('/assign', assignAccessController);
router.post('/remove', removeAccessController);

export default router;
