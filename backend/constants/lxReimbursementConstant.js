// LX Reimbursement constants.

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
  'bankDetails',
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
