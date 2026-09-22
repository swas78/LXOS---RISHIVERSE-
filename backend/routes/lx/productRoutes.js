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
import { validateBody, validateQuery } from '../../middleware/lxValidate.js';
import {
  createProductSchema,
  getAllProductsSchema,
  reviewProductSchema,
  updateProductSchema,
} from '../../validations/lx/product.validation.js';

const router = express.Router();
const logger = createContextLogger('productRoutes');

router.use((req, res, next) => {
  logger.debug('LX product route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', requirePermission(PERMISSIONS.SUBMIT_PRODUCT), validateBody(createProductSchema), createProductController);
router.get('/all', requirePermission(PERMISSIONS.VIEW_LX), validateQuery(getAllProductsSchema), getAllProductsController);
router.get('/:productId', requirePermission(PERMISSIONS.VIEW_LX), getProductByIdController);
router.patch('/:productId', requirePermission(PERMISSIONS.SUBMIT_PRODUCT), validateBody(updateProductSchema), updateProductController);
router.delete('/:productId', requirePermission(PERMISSIONS.SUBMIT_PRODUCT), deleteProductController);
router.post('/:productId/review', requirePermission(PERMISSIONS.APPROVE_PRODUCT), validateBody(reviewProductSchema), reviewProductController);

export default router;
