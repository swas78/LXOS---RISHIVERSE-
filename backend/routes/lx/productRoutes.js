import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  reviewProductController,
  updateProductController,
} from '../../controllers/lx/productController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';

const router = express.Router();
const logger = createContextLogger('productRoutes');

router.use((req, res, next) => {
  logger.debug('LX product route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', requirePermission(PERMISSIONS.SUBMIT_PRODUCT), createProductController);
router.get('/all', requirePermission(PERMISSIONS.VIEW_LX), getAllProductsController);
router.get('/:productId', requirePermission(PERMISSIONS.VIEW_LX), getProductByIdController);
router.patch('/:productId', requirePermission(PERMISSIONS.SUBMIT_PRODUCT), updateProductController);
router.delete('/:productId', requirePermission(PERMISSIONS.SUBMIT_PRODUCT), deleteProductController);
router.post('/:productId/review', requirePermission(PERMISSIONS.APPROVE_PRODUCT), reviewProductController);

export default router;
