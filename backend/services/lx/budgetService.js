import createContextLogger from '../../logger/contextLogger.js';
import { getBudgetDataDal } from '../../dals/lx/budgetDal.js';
import { budgetScope } from '../../helper/lxPermissions.js';

const logger = createContextLogger('budgetService');

const withDerived = (entity) => {
  const remaining = entity.budgetAllocated - entity.budgetSpent;
  const utilization =
    entity.budgetAllocated > 0
      ? Math.round((entity.budgetSpent / entity.budgetAllocated) * 100)
      : 0;
  return { ...entity, budgetRemaining: remaining, utilization };
};

export const getBudgetSummaryService = async (actor) => {
  try {
    const scope = budgetScope(actor);
    const { clubs, clans, approvedExpenseAgg, processedReimbAgg } = await getBudgetDataDal(scope);

    const clubRows = clubs.map(withDerived);
    const clanRows = clans.map(withDerived);

    const totalAllocated =
      clubRows.reduce((s, c) => s + c.budgetAllocated, 0) +
      clanRows.reduce((s, c) => s + c.budgetAllocated, 0);
    const totalSpent =
      clubRows.reduce((s, c) => s + c.budgetSpent, 0) +
      clanRows.reduce((s, c) => s + c.budgetSpent, 0);

    return {
      success: true,
      message: 'Budget summary fetched successfully',
      statusCode: 200,
      data: {
        totals: {
          totalAllocated,
          totalSpent,
          totalRemaining: totalAllocated - totalSpent,
          approvedExpenses: approvedExpenseAgg._sum.amount || 0,
          approvedExpenseCount: approvedExpenseAgg._count || 0,
          processedReimbursements: processedReimbAgg._sum.amount || 0,
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
    logger.error('Error in getBudgetSummaryService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
