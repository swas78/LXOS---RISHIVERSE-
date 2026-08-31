import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createClubController,
  deleteClubController,
  getAllClubsController,
  getClubByIdController,
  updateClubController,
} from '../../controllers/lx/clubController.js';

const router = express.Router();
const logger = createContextLogger('clubRoutes');

router.use((req, res, next) => {
  logger.debug('LX club route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', createClubController);
router.get('/all', getAllClubsController);
router.get('/:clubId', getClubByIdController);
router.patch('/:clubId', updateClubController);
router.delete('/:clubId', deleteClubController);

export default router;
