// DEV UPLOAD SHIM routes — deleted at handoff. Core serves the real
// equivalents at /api/v1/upload/*. See services/lx/uploadService.js.
import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createPresignedUrlController,
  getObjectController,
  putObjectController,
} from '../../controllers/lx/uploadController.js';

const router = express.Router();
const logger = createContextLogger('uploadRoutes');

router.use((req, _res, next) => {
  logger.debug('LX upload route accessed', { method: req.method, path: req.path });
  next();
});

// Mirrors core: POST /api/v1/upload/presigned-url
router.post('/presigned-url', createPresignedUrlController);

// Stands in for S3 itself. `express.raw` because the client PUTs the file body
// directly with its own Content-Type — exactly as it would to a signed S3 URL.
// The limit matches core's documented 10 MB image cap.
router.put(
  '/object/:key',
  express.raw({ type: '*/*', limit: '10mb' }),
  putObjectController,
);

// Stands in for core's s3UrlMiddleware signed GET.
router.get('/object/:key', getObjectController);

export default router;
