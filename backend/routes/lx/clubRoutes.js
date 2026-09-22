import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createClubController,
  deleteClubController,
  getAllClubsController,
  getClubByIdController,
  updateClubController,
} from '../../controllers/lx/clubController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';
import { validateBody, validateQuery } from '../../middleware/lxValidate.js';
import {
  createClubSchema,
  getAllClubsSchema,
  updateClubSchema,
} from '../../validations/lx/club.validation.js';

const router = express.Router();
const logger = createContextLogger('clubRoutes');

router.use((req, res, next) => {
  logger.debug('LX club route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', requirePermission(PERMISSIONS.MANAGE_CLUBS), validateBody(createClubSchema), createClubController);
router.get('/all', requirePermission(PERMISSIONS.VIEW_LX), validateQuery(getAllClubsSchema), getAllClubsController);
router.get('/:clubId', requirePermission(PERMISSIONS.VIEW_LX), getClubByIdController);
router.patch('/:clubId', requirePermission(PERMISSIONS.MANAGE_CLUBS), validateBody(updateClubSchema), updateClubController);
router.delete('/:clubId', requirePermission(PERMISSIONS.MANAGE_CLUBS), deleteClubController);

export default router;
