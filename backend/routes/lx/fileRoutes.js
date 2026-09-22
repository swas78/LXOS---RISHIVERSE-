import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createFileController,
  deleteFileController,
  getAllFilesController,
  getFileByIdController,
  updateFileController,
} from '../../controllers/lx/fileController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';

const router = express.Router();
const logger = createContextLogger('fileRoutes');

router.use((req, res, next) => {
  logger.debug('LX file route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', requirePermission(PERMISSIONS.UPLOAD_FILE), createFileController);
router.get('/all', requirePermission(PERMISSIONS.VIEW_LX), getAllFilesController);
router.get('/:fileId', requirePermission(PERMISSIONS.VIEW_LX), getFileByIdController);
router.patch('/:fileId', requirePermission(PERMISSIONS.UPLOAD_FILE), updateFileController);
router.delete('/:fileId', requirePermission(PERMISSIONS.DELETE_FILE), deleteFileController);

export default router;
