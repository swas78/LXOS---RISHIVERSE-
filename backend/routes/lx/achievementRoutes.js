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
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';
import { validateBody, validateQuery } from '../../middleware/lxValidate.js';
import {
  createAchievementSchema,
  getAllAchievementsSchema,
  reviewAchievementSchema,
  updateAchievementSchema,
} from '../../validations/lx/achievement.validation.js';

const router = express.Router();
const logger = createContextLogger('achievementRoutes');

router.use((req, res, next) => {
  logger.debug('LX achievement route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', requirePermission(PERMISSIONS.CREATE_ACHIEVEMENT), validateBody(createAchievementSchema), createAchievementController);
router.get('/all', requirePermission(PERMISSIONS.VIEW_LX), validateQuery(getAllAchievementsSchema), getAllAchievementsController);
router.get('/:achievementId', requirePermission(PERMISSIONS.VIEW_LX), getAchievementByIdController);
router.patch('/:achievementId', requirePermission(PERMISSIONS.CREATE_ACHIEVEMENT), validateBody(updateAchievementSchema), updateAchievementController);
router.delete('/:achievementId', requirePermission(PERMISSIONS.CREATE_ACHIEVEMENT), deleteAchievementController);
router.post('/:achievementId/review', requirePermission(PERMISSIONS.APPROVE_ACHIEVEMENT), validateBody(reviewAchievementSchema), reviewAchievementController);

export default router;
