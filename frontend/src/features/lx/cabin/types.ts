// Library study cabins — the shapes the backend actually returns.
//
// Note what is NOT here: there is no field for a name, enrollment number,
// course or batch that the client sends. Identity travels one way only — the
// server resolves it from the directory and tells the client. That is what
// makes a "duplicate enrollment number" error structurally impossible.

export type LxCabinSlotStatus = "FREE" | "TAKEN" | "PAST" | "CLOSED";

export type LxCabinSlot = {
    slotStart: string; // "HH:mm" IST
    slotEnd: string;
    label: string; // "2:30 PM - 3:30 PM"
    startAt: string;
    endAt: string;
    status: LxCabinSlotStatus;
    available: boolean;
};

export type LxCabin = {
    id: string;
    name: string;
    code: string;
    minCapacity: number;
    maxCapacity: number;
    floor: string | null;
    amenities: string[];
    isActive: boolean;
    unavailableReason: string | null;
};

export type LxCabinWithSlots = LxCabin & {
    slots: LxCabinSlot[];
    freeSlotCount: number;
};

export type LxCabinBookerType = "STUDENT" | "FACULTY";

export type LxCabinBookingStatus = "BOOKED" | "CHECKED_IN" | "COMPLETED" | "NO_SHOW" | "CANCELLED";

export type LxCabinGroupMember = {
    referenceId: string;
    name: string;
};

export type LxCabinBooking = {
    id: string;
    cabinId: string;
    cabinName: string | null;
    date: string;
    slotStart: string;
    slotEnd: string;
    slotLabel: string;
    startAt: string;
    endAt: string;
    bookedByRef: string;
    bookedByName: string | null;
    bookerType: LxCabinBookerType;
    contactPhone: string | null;
    groupMembers: LxCabinGroupMember[];
    peopleCount: number;
    status: LxCabinBookingStatus;
    checkedInAt: string | null;
    checkedOutAt: string | null;
    cancelledAt: string | null;
    /// Only set while the booking is still waiting to be claimed.
    checkInDeadline: string | null;
    createdAt: string;
};

export type LxLibraryRules = {
    opensAt: string;
    closesAt: string;
    slotMinutes: number;
    checkInGraceMinutes: number;
    earlyCheckInMinutes: number;
    minUsableMinutes: number;
    studentMaxBookingsPerDay: number;
    noShowBlockDays: number;
    advanceDays: number;
    cancellationWatchlistThreshold: number;
};

export type LxCabinIdentity = {
    referenceId: string;
    name: string;
    email: string | null;
    bookerType: LxCabinBookerType;
    phone: string | null;
    lxRole: string | null;
    inDirectory: boolean;
};

export type LxCabinBlock = {
    id: string;
    memberRef: string;
    memberName: string | null;
    reason: "NO_SHOW" | "REPEATED_CANCELLATION" | "MANUAL";
    note: string | null;
    startsAt: string;
    expiresAt: string | null;
    isPermanent: boolean;
    liftedAt: string | null;
};

export type LxCabinEligibility = {
    canBook: boolean;
    reason?: "NO_SESSION" | "NOT_IN_DIRECTORY" | "BLOCKED" | "DAILY_LIMIT";
    message?: string;
    block?: LxCabinBlock;
    bookingsToday: number;
    /// `null` means unlimited — faculty have no daily cap. The UI must show no
    /// counter at all rather than treating it as zero.
    remainingToday: number | null;
};

export type LxCabinBoard = {
    date: string;
    rules: LxLibraryRules;
    identity: LxCabinIdentity | null;
    eligibility: LxCabinEligibility;
    cabins: LxCabinWithSlots[];
    myBookings: LxCabinBooking[];
};

export type LxDeskBoard = {
    date: string;
    rules: LxLibraryRules;
    cabins: LxCabin[];
    awaitingCheckIn: LxCabinBooking[];
    ongoing: LxCabinBooking[];
    upcoming: LxCabinBooking[];
    finished: LxCabinBooking[];
    stats: {
        booked: number;
        checkedIn: number;
        noShows: number;
        cancelled: number;
        seatsInUse: number;
    };
    watchlist: { memberRef: string; name: string; cancellations: number }[];
};

export type LxDirectoryPerson = { referenceId: string; name: string };

export type CreateLxCabinBookingPayload = {
    cabinId: string;
    slotStart: string;
    phone: string;
    groupMemberRefs: string[];
};

export type LxCabinBookingAction = "check-in" | "check-out" | "cancel" | "no-show";

export type LxEnvelope<T> = { success: boolean; message: string; data: T };
