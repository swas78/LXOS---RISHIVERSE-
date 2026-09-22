import express from "express";
import createContextLogger from "../../logger/contextLogger.js";
import {
    createReimbursementController,
    deleteReimbursementController,
    getAllReimbursementsController,
    getReimbursementByIdController,
    updateReimbursementController,
    reviewReimbursementController,
    processReimbursementController,
} from "../../controllers/lx/reimbursementController.js";
import { requirePermission } from "../../middleware/lxRequirePermission.js";
import { PERMISSIONS } from "../../helper/lxPermissions.js";
import { validateBody, validateQuery } from "../../middleware/lxValidate.js";
import {
    createReimbursementSchema,
    getAllReimbursementsSchema,
    processReimbursementSchema,
    reviewReimbursementSchema,
    updateReimbursementSchema,
} from "../../validations/lx/reimbursement.validation.js";

const router = express.Router();
const logger = createContextLogger("reimbursementRoutes");

router.use((req, res, next) => {
    logger.debug("LX reimbursement route accessed", { method: req.method, path: req.path });
    next();
});

router.post(
    "/new",
    requirePermission(PERMISSIONS.SUBMIT_REIMBURSEMENT),
    validateBody(createReimbursementSchema),
    createReimbursementController,
);
router.get(
    "/all",
    requirePermission(PERMISSIONS.VIEW_LX),
    validateQuery(getAllReimbursementsSchema),
    getAllReimbursementsController,
);
router.get(
    "/:reimbursementId",
    requirePermission(PERMISSIONS.VIEW_LX),
    getReimbursementByIdController,
);
router.patch(
    "/:reimbursementId",
    requirePermission(PERMISSIONS.SUBMIT_REIMBURSEMENT),
    validateBody(updateReimbursementSchema),
    updateReimbursementController,
);
router.delete(
    "/:reimbursementId",
    requirePermission(PERMISSIONS.SUBMIT_REIMBURSEMENT),
    deleteReimbursementController,
);

// Workflow actions.
// LX / Admin approve or reject a pending claim.
router.post(
    "/:reimbursementId/review",
    requirePermission(PERMISSIONS.REVIEW_REIMBURSEMENT),
    validateBody(reviewReimbursementSchema),
    reviewReimbursementController,
);
// Finance marks an approved claim as processed (paid out).
router.post(
    "/:reimbursementId/process",
    requirePermission(PERMISSIONS.PROCESS_REIMBURSEMENT),
    validateBody(processReimbursementSchema),
    processReimbursementController,
);

export default router;
