import { ZodError } from "zod";
import createContextLogger from "../logger/contextLogger.js";

const logger = createContextLogger("responseUtils");

export const handleControllerErrorResponse = (error, controllerName, req, res) => {
    if (error instanceof ZodError || error?.name === "ZodError") {
        logger.warn(`Validation failed in ${controllerName}`, {
            errors: error.issues ?? error.errors,
            ip: req.ip,
        });

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.issues ?? error.errors,
        });
    }

    logger.error(`Error in ${controllerName}`, {
        error: { message: error.message, stack: error.stack },
        ip: req.ip,
    });

    // Prisma's own error codes are CLIENT errors, not server faults. Without
    // this they surface as a 500 carrying the raw driver message — which both
    // misreports whose fault it is and leaks table and constraint names to the
    // caller. Real foreign keys made P2003 reachable, so it is mapped here once
    // rather than in twenty controllers.
    const PRISMA_ERRORS = {
        // Referenced row does not exist — e.g. an expense naming a missing event.
        P2003: { statusCode: 400, message: "A referenced record does not exist." },
        // Unique constraint — e.g. a duplicate cabin code or a claimed slot.
        P2002: { statusCode: 409, message: "That value is already taken." },
        // Update or delete targeted a row that is not there.
        P2025: { statusCode: 404, message: "Record not found." },
        // Value too long for the column.
        P2000: { statusCode: 400, message: "A value is too long for its field." },
    };

    const mapped = PRISMA_ERRORS[error?.code];
    if (mapped) {
        return res.status(mapped.statusCode).json({
            success: false,
            message: mapped.message,
            code: error.code,
        });
    }

    const statusCode =
        Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode <= 599
            ? error.statusCode
            : 500;

    return res.status(statusCode).json({
        success: false,
        // A genuine 500 must not hand the caller a driver message or a stack.
        message: statusCode === 500 ? "Internal Server Error" : error.message,
        ...(error.code ? { code: error.code } : {}),
    });
};
