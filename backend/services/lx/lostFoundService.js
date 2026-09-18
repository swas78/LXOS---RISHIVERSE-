// ---------------------------------------------------------------------------
// LX Lost & Found — reporting, review and resolution.
//
// The whole module turns on one rule: nothing is public until an admin says so.
// That rule is enforced HERE, in `lostFoundVisibility`, and every read path
// goes through it — the list, the detail endpoint and the counts. A client
// cannot widen it by passing a different `status` filter, because its own
// filters are ANDed with the visibility fragment rather than replacing it.
// ---------------------------------------------------------------------------
import createContextLogger from '../../logger/contextLogger.js';
import { PERMISSIONS, hasPermission } from '../../helper/lxPermissions.js';
import {
  actOnLostFoundDal,
  countLostFoundByStatusDal,
  createLostFoundDal,
  getAllLostFoundDal,
  getLostFoundByIdDal,
  softDeleteLostFoundDal,
  updateLostFoundDal,
} from '../../dals/lx/lostFoundDal.js';

const logger = createContextLogger('lostFoundService');

const ok = (message, data, extra = {}) => ({ success: true, message, statusCode: 200, data, ...extra });
const fail = (message, statusCode) => ({ success: false, message, statusCode });

const canReview = (actor) => hasPermission(actor?.role, PERMISSIONS.APPROVE_LOST_FOUND);

/**
 * WHICH rows this actor may see, as a Prisma `where` fragment.
 *
 * Reviewers see everything. Everyone else sees the approved board plus their
 * own reports at any status — an author must be able to see that their post is
 * still pending, or was rejected and why, otherwise the queue is a black hole.
 */
export function lostFoundVisibility(actor, scope = 'BOARD') {
  const ref = actor?.referenceId;

  if (canReview(actor)) {
    switch (scope) {
      case 'PENDING': return { status: 'PENDING' };
      case 'RESOLVED': return { status: 'RESOLVED' };
      case 'MINE': return ref ? { reportedByRef: ref } : { id: '__none__' };
      default: return { status: 'APPROVED' };
    }
  }

  // Not a reviewer.
  switch (scope) {
    case 'PENDING':
      // Not an error — just nothing to show. Returning an impossible predicate
      // keeps the endpoint uniform instead of special-casing a 403 for a tab
      // the UI already hides.
      return { id: '__none__' };
    case 'MINE':
      return ref ? { reportedByRef: ref } : { id: '__none__' };
    case 'RESOLVED':
      return { status: 'RESOLVED' };
    default:
      return { status: 'APPROVED' };
  }
}

const serialize = (item, actor) => {
  if (!item) return item;
  const mine = item.reportedByRef === actor?.referenceId;
  const reviewer = canReview(actor);

  return {
    ...item,
    // The reporter's number is published only once the post is live, and only
    // to people looking at the live board. On a pending or rejected row it is
    // visible to its author and the reviewers, nobody else.
    contactPhone:
      item.status === 'APPROVED' || mine || reviewer ? item.contactPhone : null,
    // A rejection reason is feedback for the author, not public commentary.
    rejectionReason: mine || reviewer ? item.rejectionReason : null,
    isMine: mine,
    canEdit: mine && item.status === 'PENDING',
    canResolve: reviewer || (mine && item.status === 'APPROVED'),
  };
};

export const getAllLostFoundService = async (query, actor) => {
  try {
    const visibility = lostFoundVisibility(actor, query.scope);
    const result = await getAllLostFoundDal(query, visibility);

    // Tab badges: counts come from what this actor may see, so a student never
    // learns how many posts are sitting in the queue.
    const grouped = await countLostFoundByStatusDal(
      canReview(actor) ? {} : { OR: [{ status: 'APPROVED' }, { reportedByRef: actor?.referenceId ?? '__none__' }] },
    );
    const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all]));

    return ok('Lost & found items fetched successfully', result.data.map((i) => serialize(i, actor)), {
      pagination: {
        page: result.page,
        limit: result.limit,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
      meta: {
        counts: {
          APPROVED: counts.APPROVED ?? 0,
          PENDING: canReview(actor) ? (counts.PENDING ?? 0) : 0,
          RESOLVED: counts.RESOLVED ?? 0,
          canReview: canReview(actor),
        },
      },
    });
  } catch (error) {
    logger.error('Error in getAllLostFoundService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const getLostFoundByIdService = async (id, actor) => {
  try {
    const item = await getLostFoundByIdDal(id);
    if (!item) return fail('Item not found', 404);

    // A direct link must not bypass the board filter.
    const visible =
      canReview(actor) ||
      item.status === 'APPROVED' ||
      item.status === 'RESOLVED' ||
      item.reportedByRef === actor?.referenceId;
    if (!visible) return fail('Item not found', 404);

    return ok('Item found', serialize(item, actor));
  } catch (error) {
    logger.error('Error in getLostFoundByIdService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const createLostFoundService = async (payload, actor) => {
  try {
    const item = await createLostFoundDal({
      ...payload,
      reportedByRef: actor?.referenceId ?? 'unknown',
      reportedByName: actor?.displayName ?? null,
      // Always PENDING. There is no path that creates an approved item, not
      // even for an admin — a reviewer approving their own post in one step
      // would make the audit trail lie about who checked it.
      status: 'PENDING',
    });

    return {
      ...ok('Report submitted — it goes live once an admin approves it.', serialize(item, actor)),
      statusCode: 201,
    };
  } catch (error) {
    logger.error('Error in createLostFoundService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const updateLostFoundService = async (id, payload, actor) => {
  try {
    const existing = await getLostFoundByIdDal(id);
    if (!existing) return fail('Item not found', 404);

    const mine = existing.reportedByRef === actor?.referenceId;
    if (!mine && !canReview(actor)) return fail('This is not your report.', 403);

    // An author may fix their own post only while it is still pending. Editing
    // after approval would let approved-then-swapped content onto the board,
    // which is exactly what the review gate exists to prevent.
    if (mine && !canReview(actor) && existing.status !== 'PENDING') {
      return fail('An approved report can no longer be edited. Ask an admin.', 409);
    }

    const item = await updateLostFoundDal(id, payload);
    return ok('Report updated', serialize(item, actor));
  } catch (error) {
    logger.error('Error in updateLostFoundService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const reviewLostFoundService = async (id, { action, rejectionReason }, actor) => {
  try {
    const result = await actOnLostFoundDal(id, action, actor, rejectionReason);
    if (result === null) return fail('Item not found', 404);
    if (result?.error) return fail(result.error, 409);

    return ok(
      action === 'approve' ? 'Report approved and published' : 'Report rejected',
      serialize(result, actor),
    );
  } catch (error) {
    logger.error('Error in reviewLostFoundService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

/** Mark an item reunited with its owner. Takes it off the public board. */
export const resolveLostFoundService = async (id, { resolutionNote }, actor) => {
  try {
    const existing = await getLostFoundByIdDal(id);
    if (!existing) return fail('Item not found', 404);

    const mine = existing.reportedByRef === actor?.referenceId;
    if (!mine && !canReview(actor)) return fail('This is not your report.', 403);
    if (existing.status !== 'APPROVED') {
      return fail('Only a published report can be marked as returned.', 409);
    }

    const item = await updateLostFoundDal(id, {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedByRef: actor?.referenceId ?? null,
      resolutionNote: resolutionNote ?? null,
    });
    return ok('Marked as returned', serialize(item, actor));
  } catch (error) {
    logger.error('Error in resolveLostFoundService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};

export const deleteLostFoundService = async (id, actor) => {
  try {
    const existing = await getLostFoundByIdDal(id);
    if (!existing) return fail('Item not found', 404);

    const mine = existing.reportedByRef === actor?.referenceId;
    if (!mine && !canReview(actor)) return fail('This is not your report.', 403);

    const item = await softDeleteLostFoundDal(id);
    return ok('Report removed', serialize(item, actor));
  } catch (error) {
    logger.error('Error in deleteLostFoundService', {
      error: { message: error.message, stack: error.stack },
    });
    throw error;
  }
};
