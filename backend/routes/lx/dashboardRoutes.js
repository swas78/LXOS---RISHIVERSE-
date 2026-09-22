import express from "express";
import { getDashboardStatsController } from "../../controllers/lx/dashboardController.js";
import { requirePermission } from "../../middleware/lxRequirePermission.js";
import { PERMISSIONS } from "../../helper/lxPermissions.js";

const router = express.Router();

router.get("/stats", requirePermission(PERMISSIONS.VIEW_LX), getDashboardStatsController);

export default router;
