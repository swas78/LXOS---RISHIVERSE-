import createContextLogger from "../../logger/contextLogger.js";
import { sumMoney, toMoney } from "../../helper/lxMoney.js";
import { getBudgetDataDal } from "../../dals/lx/budgetDal.js";
import { budgetScope } from "../../helper/lxPermissions.js";

const logger = createContextLogger("budgetService");

// Budgets arrive as Prisma Decimals. Convert once, here, so everything below
// this line is plain numbers — a Decimal in `s + c.budgetAllocated` would
// concatenate rather than add, and the totals would come out as strings.
const withDerived = (entity) => {
    const allocated = toMoney(entity.budgetAllocated);
    const spent = toMoney(entity.budgetSpent);
    return {
        ...entity,
        budgetAllocated: allocated,
        budgetSpent: spent,
        budgetRemaining: toMoney(allocated - spent),
        utilization: allocated > 0 ? Math.round((spent / allocated) * 100) : 0,
    };
};

export const getBudgetSummaryService = async (actor) => {
    try {
        const scope = budgetScope(actor);
        const { clubs, clans, approvedExpenseAgg, processedReimbAgg } =
            await getBudgetDataDal(scope);

        const clubRows = clubs.map(withDerived);
        const clanRows = clans.map(withDerived);

        const totalAllocated = sumMoney([...clubRows, ...clanRows].map((r) => r.budgetAllocated));
        const totalSpent = sumMoney([...clubRows, ...clanRows].map((r) => r.budgetSpent));

        return {
            success: true,
            message: "Budget summary fetched successfully",
            statusCode: 200,
            data: {
                totals: {
                    totalAllocated,
                    totalSpent,
                    totalRemaining: toMoney(totalAllocated - totalSpent),
                    approvedExpenses: toMoney(approvedExpenseAgg._sum.amount),
                    approvedExpenseCount: approvedExpenseAgg._count || 0,
                    processedReimbursements: toMoney(processedReimbAgg._sum.amount),
                    processedReimbursementCount: processedReimbAgg._count || 0,
                    utilization:
                        totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0,
                },
                clubs: clubRows,
                clans: clanRows,
                scoped: !scope.all,
                scopeRole: actor?.role ?? null,
            },
        };
    } catch (error) {
        logger.error("Error in getBudgetSummaryService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};
