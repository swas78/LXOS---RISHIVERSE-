// ---------------------------------------------------------------------------
// LX RBAC — roles, permissions and scoping helpers.
//
// Mirrors the original LXOS lib/permissions.js. In the kit there is no auth,
// but the ACCESS-CONTROL model (who can do/see what) is ours to own. Every LX
// controller reads req.actor (populated by the dev-actor shim; RishiVerse
// supplies the authenticated user + role at integration) and gates on the
// permissions below. Data scoping (a club head sees only their club, etc.) uses
// the scope helpers at the bottom.
// ---------------------------------------------------------------------------

export const ROLES = {
  ADMIN: 'ADMIN',
  LX_TEAM: 'LX_TEAM',
  CLUB_HEAD: 'CLUB_HEAD',
  CLAN_HEAD: 'CLAN_HEAD',
  FINANCE: 'FINANCE',
  GUEST: 'GUEST',
};

export const PERMISSIONS = {
  // Events
  CREATE_EVENT: 'CREATE_EVENT',
  EDIT_EVENT: 'EDIT_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  APPROVE_EVENT: 'APPROVE_EVENT',
  VIEW_ALL_EVENTS: 'VIEW_ALL_EVENTS',
  // Rooms / bookings
  BOOK_ROOM: 'BOOK_ROOM',
  APPROVE_BOOKING: 'APPROVE_BOOKING',
  MANAGE_ROOMS: 'MANAGE_ROOMS',
  // Clubs
  VIEW_ALL_CLUBS: 'VIEW_ALL_CLUBS',
  MANAGE_CLUBS: 'MANAGE_CLUBS',
  MANAGE_CLUB_BUDGET: 'MANAGE_CLUB_BUDGET',
  // Clans
  MANAGE_CLANS: 'MANAGE_CLANS',
  ALLOCATE_CLAN_POINTS: 'ALLOCATE_CLAN_POINTS',
  MANAGE_CLAN_INITIATIVES: 'MANAGE_CLAN_INITIATIVES',
  // Finance
  SUBMIT_EXPENSE: 'SUBMIT_EXPENSE',
  APPROVE_EXPENSE: 'APPROVE_EXPENSE',
  SUBMIT_REIMBURSEMENT: 'SUBMIT_REIMBURSEMENT',
  REVIEW_REIMBURSEMENT: 'REVIEW_REIMBURSEMENT',
  PROCESS_REIMBURSEMENT: 'PROCESS_REIMBURSEMENT',
  VIEW_ALL_BUDGETS: 'VIEW_ALL_BUDGETS',
  // Achievements
  CREATE_ACHIEVEMENT: 'CREATE_ACHIEVEMENT',
  APPROVE_ACHIEVEMENT: 'APPROVE_ACHIEVEMENT',
  // Products
  SUBMIT_PRODUCT: 'SUBMIT_PRODUCT',
  APPROVE_PRODUCT: 'APPROVE_PRODUCT',
  // Files
  UPLOAD_FILE: 'UPLOAD_FILE',
  DELETE_FILE: 'DELETE_FILE',
  // Cross-cutting
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  VIEW_APPROVALS: 'VIEW_APPROVALS',
  MANAGE_ACCESS: 'MANAGE_ACCESS',
  GENERATE_REPORT: 'GENERATE_REPORT',
  MANAGE_SEMESTER: 'MANAGE_SEMESTER',
};

const P = PERMISSIONS;

export const rolePermissions = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // everything
  [ROLES.LX_TEAM]: [
    P.CREATE_EVENT, P.EDIT_EVENT, P.APPROVE_EVENT, P.VIEW_ALL_EVENTS,
    P.BOOK_ROOM, P.APPROVE_BOOKING,
    P.VIEW_ALL_CLUBS, P.MANAGE_CLUB_BUDGET,
    P.MANAGE_CLAN_INITIATIVES,
    P.SUBMIT_EXPENSE, P.SUBMIT_REIMBURSEMENT, P.REVIEW_REIMBURSEMENT, P.VIEW_ALL_BUDGETS,
    P.CREATE_ACHIEVEMENT, P.APPROVE_ACHIEVEMENT,
    P.SUBMIT_PRODUCT, P.APPROVE_PRODUCT,
    P.UPLOAD_FILE,
    P.VIEW_ANALYTICS, P.VIEW_APPROVALS,
    P.GENERATE_REPORT, P.MANAGE_SEMESTER,
  ],
  [ROLES.CLUB_HEAD]: [
    P.CREATE_EVENT, P.VIEW_ALL_EVENTS, P.BOOK_ROOM,
    P.VIEW_ALL_CLUBS,
    P.SUBMIT_EXPENSE, P.SUBMIT_REIMBURSEMENT,
    P.CREATE_ACHIEVEMENT, P.SUBMIT_PRODUCT, P.UPLOAD_FILE,
  ],
  [ROLES.CLAN_HEAD]: [
    P.CREATE_EVENT, P.VIEW_ALL_EVENTS, P.BOOK_ROOM,
    P.MANAGE_CLAN_INITIATIVES,
    P.SUBMIT_REIMBURSEMENT,
    P.CREATE_ACHIEVEMENT, P.SUBMIT_PRODUCT, P.UPLOAD_FILE,
  ],
  [ROLES.FINANCE]: [
    P.VIEW_ALL_EVENTS, P.VIEW_ALL_CLUBS,
    P.APPROVE_EXPENSE, P.PROCESS_REIMBURSEMENT, P.VIEW_ALL_BUDGETS,
    P.VIEW_ANALYTICS, P.VIEW_APPROVALS, P.GENERATE_REPORT,
    P.UPLOAD_FILE,
  ],
  // General access — view public content, submit own achievements/products/files.
  [ROLES.GUEST]: [
    P.VIEW_ALL_EVENTS, P.VIEW_ALL_CLUBS,
    P.CREATE_ACHIEVEMENT, P.SUBMIT_PRODUCT, P.UPLOAD_FILE,
  ],
};

export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  return (rolePermissions[role] || []).includes(permission);
}

export function getRolePermissions(role) {
  return rolePermissions[role] || [];
}

// ---- Data-scoping helpers -------------------------------------------------

// Roles that see finance/budget data across the whole institution.
export const FINANCE_VIEW_ROLES = [ROLES.ADMIN, ROLES.LX_TEAM, ROLES.FINANCE];

export const isFinanceViewer = (role) => FINANCE_VIEW_ROLES.includes(role);

// Reimbursement list scope: reviewers see everything; everyone else sees only
// what they submitted.
export const reimbursementScope = (actor) =>
  isFinanceViewer(actor?.role) ? {} : { submittedByRef: actor?.referenceId ?? '__none__' };

// Expense list scope: reviewers see all; a club head sees only what they
// submitted.
export const expenseScope = (actor) =>
  isFinanceViewer(actor?.role) ? {} : { submittedByRef: actor?.referenceId ?? '__none__' };

// Budget scope: ADMIN/LX/FINANCE see all clubs+clans; a club head sees only
// their club; a clan head only their clan; anyone else sees nothing.
export function budgetScope(actor) {
  if (isFinanceViewer(actor?.role)) return { clubIds: null, clanIds: null, all: true };
  if (actor?.role === ROLES.CLUB_HEAD && actor.clubId) {
    return { clubIds: [actor.clubId], clanIds: [], all: false };
  }
  if (actor?.role === ROLES.CLAN_HEAD && actor.clanId) {
    return { clubIds: [], clanIds: [actor.clanId], all: false };
  }
  return { clubIds: [], clanIds: [], all: false };
}
