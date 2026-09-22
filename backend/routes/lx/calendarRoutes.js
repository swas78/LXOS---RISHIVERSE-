import express from "express";
import { getCalendarController } from "../../controllers/lx/calendarController.js";
import { requirePermission } from "../../middleware/lxRequirePermission.js";
import { PERMISSIONS } from "../../helper/lxPermissions.js";

const router = express.Router();

router.get("/all", requirePermission(PERMISSIONS.VIEW_LX), getCalendarController);

export default router;
