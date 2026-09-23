import createContextLogger from "../../logger/contextLogger.js";
import { toMoney } from "../../helper/lxMoney.js";
import { reimbursementScope } from "../../helper/lxPermissions.js";
import { PAYOUT_REF_PREFIX } from "../../constants/lxReimbursementConstant.js";
import { objectExists, withResolvedUrls } from "./uploadService.js";
import {
    createReimbursementDal,
    deleteReimbursementDal,
    getAllReimbursementsDal,
    getReimbursementByIdDal,
    updateReimbursementDal,
    incrementClubBudgetSpentDal,
    incrementClanBudgetSpentDal,
} from "../../dals/lx/reimbursementDal.js";

const logger = createContextLogger("reimbursementService");

// Stored bills are `s3:<bucket>:<key>` pointers; a browser needs a URL. Read
// URLs are signed per request and never persisted, so they are attached on the
// way out only.
// `amount` is numeric(12,2) and arrives as a Decimal; convert here, where every
// reimbursement leaving this service passes through.
const withBillUrls = (reimbursement) =>
    reimbursement && {
        ...reimbursement,
        amount: toMoney(reimbursement.amount),
        bills: withResolvedUrls(reimbursement.bills),
    };

// NOTE: nothing here logs `payload`. A claim body carries amounts and a
// payoutRef that identifies a person — log ids and errors, never the body.

export const createReimbursementService = async (payload, actor) => {
    try {
        // upload.md: "treat confirm as untrusted". A client can POST any string, so
        // every pointer is checked against the bucket before it reaches a row.
        for (const bill of payload.bills ?? []) {
            if (!(await objectExists(bill.s3Path))) {
                return {
                    success: false,
                    message: `Attachment ${bill.fileName} was not uploaded successfully`,
                    statusCode: 400,
                };
            }
        }

        // D3: LXOS records WHO to pay and core resolves the account from that. With
        // no referenceId there is no profile to resolve against — mirror the 422
        // production returns when `Student.bank*` is empty.
        const referenceId = actor?.referenceId;
        if (!referenceId) {
            return {
                success: false,
                message: "Bank details missing on student profile",
                statusCode: 422,
            };
        }

        const reimbursement = await createReimbursementDal({
            ...payload,
            payoutRef: `${PAYOUT_REF_PREFIX}${referenceId}`,
        });
        if (!reimbursement) {
            return { success: false, message: "Unable to create reimbursement", statusCode: 400 };
        }
        return {
            success: true,
            message: "Reimbursement submitted successfully",
            statusCode: 201,
            data: withBillUrls(reimbursement),
        };
    } catch (error) {
        logger.error("Error in createReimbursementService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const getReimbursementByIdService = async (reimbursementId) => {
    try {
        const reimbursement = await getReimbursementByIdDal(reimbursementId);
        if (!reimbursement) {
            return { success: false, message: "Reimbursement not found", statusCode: 404 };
        }
        return {
            success: true,
            message: "Reimbursement found",
            statusCode: 200,
            data: withBillUrls(reimbursement),
        };
    } catch (error) {
        logger.error("Error in getReimbursementByIdService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const getAllReimbursementsService = async (query, actor) => {
    try {
        // Reviewers (ADMIN/LX/FINANCE) see all; everyone else sees only their own.
        const scope = reimbursementScope(actor);
        const result = await getAllReimbursementsDal({ ...query, ...scope });
        if (!result) {
            return { success: false, message: "Unable to list reimbursements", statusCode: 400 };
        }
        return {
            success: true,
            message: "Reimbursements fetched successfully",
            statusCode: 200,
            data: result.data.map(withBillUrls),
            pagination: {
                page: result.page,
                limit: result.limit,
                totalCount: result.totalCount,
                totalPages: result.totalPages,
                totalPages: result.totalPages,
            },
        };
    } catch (error) {
        logger.error("Error in getAllReimbursementsService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const updateReimbursementService = async (reimbursementId, payload) => {
    try {
        const existing = await getReimbursementByIdDal(reimbursementId);
        if (!existing) {
            return { success: false, message: "Reimbursement not found", statusCode: 404 };
        }

        // Same untrusted-confirm rule as create: a replaced bill list can smuggle in
        // pointers that were never uploaded.
        for (const bill of payload.bills ?? []) {
            if (!(await objectExists(bill.s3Path))) {
                return {
                    success: false,
                    message: `Attachment ${bill.fileName} was not uploaded successfully`,
                    statusCode: 400,
                };
            }
        }

        const reimbursement = await updateReimbursementDal(reimbursementId, payload);
        if (!reimbursement) {
            return { success: false, message: "Unable to update reimbursement", statusCode: 400 };
        }
        return {
            success: true,
            message: "Reimbursement updated successfully",
            statusCode: 200,
            data: withBillUrls(reimbursement),
        };
    } catch (error) {
        logger.error("Error in updateReimbursementService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const deleteReimbursementService = async (reimbursementId) => {
    try {
        const existing = await getReimbursementByIdDal(reimbursementId);
        if (!existing) {
            return { success: false, message: "Reimbursement not found", statusCode: 404 };
        }
        const reimbursement = await deleteReimbursementDal(reimbursementId);
        if (!reimbursement) {
            return { success: false, message: "Unable to delete reimbursement", statusCode: 400 };
        }
        return {
            success: true,
            message: "Reimbursement deleted successfully",
            statusCode: 200,
            data: withBillUrls(reimbursement),
        };
    } catch (error) {
        logger.error("Error in deleteReimbursementService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// Review workflow (LX / Admin): approve or reject a PENDING claim.
// On approve, if the claim is charged to a club or clan and its budget has not
// yet been deducted, increment that club/clan's budgetSpent by the claim amount.
export const reviewReimbursementService = async (
    reimbursementId,
    { action, rejectionReason, actor },
) => {
    try {
        const existing = await getReimbursementByIdDal(reimbursementId);
        if (!existing) {
            return { success: false, message: "Reimbursement not found", statusCode: 404 };
        }

        const reviewedByRef = actor?.referenceId ?? "unknown";
        const reviewedByName = actor?.displayName ?? null;

        if (action === "reject") {
            const reimbursement = await updateReimbursementDal(reimbursementId, {
                status: "REJECTED",
                reviewedByRef,
                reviewedByName,
                reviewedAt: new Date(),
                rejectionReason: rejectionReason ?? null,
            });
            return {
                success: true,
                message: "Reimbursement rejected",
                statusCode: 200,
                data: withBillUrls(reimbursement),
            };
        }

        // action === 'approve'
        const shouldDeductBudget = !existing.budgetDeducted && (existing.clubId || existing.clanId);

        if (shouldDeductBudget) {
            if (existing.clubId) {
                await incrementClubBudgetSpentDal(existing.clubId, existing.amount);
            } else if (existing.clanId) {
                await incrementClanBudgetSpentDal(existing.clanId, existing.amount);
            }
        }

        const reimbursement = await updateReimbursementDal(reimbursementId, {
            status: "APPROVED",
            reviewedByRef,
            reviewedByName,
            reviewedAt: new Date(),
            ...(shouldDeductBudget ? { budgetDeducted: true } : {}),
        });

        return {
            success: true,
            message: "Reimbursement approved",
            statusCode: 200,
            data: withBillUrls(reimbursement),
        };
    } catch (error) {
        logger.error("Error in reviewReimbursementService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// Process workflow (Finance): mark an APPROVED claim as PROCESSED (paid out).
// `payoutTxnRef` is the bank/UPI reference for the transfer that just happened;
// `payoutRef` (who was paid) was fixed at submit time and stays untouched.
export const processReimbursementService = async (reimbursementId, actor, payoutTxnRef) => {
    try {
        const existing = await getReimbursementByIdDal(reimbursementId);
        if (!existing) {
            return { success: false, message: "Reimbursement not found", statusCode: 404 };
        }
        if (existing.status !== "APPROVED") {
            return {
                success: false,
                message: "Reimbursement must be APPROVED before it can be processed",
                statusCode: 400,
            };
        }

        const reimbursement = await updateReimbursementDal(reimbursementId, {
            status: "PROCESSED",
            processedByRef: actor?.referenceId ?? "unknown",
            processedByName: actor?.displayName ?? null,
            processedAt: new Date(),
            ...(payoutTxnRef ? { payoutTxnRef } : {}),
        });

        return {
            success: true,
            message: "Reimbursement processed",
            statusCode: 200,
            data: withBillUrls(reimbursement),
        };
    } catch (error) {
        logger.error("Error in processReimbursementService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};
