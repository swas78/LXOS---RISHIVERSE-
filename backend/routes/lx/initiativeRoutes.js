import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createInitiativeController,
  deleteInitiativeController,
  getAllInitiativesController,
  getInitiativeByIdController,
  updateInitiativeController,
} from '../../controllers/lx/initiativeController.js';

const router = express.Router();
const logger = createContextLogger('initiativeRoutes');

router.use((req, res, next) => {
  logger.debug('LX initiative route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', createInitiativeController);
router.get('/all', getAllInitiativesController);
router.get('/:initiativeId', getInitiativeByIdController);
router.patch('/:initiativeId', updateInitiativeController);
router.delete('/:initiativeId', deleteInitiativeController);

export default router;
