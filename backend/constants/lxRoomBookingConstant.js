// LX Room Booking constants.

export const LX_ROOM_BOOKING_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

// A booking blocks a room only while it is live (not rejected/cancelled).
export const LX_ROOM_BOOKING_ACTIVE_STATUSES = ["PENDING", "APPROVED"];

export const LX_ROOM_BOOKING_EDITABLE_FIELDS = ["title", "purpose", "startTime", "endTime"];

export const LX_ROOM_BOOKING_SORT_BY = ["startTime", "createdAt", "status"];
