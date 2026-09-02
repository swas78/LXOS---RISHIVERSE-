import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createRoomController,
  deleteRoomController,
  getAllRoomsController,
  getRoomByIdController,
  updateRoomController,
} from '../../controllers/lx/roomController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';

const router = express.Router();
const logger = createContextLogger('roomRoutes');

router.use((req, res, next) => {
  logger.debug('LX room route accessed', { method: req.method, path: req.path });
  next();
});

// Managing rooms (create/edit/delete) is admin-only (MANAGE_ROOMS).
router.post('/new', requirePermission(PERMISSIONS.MANAGE_ROOMS), createRoomController);
router.get('/all', getAllRoomsController);
router.get('/:roomId', getRoomByIdController);
router.patch('/:roomId', requirePermission(PERMISSIONS.MANAGE_ROOMS), updateRoomController);
router.delete('/:roomId', requirePermission(PERMISSIONS.MANAGE_ROOMS), deleteRoomController);

export default router;
