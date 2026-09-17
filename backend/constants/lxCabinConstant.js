// LX library-cabin constants.

export const LX_CABIN_BOOKER_TYPES = ['STUDENT', 'FACULTY'];

export const LX_CABIN_BOOKING_STATUSES = [
  'BOOKED',
  'CHECKED_IN',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
];

export const LX_CABIN_BLOCK_REASONS = ['NO_SHOW', 'REPEATED_CANCELLATION', 'MANUAL'];

// Desk actions on a booking. `no-show` is librarian-only; the rest are also
// available to the person who made the booking.
export const LX_CABIN_BOOKING_ACTIONS = ['check-in', 'check-out', 'cancel', 'no-show'];

export const LX_CABIN_EDITABLE_FIELDS = [
  'name',
  'floor',
  'amenities',
  'minCapacity',
  'maxCapacity',
  'isActive',
  'unavailableReason',
];
