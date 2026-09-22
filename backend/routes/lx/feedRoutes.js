import express from "express";
import { getFeedController } from "../../controllers/lx/feedController.js";
import { requirePermission } from "../../middleware/lxRequirePermission.js";
import { PERMISSIONS } from "../../helper/lxPermissions.js";

const router = express.Router();

router.get("/all", requirePermission(PERMISSIONS.VIEW_LX), getFeedController);

export default router;
