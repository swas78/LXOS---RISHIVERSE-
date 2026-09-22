import express from "express";
import createContextLogger from "../../logger/contextLogger.js";
import {
    createInitiativeController,
    deleteInitiativeController,
    getAllInitiativesController,
    getInitiativeByIdController,
    updateInitiativeController,
} from "../../controllers/lx/initiativeController.js";
import { requirePermission } from "../../middleware/lxRequirePermission.js";
import { PERMISSIONS } from "../../helper/lxPermissions.js";
import { validateBody, validateQuery } from "../../middleware/lxValidate.js";
import {
    createInitiativeSchema,
    getAllInitiativesSchema,
    updateInitiativeSchema,
} from "../../validations/lx/initiative.validation.js";

const router = express.Router();
const logger = createContextLogger("initiativeRoutes");

router.use((req, res, next) => {
    logger.debug("LX initiative route accessed", { method: req.method, path: req.path });
    next();
});

// Reads are open — the clan project board is visible campus-wide.
// Writes need MANAGE_CLAN_INITIATIVES (ADMIN, LX_TEAM, CLAN_HEAD). That verb
// check is necessary but NOT sufficient: it lets a clan head write *an*
// initiative, not one belonging to *another* clan. Which clan they may touch is
// a row-level question, enforced in the service via assertClanWrite().
router.post(
    "/new",
    requirePermission(PERMISSIONS.MANAGE_CLAN_INITIATIVES),
    validateBody(createInitiativeSchema),
    createInitiativeController,
);
router.get(
    "/all",
    requirePermission(PERMISSIONS.VIEW_LX),
    validateQuery(getAllInitiativesSchema),
    getAllInitiativesController,
);
router.get("/:initiativeId", requirePermission(PERMISSIONS.VIEW_LX), getInitiativeByIdController);
router.patch(
    "/:initiativeId",
    requirePermission(PERMISSIONS.MANAGE_CLAN_INITIATIVES),
    validateBody(updateInitiativeSchema),
    updateInitiativeController,
);
router.delete(
    "/:initiativeId",
    requirePermission(PERMISSIONS.MANAGE_CLAN_INITIATIVES),
    deleteInitiativeController,
);

export default router;
