// LX Reimbursement constants.

/** `payoutRef` points at a person, never at credentials: "student-bank:<enrollmentNo>". */
export const PAYOUT_REF_PREFIX = 'student-bank:';

/** A claim with no receipt is not reviewable, so create requires 1..MAX bills. */
export const LX_REIMBURSEMENT_MAX_BILLS = 6;

export const LX_REIMBURSEMENT_CATEGORIES = [
  'FOOD',
  'TRAVEL',
  'MATERIALS',
  'EQUIPMENT',
  'PRINTING',
  'ACCOMMODATION',
  'OTHER',
];

export const LX_REIMBURSEMENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'];

export const LX_REIMBURSEMENT_EDITABLE_FIELDS = [
  'title',
  'description',
  'amount',
  'expenseDate',
  'category',
  'eventId',
  'eventTitle',
  'purpose',
  'clubId',
  'clubName',
  'clanId',
  'clanName',
  'bills',
  'notes',
];

export const LX_REIMBURSEMENT_SORT_BY = [
  'createdAt',
  'updatedAt',
  'amount',
  'expenseDate',
  'status',
];
