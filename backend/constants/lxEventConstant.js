// LX Event constants.

export const LX_EVENT_TYPES = ['CLUB', 'CLAN', 'LX', 'FEST'];

export const LX_EVENT_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
];

// Fields a client may modify via PATCH /:eventId. Lifecycle fields (status,
// approvedBy*, completedBy*, createdBy*) are driven by the approve/complete
// actions, not by a generic update.
export const LX_EVENT_EDITABLE_FIELDS = [
  'title',
  'description',
  'type',
  'clubId',
  'clubName',
  'clanId',
  'clanName',
  'startDate',
  'endDate',
  'roomIds',
  'roomNames',
  'location',
  'requirements',
  'budgetAllocated',
  'budgetSpent',
  'attendees',
  'poster',
];

export const LX_EVENT_SORT_BY = ['startDate', 'title', 'status', 'createdAt'];

// Statuses that occupy a room for availability purposes.
export const LX_EVENT_ACTIVE_STATUSES = ['PENDING', 'APPROVED'];
