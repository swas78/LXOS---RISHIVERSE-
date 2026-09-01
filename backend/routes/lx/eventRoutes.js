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

const router = express.Router();
const logger = createContextLogger('eventRoutes');

router.use((req, res, next) => {
  logger.debug('LX event route accessed', { method: req.method, path: req.path });
  next();
});

// Static routes before parameterised ones.
router.post('/new', createEventController);
router.get('/all', getAllEventsController);
router.post('/availability', checkAvailabilityController);

router.post('/:eventId/approve', approveEventController);
router.post('/:eventId/complete', completeEventController);

router.get('/:eventId', getEventByIdController);
router.patch('/:eventId', updateEventController);
router.delete('/:eventId', deleteEventController);

export default router;
