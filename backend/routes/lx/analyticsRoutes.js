import express from "express";
import { getAnalyticsController } from "../../controllers/lx/analyticsController.js";
import { requirePermission } from "../../middleware/lxRequirePermission.js";
import { PERMISSIONS } from "../../helper/lxPermissions.js";

const router = express.Router();

router.get("/all", requirePermission(PERMISSIONS.VIEW_ANALYTICS), getAnalyticsController);

export default router;
