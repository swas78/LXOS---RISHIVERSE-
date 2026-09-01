import createContextLogger from '../../logger/contextLogger.js';
import {
  actOnAchievementDal,
  actOnEventDal,
  actOnExpenseDal,
  actOnProductDal,
  actOnReimbursementDal,
  getPendingApprovalsDal,
} from '../../dals/lx/approvalDal.js';

const logger = createContextLogger('approvalService');

const inr = (n) => n;

// Normalize each pending row into a unified approval item.
const mapEvent = (e) => ({
  id: e.id,
  type: 'EVENT',
  title: e.title,
  subtitle: e.type + (e.clubName ? ` · ${e.clubName}` : e.clanName ? ` · ${e.clanName}` : ''),
  requestedBy: e.createdByName,
  date: e.createdAt,
  amount: e.budgetAllocated,
  status: e.status,
  raw: e,
});
const mapAchievement = (a) => ({
  id: a.id,
  type: 'ACHIEVEMENT',
  title: a.title,
  subtitle: (a.clubName || a.clanName || 'Personal') + ` · ${a.category}`,
  requestedBy: a.createdByName,
  date: a.createdAt,
  amount: null,
  status: a.status,
  raw: a,
});
const mapReimbursement = (r) => ({
  id: r.id,
  type: 'REIMBURSEMENT',
  title: r.title,
  subtitle: (r.purpose || r.eventTitle || r.clubName || 'Reimbursement') + ` · ${r.category}`,
  requestedBy: r.submittedByName,
  date: r.createdAt,
  amount: inr(r.amount),
  // A PENDING claim needs LX review; APPROVED needs Finance processing.
  status: r.status,
  stage: r.status === 'APPROVED' ? 'FINANCE' : 'LX',
  raw: r,
});
const mapProduct = (p) => ({
  id: p.id,
  type: 'PRODUCT',
  title: p.title,
  subtitle: `${p.category}${p.tagline ? ` · ${p.tagline}` : ''}`,
  requestedBy: p.createdByName,
  date: p.createdAt,
  amount: null,
  status: p.status,
  raw: p,
});
const mapExpense = (x) => ({
  id: x.id,
  type: 'EXPENSE',
  title: x.title,
  subtitle: (x.eventTitle || 'Event expense') + ` · ${x.category}`,
  requestedBy: x.submittedByName,
  date: x.createdAt,
  amount: inr(x.amount),
  status: x.status,
  raw: x,
});

export const getApprovalsService = async (query = {}) => {
  try {
    const { events, achievements, reimbursements, expenses, products } =
      await getPendingApprovalsDal();
    let items = [
      ...events.map(mapEvent),
      ...achievements.map(mapAchievement),
      ...reimbursements.map(mapReimbursement),
      ...expenses.map(mapExpense),
      ...products.map(mapProduct),
    ];
    if (query.type) items = items.filter((i) => i.type === query.type);
    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      success: true,
      message: 'Approvals fetched successfully',
      statusCode: 200,
      data: items,
      meta: {
        counts: {
          EVENT: events.length,
          ACHIEVEMENT: achievements.length,
          REIMBURSEMENT: reimbursements.length,
          EXPENSE: expenses.length,
          PRODUCT: products.length,
          total: items.length,
        },
      },
    };
  } catch (error) {
    logger.error('Error in getApprovalsService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const actOnApprovalService = async ({ type, id, action, rejectionReason, actor }) => {
  try {
    let result;
    switch (type) {
      case 'EVENT':
        result = await actOnEventDal(id, action, actor, rejectionReason);
        break;
      case 'ACHIEVEMENT':
        result = await actOnAchievementDal(id, action, actor, rejectionReason);
        break;
      case 'REIMBURSEMENT':
        result = await actOnReimbursementDal(id, action, actor, rejectionReason);
        break;
      case 'EXPENSE':
        result = await actOnExpenseDal(id, action, actor, rejectionReason);
        break;
      case 'PRODUCT':
        result = await actOnProductDal(id, action, actor, rejectionReason);
        break;
      default:
        return { success: false, message: `Unknown approval type: ${type}`, statusCode: 400 };
    }
    if (result === null) {
      return { success: false, message: `${type} not found`, statusCode: 404 };
    }
    if (result && result.error) {
      return { success: false, message: result.error, statusCode: 400 };
    }
    return {
      success: true,
      message: `${type} ${action}d successfully`,
      statusCode: 200,
      data: result,
    };
  } catch (error) {
    logger.error('Error in actOnApprovalService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
