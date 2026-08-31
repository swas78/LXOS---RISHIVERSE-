import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createAchievementController,
  deleteAchievementController,
  getAllAchievementsController,
  getAchievementByIdController,
  reviewAchievementController,
  updateAchievementController,
} from '../../controllers/lx/achievementController.js';

const router = express.Router();
const logger = createContextLogger('achievementRoutes');

router.use((req, res, next) => {
  logger.debug('LX achievement route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', createAchievementController);
router.get('/all', getAllAchievementsController);
router.get('/:achievementId', getAchievementByIdController);
router.patch('/:achievementId', updateAchievementController);
router.delete('/:achievementId', deleteAchievementController);
router.post('/:achievementId/review', reviewAchievementController);

export default router;
