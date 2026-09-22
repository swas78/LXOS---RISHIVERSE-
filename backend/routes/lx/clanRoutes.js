import express from "express";
import createContextLogger from "../../logger/contextLogger.js";
import {
    createClanController,
    deleteClanController,
    getAllClansController,
    getClanByIdController,
    manageClanPointsController,
    updateClanController,
} from "../../controllers/lx/clanController.js";
import { requirePermission } from "../../middleware/lxRequirePermission.js";
import { PERMISSIONS } from "../../helper/lxPermissions.js";
import { validateBody, validateQuery } from "../../middleware/lxValidate.js";
import {
    createClanSchema,
    getAllClansSchema,
    manageClanPointsSchema,
    updateClanSchema,
} from "../../validations/lx/clan.validation.js";

const router = express.Router();
const logger = createContextLogger("clanRoutes");

router.use((req, res, next) => {
    logger.debug("LX clan route accessed", { method: req.method, path: req.path });
    next();
});

router.post(
    "/new",
    requirePermission(PERMISSIONS.MANAGE_CLANS),
    validateBody(createClanSchema),
    createClanController,
);
router.get(
    "/all",
    requirePermission(PERMISSIONS.VIEW_LX),
    validateQuery(getAllClansSchema),
    getAllClansController,
);
router.get("/:clanId", requirePermission(PERMISSIONS.VIEW_LX), getClanByIdController);
router.patch(
    "/:clanId",
    requirePermission(PERMISSIONS.MANAGE_CLANS),
    validateBody(updateClanSchema),
    updateClanController,
);
router.delete("/:clanId", requirePermission(PERMISSIONS.MANAGE_CLANS), deleteClanController);
router.post(
    "/:clanId/points",
    requirePermission(PERMISSIONS.ALLOCATE_CLAN_POINTS),
    validateBody(manageClanPointsSchema),
    manageClanPointsController,
);

export default router;
