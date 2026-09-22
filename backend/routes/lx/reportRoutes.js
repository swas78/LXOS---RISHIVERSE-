import express from 'express';
import {
  getReportController,
  getReportCsvController,
  getSemestersController,
  rolloverController,
} from '../../controllers/lx/reportController.js';
import { requirePermission } from '../../middleware/lxRequirePermission.js';
import { PERMISSIONS } from '../../helper/lxPermissions.js';
import { validateBody } from '../../middleware/lxValidate.js';
import {
  rolloverSchema,
} from '../../validations/lx/report.validation.js';

const router = express.Router();

// Report + past-semester data — ADMIN / LX / FINANCE.
router.get('/all', requirePermission(PERMISSIONS.GENERATE_REPORT), getReportController);
router.get('/csv', requirePermission(PERMISSIONS.GENERATE_REPORT), getReportCsvController);
router.get('/semesters', requirePermission(PERMISSIONS.GENERATE_REPORT), getSemestersController);
// Semester rollover — ADMIN / LX only.
router.post('/rollover', requirePermission(PERMISSIONS.MANAGE_SEMESTER), validateBody(rolloverSchema), rolloverController);

export default router;
