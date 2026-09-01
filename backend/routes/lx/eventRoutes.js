import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  approveEventController,
  checkAvailabilityController,
  completeEventController,
  createEventController,
  deleteEventController,
  getAllEventsController,
  getEventByIdController,
  updateEventController,
} from '../../controllers/lx/eventController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';

const router = express.Router();
const logger = createContextLogger('eventRoutes');

router.use((req, res, next) => {
  logger.debug('LX event route accessed', { method: req.method, path: req.path });
  next();
});

// Static routes before parameterised ones.
router.post('/new', requirePermission(PERMISSIONS.CREATE_EVENT), createEventController);
router.get('/all', getAllEventsController);
router.post('/availability', checkAvailabilityController);

router.post('/:eventId/approve', requirePermission(PERMISSIONS.APPROVE_EVENT), approveEventController);
router.post('/:eventId/complete', requirePermission(PERMISSIONS.APPROVE_EVENT), completeEventController);

router.get('/:eventId', getEventByIdController);
router.patch('/:eventId', updateEventController);
router.delete('/:eventId', requirePermission(PERMISSIONS.DELETE_EVENT), deleteEventController);

export default router;
