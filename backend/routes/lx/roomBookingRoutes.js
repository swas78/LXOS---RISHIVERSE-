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
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';
import { validateBody, validateQuery } from '../../middleware/lxValidate.js';
import {
  createRoomBookingSchema,
  getAllRoomBookingsSchema,
  reviewRoomBookingSchema,
  roomBookingAvailabilitySchema,
} from '../../validations/lx/roomBooking.validation.js';

const router = express.Router();
const logger = createContextLogger('roomBookingRoutes');

router.use((req, res, next) => {
  logger.debug('LX room-booking route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/availability', requirePermission(PERMISSIONS.VIEW_LX), validateBody(roomBookingAvailabilitySchema), checkRoomAvailabilityController);
// Only clubs/clans (and admin/LX) can request a room booking.
router.post('/new', requirePermission(PERMISSIONS.BOOK_ROOM), validateBody(createRoomBookingSchema), createRoomBookingController);
router.get('/all', requirePermission(PERMISSIONS.VIEW_LX), validateQuery(getAllRoomBookingsSchema), getAllRoomBookingsController);
router.get('/:bookingId', requirePermission(PERMISSIONS.VIEW_LX), getRoomBookingByIdController);
// Only admins / LX can approve or reject bookings.
router.post('/:bookingId/review', requirePermission(PERMISSIONS.APPROVE_BOOKING), validateBody(reviewRoomBookingSchema), reviewRoomBookingController);
router.post('/:bookingId/cancel', requirePermission(PERMISSIONS.BOOK_ROOM), cancelRoomBookingController);
router.delete('/:bookingId', requirePermission(PERMISSIONS.MANAGE_ROOMS), deleteRoomBookingController);

export default router;
