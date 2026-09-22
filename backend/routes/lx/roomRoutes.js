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
import { validateBody, validateQuery } from '../../middleware/lxValidate.js';
import {
  createRoomSchema,
  getAllRoomsSchema,
  updateRoomSchema,
} from '../../validations/lx/room.validation.js';

const router = express.Router();
const logger = createContextLogger('roomRoutes');

router.use((req, res, next) => {
  logger.debug('LX room route accessed', { method: req.method, path: req.path });
  next();
});

// Managing rooms (create/edit/delete) is admin-only (MANAGE_ROOMS).
router.post('/new', requirePermission(PERMISSIONS.MANAGE_ROOMS), validateBody(createRoomSchema), createRoomController);
router.get('/all', requirePermission(PERMISSIONS.VIEW_LX), validateQuery(getAllRoomsSchema), getAllRoomsController);
router.get('/:roomId', requirePermission(PERMISSIONS.VIEW_LX), getRoomByIdController);
router.patch('/:roomId', requirePermission(PERMISSIONS.MANAGE_ROOMS), validateBody(updateRoomSchema), updateRoomController);
router.delete('/:roomId', requirePermission(PERMISSIONS.MANAGE_ROOMS), deleteRoomController);

export default router;
