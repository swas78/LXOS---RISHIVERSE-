import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createRoomController,
  deleteRoomController,
  getAllRoomsController,
  getRoomByIdController,
  updateRoomController,
} from '../../controllers/lx/roomController.js';

const router = express.Router();
const logger = createContextLogger('roomRoutes');

router.use((req, res, next) => {
  logger.debug('LX room route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', createRoomController);
router.get('/all', getAllRoomsController);
router.get('/:roomId', getRoomByIdController);
router.patch('/:roomId', updateRoomController);
router.delete('/:roomId', deleteRoomController);

export default router;
