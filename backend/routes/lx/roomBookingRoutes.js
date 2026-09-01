import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  cancelRoomBookingController,
  checkRoomAvailabilityController,
  createRoomBookingController,
  deleteRoomBookingController,
  getAllRoomBookingsController,
  getRoomBookingByIdController,
  reviewRoomBookingController,
} from '../../controllers/lx/roomBookingController.js';

const router = express.Router();
const logger = createContextLogger('roomBookingRoutes');

router.use((req, res, next) => {
  logger.debug('LX room-booking route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/availability', checkRoomAvailabilityController);
router.post('/new', createRoomBookingController);
router.get('/all', getAllRoomBookingsController);
router.get('/:bookingId', getRoomBookingByIdController);
router.post('/:bookingId/review', reviewRoomBookingController);
router.post('/:bookingId/cancel', cancelRoomBookingController);
router.delete('/:bookingId', deleteRoomBookingController);

export default router;
