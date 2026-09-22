import express from "express";
import createContextLogger from "../../logger/contextLogger.js";
import {
    approveEventController,
    checkAvailabilityController,
    completeEventController,
    createEventController,
    deleteEventController,
    getAllEventsController,
    getEventByIdController,
    updateEventController,
} from "../../controllers/lx/eventController.js";
import { requirePermission } from "../../middleware/lxRequirePermission.js";
import { PERMISSIONS } from "../../helper/lxPermissions.js";
import { validateBody, validateQuery } from "../../middleware/lxValidate.js";
import {
    approveEventSchema,
    availabilitySchema,
    createEventSchema,
    getAllEventsSchema,
    updateEventSchema,
} from "../../validations/lx/event.validation.js";

const router = express.Router();
const logger = createContextLogger("eventRoutes");

router.use((req, res, next) => {
    logger.debug("LX event route accessed", { method: req.method, path: req.path });
    next();
});

// Static routes before parameterised ones.
router.post(
    "/new",
    requirePermission(PERMISSIONS.CREATE_EVENT),
    validateBody(createEventSchema),
    createEventController,
);
router.get(
    "/all",
    requirePermission(PERMISSIONS.VIEW_LX),
    validateQuery(getAllEventsSchema),
    getAllEventsController,
);
router.post(
    "/availability",
    requirePermission(PERMISSIONS.VIEW_LX),
    validateBody(availabilitySchema),
    checkAvailabilityController,
);

router.post(
    "/:eventId/approve",
    requirePermission(PERMISSIONS.APPROVE_EVENT),
    validateBody(approveEventSchema),
    approveEventController,
);
router.post(
    "/:eventId/complete",
    requirePermission(PERMISSIONS.APPROVE_EVENT),
    completeEventController,
);

router.get("/:eventId", requirePermission(PERMISSIONS.VIEW_LX), getEventByIdController);
router.patch(
    "/:eventId",
    requirePermission(PERMISSIONS.EDIT_EVENT),
    validateBody(updateEventSchema),
    updateEventController,
);
router.delete("/:eventId", requirePermission(PERMISSIONS.DELETE_EVENT), deleteEventController);

export default router;
