import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createClanController,
  deleteClanController,
  getAllClansController,
  getClanByIdController,
  manageClanPointsController,
  updateClanController,
} from '../../controllers/lx/clanController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';

const router = express.Router();
const logger = createContextLogger('clanRoutes');

router.use((req, res, next) => {
  logger.debug('LX clan route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', requirePermission(PERMISSIONS.MANAGE_CLANS), createClanController);
router.get('/all', getAllClansController);
router.get('/:clanId', getClanByIdController);
router.patch('/:clanId', requirePermission(PERMISSIONS.MANAGE_CLANS), updateClanController);
router.delete('/:clanId', requirePermission(PERMISSIONS.MANAGE_CLANS), deleteClanController);
router.post('/:clanId/points', requirePermission(PERMISSIONS.ALLOCATE_CLAN_POINTS), manageClanPointsController);

export default router;
