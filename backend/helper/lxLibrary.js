// ---------------------------------------------------------------------------
// Library study-cabin rules — pure functions only. No Prisma, no HTTP.
//
// Everything here is wall-clock arithmetic in IST. The library's rules are all
// expressed in local calendar terms ("2 slots a day", "same day only", "10
// minutes to check in"), so the module works in IST and converts to absolute
// instants at the boundary rather than storing a UTC instant and hoping the
// day survives the round trip.
// ---------------------------------------------------------------------------

// India has had no DST since 1945, so a fixed offset converts IST wall-clock to
// UTC exactly. Using a fixed number rather than a tz library keeps this pure.
const TZ_OFFSET_MINUTES = 330; // UTC+05:30

/// The printed library rules, in one place. Changing the library's hours or
/// caps is a change to this object and nothing else.
export const LIBRARY_RULES = {
    opensAt: "09:30",
    closesAt: "22:30",
    slotMinutes: 60,
    /// Grace period to reach the cabin before the booking is forfeited.
    checkInGraceMinutes: 10,
    /// How early the desk may check someone in before their hour begins.
    earlyCheckInMinutes: 5,
    /// A slot with less time left than this is no longer worth claiming.
    minUsableMinutes: 15,
    studentMaxBookingsPerDay: 2,
    noShowBlockDays: 2,
    /// Same-day only — the printed rule, kept deliberately.
    advanceDays: 0,
    /// Cancellations in a rolling week before the desk is shown a watchlist entry.
    cancellationWatchlistThreshold: 3,
};

/** Today's calendar day in IST as "YYYY-MM-DD". */
export function istDateKey(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

/** An IST calendar day + "HH:mm" as an absolute instant. */
export function istToUtc(dateKey, hhmm) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const [hours, minutes] = hhmm.split(":").map(Number);
    return new Date(Date.UTC(year, month - 1, day, hours, minutes) - TZ_OFFSET_MINUTES * 60000);
}

/** Shift a "YYYY-MM-DD" key by whole days, staying in calendar space. */
export function addDaysToKey(dateKey, days) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function formatSlotTime(hhmm) {
    const [hours, minutes] = hhmm.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const display = hours % 12 === 0 ? 12 : hours % 12;
    return `${display}:${String(minutes).padStart(2, "0")} ${period}`;
}

export const formatSlotLabel = (slotStart, slotEnd) =>
    `${formatSlotTime(slotStart)} - ${formatSlotTime(slotEnd)}`;

const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

const fromMinutes = (total) =>
    `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

/** Every slot the library offers on a given day. */
export function generateSlots(dateKey) {
    const open = toMinutes(LIBRARY_RULES.opensAt);
    const close = toMinutes(LIBRARY_RULES.closesAt);
    const slots = [];

    for (
        let start = open;
        start + LIBRARY_RULES.slotMinutes <= close;
        start += LIBRARY_RULES.slotMinutes
    ) {
        const slotStart = fromMinutes(start);
        const slotEnd = fromMinutes(start + LIBRARY_RULES.slotMinutes);
        slots.push({
            slotStart,
            slotEnd,
            label: formatSlotLabel(slotStart, slotEnd),
            startAt: istToUtc(dateKey, slotStart),
            endAt: istToUtc(dateKey, slotEnd),
        });
    }
    return slots;
}

export const findSlot = (dateKey, slotStart) =>
    generateSlots(dateKey).find((s) => s.slotStart === slotStart) ?? null;

/**
 * The value written to `LxCabinBooking.slotKey` while a booking holds a slot.
 * Its uniqueness is what prevents double-booking at the database level.
 */
export const buildSlotKey = (cabinId, dateKey, slotStart) => `${cabinId}:${dateKey}:${slotStart}`;

/**
 * A slot can still be claimed part-way through, as long as enough of it is
 * left to be worth having — booking the hour you are standing in is the common
 * case at the desk.
 */
export const isSlotBookable = (slot, now = new Date()) =>
    new Date(slot.endAt).getTime() - now.getTime() >= LIBRARY_RULES.minUsableMinutes * 60000;

/**
 * When the grace period runs out. Measured from whichever is later — the slot
 * opening, or the moment of booking — so someone who books mid-hour still gets
 * the full ten minutes to walk over rather than being instantly a no-show.
 */
export function checkInDeadline(booking) {
    const base = Math.max(
        new Date(booking.startAt).getTime(),
        new Date(booking.createdAt ?? booking.startAt).getTime(),
    );
    return new Date(base + LIBRARY_RULES.checkInGraceMinutes * 60000);
}

/** When check-in opens: a few minutes of lead, never hours early. */
export const checkInOpensAt = (booking) =>
    new Date(new Date(booking.startAt).getTime() - LIBRARY_RULES.earlyCheckInMinutes * 60000);

/**
 * Which rule set applies to a person, from core `User.userType`.
 * Faculty get no daily cap and are never auto-blocked; students get both.
 */
export const bookerTypeFor = (coreRole) =>
    String(coreRole ?? "").toUpperCase() === "STUDENT" ? "STUDENT" : "FACULTY";

/** Statuses that still occupy a slot. */
export const LIVE_STATUSES = ["BOOKED", "CHECKED_IN"];
/** Statuses that count against a student's daily allowance. A cancellation does
 *  not — giving a slot back promptly should not cost you the day. */
export const COUNTED_STATUSES = ["BOOKED", "CHECKED_IN", "COMPLETED", "NO_SHOW"];
