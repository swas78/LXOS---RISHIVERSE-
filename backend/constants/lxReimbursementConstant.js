// LX Reimbursement constants.

/**
 * D3 (lxos-core-pack/payouts.md) forbids LXOS from holding account numbers or
 * IFSC codes — they already live on core's `Student` row. This flag exists only
 * so the standalone kit can be demoed with no core profile to read from, and it
 * MUST stay false at handoff. Read once at boot: `dotenv/config` runs in
 * server.js before anything imports this module.
 */
export const COLLECT_BANK_DETAILS = process.env.LX_COLLECT_BANK === 'true';

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
  // `bankDetails` is deliberately absent: it is captured at submit time only
  // (and only under COLLECT_BANK_DETAILS), never edited afterwards.
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
