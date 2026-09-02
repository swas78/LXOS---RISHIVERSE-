import express from 'express';
import {
  getReportController,
  getReportCsvController,
  getSemestersController,
  rolloverController,
} from '../../controllers/lx/reportController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';

const router = express.Router();

// Report + past-semester data — ADMIN / LX / FINANCE.
router.get('/all', requirePermission(PERMISSIONS.GENERATE_REPORT), getReportController);
router.get('/csv', requirePermission(PERMISSIONS.GENERATE_REPORT), getReportCsvController);
router.get('/semesters', requirePermission(PERMISSIONS.GENERATE_REPORT), getSemestersController);
// Semester rollover — ADMIN / LX only.
router.post('/rollover', requirePermission(PERMISSIONS.MANAGE_SEMESTER), rolloverController);

export default router;
