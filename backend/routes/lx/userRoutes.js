// DEV-ONLY routes — role/user switcher + current actor. Not part of handoff.
import express from "express";
import { getAllUsersController, getMeController } from "../../controllers/lx/userController.js";
import { requirePermission } from "../../middleware/lxRequirePermission.js";
import { PERMISSIONS } from "../../helper/lxPermissions.js";

const router = express.Router();

router.get("/all", requirePermission(PERMISSIONS.VIEW_LX), getAllUsersController);
router.get("/me", requirePermission(PERMISSIONS.VIEW_LX), getMeController);

export default router;
