import express from 'express';
import createContextLogger from '../../logger/contextLogger.js';
import {
  createReimbursementController,
  deleteReimbursementController,
  getAllReimbursementsController,
  getReimbursementByIdController,
  updateReimbursementController,
  reviewReimbursementController,
  processReimbursementController,
} from '../../controllers/lx/reimbursementController.js';

const router = express.Router();
const logger = createContextLogger('reimbursementRoutes');

router.use((req, res, next) => {
  logger.debug('LX reimbursement route accessed', { method: req.method, path: req.path });
  next();
});

router.post('/new', createReimbursementController);
router.get('/all', getAllReimbursementsController);
router.get('/:reimbursementId', getReimbursementByIdController);
router.patch('/:reimbursementId', updateReimbursementController);
router.delete('/:reimbursementId', deleteReimbursementController);

// Workflow actions.
// LX / Admin approve or reject a pending claim.
router.post('/:reimbursementId/review', reviewReimbursementController);
// Finance marks an approved claim as processed (paid out).
router.post('/:reimbursementId/process', processReimbursementController);

export default router;
