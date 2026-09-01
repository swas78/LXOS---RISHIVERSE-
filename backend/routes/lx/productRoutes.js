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

const router = express.Router();
const logger = createContextLogger('productRoutes');

router.use((req, res, next) => {
  logger.debug('LX product route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', createProductController);
router.get('/all', getAllProductsController);
router.get('/:productId', getProductByIdController);
router.patch('/:productId', updateProductController);
router.delete('/:productId', deleteProductController);
router.post('/:productId/review', reviewProductController);

export default router;
