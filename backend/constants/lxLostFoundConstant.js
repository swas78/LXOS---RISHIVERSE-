// LX Lost & Found constants.

export const LX_LOST_FOUND_KINDS = ['LOST', 'FOUND'];

export const LX_LOST_FOUND_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'];

// Statuses that appear on the public board. RESOLVED items are deliberately
// excluded: the board should show what is still open, not a museum.
export const LX_LOST_FOUND_PUBLIC_STATUSES = ['APPROVED'];

export const LX_LOST_FOUND_CATEGORIES = [
  'ELECTRONICS',
  'ID_CARD',
  'KEYS',
  'WALLET',
  'CLOTHING',
  'BOOK',
  'STATIONERY',
  'ACCESSORY',
  'OTHER',
];

export const LX_LOST_FOUND_SORT_BY = ['createdAt', 'occurredOn', 'title'];

export const LX_LOST_FOUND_EDITABLE_FIELDS = [
  'title',
  'description',
  'category',
  'images',
  'location',
  'occurredOn',
  'contactPhone',
];
