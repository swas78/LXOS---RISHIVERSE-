import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createFileController,
  deleteFileController,
  getAllFilesController,
  getFileByIdController,
  updateFileController,
} from '../../controllers/lx/fileController.js';

const router = express.Router();
const logger = createContextLogger('fileRoutes');

router.use((req, res, next) => {
  logger.debug('LX file route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', createFileController);
router.get('/all', getAllFilesController);
router.get('/:fileId', getFileByIdController);
router.patch('/:fileId', updateFileController);
router.delete('/:fileId', deleteFileController);

export default router;
