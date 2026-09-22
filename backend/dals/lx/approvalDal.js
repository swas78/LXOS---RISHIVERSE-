import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";

const logger = createContextLogger("approvalDal");

// Fetch everything currently awaiting a decision across the platform.
export const getPendingApprovalsDal = async () => {
    try {
        const [events, achievements, reimbursements, expenses, products, bookings, lostFound] =
            await Promise.all([
                prisma.lxEvent.findMany({
                    where: { deletedAt: null, status: "PENDING" },
                    orderBy: { createdAt: "desc" },
                }),
                prisma.lxAchievement.findMany({
                    where: { deletedAt: null, status: "PENDING" },
                    orderBy: { createdAt: "desc" },
                }),
                // PENDING → needs LX/Admin review; APPROVED → needs Finance processing.
                prisma.lxReimbursement.findMany({
                    where: { deletedAt: null, status: { in: ["PENDING", "APPROVED"] } },
                    orderBy: { createdAt: "desc" },
                }),
                prisma.lxExpense.findMany({
                    where: { deletedAt: null, status: "PENDING" },
                    orderBy: { createdAt: "desc" },
                }),
                prisma.lxProduct.findMany({
                    where: { deletedAt: null, status: "PENDING" },
                    orderBy: { createdAt: "desc" },
                }),
                prisma.lxRoomBooking.findMany({
                    where: { deletedAt: null, status: "PENDING" },
                    orderBy: { createdAt: "desc" },
                }),
                prisma.lxLostFoundItem.findMany({
                    where: { deletedAt: null, status: "PENDING" },
                    orderBy: { createdAt: "desc" },
                }),
            ]);
        return { events, achievements, reimbursements, expenses, products, bookings, lostFound };
    } catch (error) {
        logger.error("Error in getPendingApprovalsDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// --- State transitions (self-contained; mirror the per-module services) ---

export const actOnEventDal = async (id, action, actor, rejectionReason) => {
    const existing = await prisma.lxEvent.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return null;
    const data =
        action === "approve"
            ? {
                  status: "APPROVED",
                  approvedByRef: actor.referenceId,
                  approvedByName: actor.displayName,
                  approvedAt: new Date(),
              }
            : { status: "REJECTED", rejectionReason: rejectionReason || "Rejected" };
    return prisma.lxEvent.update({ where: { id }, data });
};

export const actOnAchievementDal = async (id, action, actor, rejectionReason) => {
    const existing = await prisma.lxAchievement.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return null;
    const data =
        action === "approve"
            ? {
                  status: "APPROVED",
                  approvedByRef: actor.referenceId,
                  approvedByName: actor.displayName,
                  approvedAt: new Date(),
              }
            : { status: "REJECTED", rejectionReason: rejectionReason || "Rejected" };
    return prisma.lxAchievement.update({ where: { id }, data });
};

export const actOnReimbursementDal = async (id, action, actor, rejectionReason) => {
    const existing = await prisma.lxReimbursement.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return null;

    if (action === "reject") {
        return prisma.lxReimbursement.update({
            where: { id },
            data: { status: "REJECTED", rejectionReason: rejectionReason || "Rejected" },
        });
    }
    if (action === "process") {
        if (existing.status !== "APPROVED")
            return { error: "Only APPROVED claims can be processed" };
        return prisma.lxReimbursement.update({
            where: { id },
            data: {
                status: "PROCESSED",
                processedByRef: actor.referenceId,
                processedByName: actor.displayName,
                processedAt: new Date(),
            },
        });
    }
    // approve
    const updated = await prisma.lxReimbursement.update({
        where: { id },
        data: {
            status: "APPROVED",
            reviewedByRef: actor.referenceId,
            reviewedByName: actor.displayName,
            reviewedAt: new Date(),
        },
    });
    // Deduct from club/clan budget once.
    if (!existing.budgetDeducted) {
        if (existing.clubId) {
            await prisma.lxClub.update({
                where: { id: existing.clubId },
                data: { budgetSpent: { increment: existing.amount } },
            });
        } else if (existing.clanId) {
            await prisma.lxClan.update({
                where: { id: existing.clanId },
                data: { budgetSpent: { increment: existing.amount } },
            });
        }
        await prisma.lxReimbursement.update({ where: { id }, data: { budgetDeducted: true } });
    }
    return updated;
};

export const actOnBookingDal = async (id, action, actor, rejectionReason) => {
    const existing = await prisma.lxRoomBooking.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return null;
    if (action === "approve") {
        // Reject if another APPROVED booking already overlaps this room+time.
        const clash = await prisma.lxRoomBooking.findFirst({
            where: {
                deletedAt: null,
                roomId: existing.roomId,
                status: "APPROVED",
                id: { not: existing.id },
                startTime: { lt: existing.endTime },
                endTime: { gt: existing.startTime },
            },
        });
        if (clash) return { error: "The room is already booked for this time" };
    }
    const data =
        action === "approve"
            ? {
                  status: "APPROVED",
                  approvedByRef: actor.referenceId,
                  approvedByName: actor.displayName,
                  approvedAt: new Date(),
                  rejectionReason: null,
              }
            : { status: "REJECTED", rejectionReason: rejectionReason || "Rejected" };
    return prisma.lxRoomBooking.update({ where: { id }, data });
};

export const actOnProductDal = async (id, action, actor, rejectionReason) => {
    const existing = await prisma.lxProduct.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return null;
    const data =
        action === "approve"
            ? {
                  status: "APPROVED",
                  approvedByRef: actor.referenceId,
                  approvedByName: actor.displayName,
                  approvedAt: new Date(),
                  rejectionReason: null,
              }
            : { status: "REJECTED", rejectionReason: rejectionReason || "Rejected" };
    return prisma.lxProduct.update({ where: { id }, data });
};

export const actOnExpenseDal = async (id, action, actor, rejectionReason) => {
    const existing = await prisma.lxExpense.findFirst({ where: { id, deletedAt: null } });
    if (!existing) return null;
    if (action === "reject") {
        return prisma.lxExpense.update({
            where: { id },
            data: { status: "REJECTED", rejectionReason: rejectionReason || "Rejected" },
        });
    }
    const updated = await prisma.lxExpense.update({
        where: { id },
        data: {
            status: "APPROVED",
            verifiedByRef: actor.referenceId,
            verifiedByName: actor.displayName,
            verifiedAt: new Date(),
        },
    });
    if (!existing.budgetApplied && existing.eventId) {
        await prisma.lxEvent.update({
            where: { id: existing.eventId },
            data: { budgetSpent: { increment: existing.amount } },
        });
        await prisma.lxExpense.update({ where: { id }, data: { budgetApplied: true } });
    }
    return updated;
};
