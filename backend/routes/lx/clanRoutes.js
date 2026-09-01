import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createClanController,
  deleteClanController,
  getAllClansController,
  getClanByIdController,
  manageClanPointsController,
  updateClanController,
} from '../../controllers/lx/clanController.js';

const router = express.Router();
const logger = createContextLogger('clanRoutes');

router.use((req, res, next) => {
  logger.debug('LX clan route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', createClanController);
router.get('/all', getAllClansController);
router.get('/:clanId', getClanByIdController);
router.patch('/:clanId', updateClanController);
router.delete('/:clanId', deleteClanController);
router.post('/:clanId/points', manageClanPointsController);

export default router;
