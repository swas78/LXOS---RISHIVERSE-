import createContextLogger from "../../logger/contextLogger.js";
import prisma from "../../services/prismaClient.js";

const logger = createContextLogger("budgetDal");

// scope = { all: boolean, clubIds: string[]|null, clanIds: string[]|null }
export const getBudgetDataDal = async (scope = { all: true }) => {
    try {
        const clubWhere = { deletedAt: null };
        const clanWhere = { deletedAt: null };
        if (!scope.all) {
            clubWhere.id = { in: scope.clubIds ?? [] };
            clanWhere.id = { in: scope.clanIds ?? [] };
        }

        const [clubs, clans, approvedExpenseAgg, processedReimbAgg] = await Promise.all([
            prisma.lxClub.findMany({
                where: clubWhere,
                select: {
                    id: true,
                    name: true,
                    category: true,
                    budgetAllocated: true,
                    budgetSpent: true,
                },
                orderBy: { name: "asc" },
            }),
            prisma.lxClan.findMany({
                where: clanWhere,
                select: {
                    id: true,
                    name: true,
                    color: true,
                    budgetAllocated: true,
                    budgetSpent: true,
                    points: true,
                },
                orderBy: { points: "desc" },
            }),
            // Institution-wide expense/reimbursement totals only make sense for
            // finance viewers; scoped users get zeros.
            scope.all
                ? prisma.lxExpense.aggregate({
                      where: { deletedAt: null, status: "APPROVED" },
                      _sum: { amount: true },
                      _count: true,
                  })
                : Promise.resolve({ _sum: { amount: 0 }, _count: 0 }),
            scope.all
                ? prisma.lxReimbursement.aggregate({
                      where: { deletedAt: null, status: "PROCESSED" },
                      _sum: { amount: true },
                      _count: true,
                  })
                : Promise.resolve({ _sum: { amount: 0 }, _count: 0 }),
        ]);
        return { clubs, clans, approvedExpenseAgg, processedReimbAgg };
    } catch (error) {
        logger.error("Error in getBudgetDataDal", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};
