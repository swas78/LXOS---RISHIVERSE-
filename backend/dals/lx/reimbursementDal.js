import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";

const logger = createContextLogger("reimbursementDal");

export const createReimbursementDal = async (payload) => {
    try {
        const {
            title,
            description,
            amount,
            expenseDate,
            category,
            eventId,
            eventTitle,
            purpose,
            clubId,
            clubName,
            clanId,
            clanName,
            bills,
            notes,
            payoutRef,
            submittedByRef,
            submittedByName,
        } = payload;

        return await prisma.lxReimbursement.create({
            data: {
                title,
                ...(description !== undefined ? { description } : {}),
                amount,
                expenseDate,
                category,
                eventId: eventId ?? null,
                eventTitle: eventTitle ?? null,
                ...(purpose !== undefined ? { purpose } : {}),
                clubId: clubId ?? null,
                clubName: clubName ?? null,
                clanId: clanId ?? null,
                clanName: clanName ?? null,
                bills: bills ?? [],
                notes: notes ?? null,
                payoutRef: payoutRef ?? null,
                submittedByRef,
                submittedByName,
            },
        });
    } catch (error) {
        logger.error("Error in createReimbursementDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const getReimbursementByIdDal = async (reimbursementId) => {
    try {
        return await prisma.lxReimbursement.findFirst({
            where: { id: reimbursementId, deletedAt: null },
        });
    } catch (error) {
        logger.error("Error in getReimbursementByIdDal", {
            error: { message: error.message, stack: error.stack },
            reimbursementId,
        });
        throw error;
    }
};

export const getAllReimbursementsDal = async ({
    search,
    status,
    category,
    submittedByRef,
    page,
    limit,
    sortBy,
    sortOrder,
}) => {
    try {
        const where = {
            deletedAt: null,
            ...(Array.isArray(status) && status.length > 0 ? { status: { in: status } } : {}),
            ...(Array.isArray(category) && category.length > 0
                ? { category: { in: category } }
                : {}),
            ...(submittedByRef ? { submittedByRef } : {}),
            ...(search
                ? {
                      OR: [
                          { title: { contains: search, mode: "insensitive" } },
                          { purpose: { contains: search, mode: "insensitive" } },
                      ],
                  }
                : {}),
        };

        const normalizedSortOrder =
            String(sortOrder || "desc").toLowerCase() === "asc" ? "asc" : "desc";
        const skip = (page - 1) * limit;

        const [reimbursements, total] = await Promise.all([
            prisma.lxReimbursement.findMany({
                where,
                orderBy: { [sortBy]: normalizedSortOrder },
                skip,
                take: limit,
            }),
            prisma.lxReimbursement.count({ where }),
        ]);

        return {
            page,
            limit,
            totalCount: total,
            totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
            totalPages: Math.ceil(total / limit),
            data: reimbursements,
        };
    } catch (error) {
        logger.error("Error in getAllReimbursementsDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export const updateReimbursementDal = async (reimbursementId, data) => {
    try {
        return await prisma.lxReimbursement.update({
            where: { id: reimbursementId },
            data,
        });
    } catch (error) {
        logger.error("Error in updateReimbursementDal", {
            error: { message: error.message, stack: error.stack },
            reimbursementId,
        });
        throw error;
    }
};

export const deleteReimbursementDal = async (reimbursementId) => {
    try {
        return await prisma.lxReimbursement.update({
            where: { id: reimbursementId },
            data: { deletedAt: new Date() },
        });
    } catch (error) {
        logger.error("Error in deleteReimbursementDal", {
            error: { message: error.message, stack: error.stack },
            reimbursementId,
        });
        throw error;
    }
};

// Increment a club's budgetSpent (used when an approved claim is charged to a club).
export const incrementClubBudgetSpentDal = async (clubId, amount) => {
    try {
        return await prisma.lxClub.update({
            where: { id: clubId },
            data: { budgetSpent: { increment: amount } },
        });
    } catch (error) {
        logger.error("Error in incrementClubBudgetSpentDal", {
            error: { message: error.message, stack: error.stack },
            clubId,
        });
        throw error;
    }
};

// Increment a clan's budgetSpent (used when an approved claim is charged to a clan).
export const incrementClanBudgetSpentDal = async (clanId, amount) => {
    try {
        return await prisma.lxClan.update({
            where: { id: clanId },
            data: { budgetSpent: { increment: amount } },
        });
    } catch (error) {
        logger.error("Error in incrementClanBudgetSpentDal", {
            error: { message: error.message, stack: error.stack },
            clanId,
        });
        throw error;
    }
};
