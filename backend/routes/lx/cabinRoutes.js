import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  actOnCabinBookingController,
  createBlockController,
  createCabinBookingController,
  createCabinController,
  getCabinBoardController,
  getDeskBoardController,
  liftBlockController,
  listBlocksController,
  listCabinBookingsController,
  listCabinsController,
  removeCabinController,
  searchDirectoryController,
  updateCabinController,
} from '../../controllers/lx/cabinController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';

const router = express.Router();
const logger = createContextLogger('cabinRoutes');

router.use((req, res, next) => {
  logger.debug('LX cabin route accessed', { method: req.method, path: req.path });
  next();
});

// ---- Everyone -------------------------------------------------------------
// Booking a study cabin is a campus-wide service, not a club perk, so every
// role holds BOOK_CABIN. The rules that actually restrict a person — the daily
// cap, blocks, the same-day window — are state, not role, and live in the
// service's eligibility check.

router.get('/board', requirePermission(PERMISSIONS.BOOK_CABIN), getCabinBoardController);
router.get('/directory', requirePermission(PERMISSIONS.BOOK_CABIN), searchDirectoryController);
router.get('/booking/all', requirePermission(PERMISSIONS.BOOK_CABIN), listCabinBookingsController);
router.post('/booking/new', requirePermission(PERMISSIONS.BOOK_CABIN), createCabinBookingController);

// check-in / check-out / cancel are allowed for the booking's owner OR the
// desk; `no-show` is desk-only. That split is row-level (whose booking is it?),
// so it is enforced in the service, not here.
router.patch('/booking/:bookingId', requirePermission(PERMISSIONS.BOOK_CABIN), actOnCabinBookingController);

// ---- Library desk ---------------------------------------------------------

router.get('/desk/board', requirePermission(PERMISSIONS.MANAGE_LIBRARY_CABINS), getDeskBoardController);

router.get('/all', requirePermission(PERMISSIONS.MANAGE_LIBRARY_CABINS), listCabinsController);
router.post('/new', requirePermission(PERMISSIONS.MANAGE_LIBRARY_CABINS), createCabinController);
router.patch('/:cabinId', requirePermission(PERMISSIONS.MANAGE_LIBRARY_CABINS), updateCabinController);
router.delete('/:cabinId', requirePermission(PERMISSIONS.MANAGE_LIBRARY_CABINS), removeCabinController);

router.get('/block/all', requirePermission(PERMISSIONS.MANAGE_LIBRARY_CABINS), listBlocksController);
router.post('/block/new', requirePermission(PERMISSIONS.MANAGE_LIBRARY_CABINS), createBlockController);
router.patch('/block/:blockId/lift', requirePermission(PERMISSIONS.MANAGE_LIBRARY_CABINS), liftBlockController);

export default router;
