import express from 'express';
import {
  actOnApprovalController,
  getApprovalsController,
} from '../../controllers/lx/approvalController.js';

const router = express.Router();

router.get('/all', getApprovalsController);
router.post('/act', actOnApprovalController);

export default router;
