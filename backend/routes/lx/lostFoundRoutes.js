import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createLostFoundController,
  deleteLostFoundController,
  getAllLostFoundController,
  getLostFoundByIdController,
  resolveLostFoundController,
  reviewLostFoundController,
  updateLostFoundController,
} from '../../controllers/lx/lostFoundController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';

const router = express.Router();
const logger = createContextLogger('lostFoundRoutes');

router.use((req, res, next) => {
  logger.debug('LX lost-found route accessed', { method: req.method, path: req.path });
  next();
});

// Anyone may report and browse. WHICH rows a read returns is a row-level
// question — pending posts are invisible to everyone but their author and the
// reviewers — so it is answered in the service, not by this middleware.
router.get('/all', requirePermission(PERMISSIONS.REPORT_LOST_FOUND), getAllLostFoundController);
router.post('/new', requirePermission(PERMISSIONS.REPORT_LOST_FOUND), createLostFoundController);
router.get('/:itemId', requirePermission(PERMISSIONS.REPORT_LOST_FOUND), getLostFoundByIdController);

// Author-or-reviewer; the ownership half is enforced in the service.
router.patch('/:itemId', requirePermission(PERMISSIONS.REPORT_LOST_FOUND), updateLostFoundController);
router.delete('/:itemId', requirePermission(PERMISSIONS.REPORT_LOST_FOUND), deleteLostFoundController);
router.post('/:itemId/resolve', requirePermission(PERMISSIONS.REPORT_LOST_FOUND), resolveLostFoundController);

// The approval gate itself.
router.post('/:itemId/review', requirePermission(PERMISSIONS.APPROVE_LOST_FOUND), reviewLostFoundController);

export default router;
