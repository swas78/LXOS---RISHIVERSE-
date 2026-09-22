// ---------------------------------------------------------------------------
// Library study cabins — identity, eligibility, settlement and serialisation.
//
// The rule arithmetic lives in helper/lxLibrary.js (pure); the Prisma calls
// live in dals/lx/cabinDal.js. This file is where the two meet and where every
// "may this person do this" question is answered exactly once.
// ---------------------------------------------------------------------------
import createContextLogger from "../../logger/contextLogger.js";
import {
    LIBRARY_RULES,
    addDaysToKey,
    bookerTypeFor,
    checkInDeadline,
    formatSlotLabel,
    istDateKey,
    istToUtc,
} from "../../helper/lxLibrary.js";
import {
    completeSessionsDal,
    createBlockDal,
    findActiveBlockDal,
    findActiveBlocksForRefsDal,
    findBlockByBookingDal,
    findFinishedSessionsDal,
    findMembersByRefsDal,
    findPendingCheckInsDal,
    getMemberByRefDal,
    countBookingsTodayDal,
    markNoShowDal,
} from "../../dals/lx/cabinDal.js";

const logger = createContextLogger("cabinService");

// ---- Identity -------------------------------------------------------------

/**
 * Everything the booking screen would otherwise ask a person to type.
 *
 * KIT: reads `LxMember`, whose `displayName` is a dev-shim column.
 * PRODUCTION: `req.actor` already carries `referenceId` and `coreRole` from the
 * JWT; swap the member lookup for the batched core query in identityService.js
 * and read `Student.mobileNumber` in place of `LxMember.contactPhone`.
 *
 * Nothing here is ever taken from the request body — that is the whole point.
 * The "Duplicate enrollment number" class of bug cannot occur when the client
 * never supplies an enrollment number.
 */
export const resolveLibraryIdentity = async (actor) => {
    if (!actor?.referenceId) return null;

    const member = await getMemberByRefDal(actor.referenceId);

    // `coreRole` is core's `User.userType`. The kit's actor shim infers it from
    // the referenceId shape, so faculty vs student still works locally.
    const coreRole = actor.coreRole ?? inferCoreRole(actor.referenceId);

    return {
        referenceId: actor.referenceId,
        name: member?.displayName ?? actor.displayName ?? actor.referenceId,
        email: member?.email ?? null,
        bookerType: bookerTypeFor(coreRole),
        phone: member?.contactPhone ?? null,
        lxRole: actor.role ?? null,
        // Someone with no membership row is not in the directory; the desk books
        // for them rather than the module guessing who they are.
        inDirectory: Boolean(member),
    };
};

/**
 * DEV-SHIM ONLY. Core `User.userType` is authoritative in production; this
 * infers it from the referenceId shape so the kit can tell a student from an
 * employee without a core database. Employee ids start "EMP"; enrollment
 * numbers do not.
 */
const inferCoreRole = (referenceId) =>
    /^EMP/i.test(String(referenceId ?? "")) ? "EMPLOYEE" : "STUDENT";

// ---- Settlement -----------------------------------------------------------

/**
 * Bring the day up to date. Called at the top of every read, so no cron job is
 * needed: a finished session completes, and a passed check-in deadline becomes
 * a no-show that hands the rest of the hour back to everyone else.
 *
 * Idempotent. Re-running it changes nothing, which is what makes it safe to
 * call on every request.
 */
export const settleBookings = async () => {
    const now = new Date();

    const finished = await findFinishedSessionsDal(now);
    if (finished.length > 0) {
        await completeSessionsDal(
            finished.map((b) => b.id),
            now,
        );
    }

    const pending = await findPendingCheckInsDal(now);
    for (const booking of pending) {
        if (checkInDeadline(booking).getTime() > now.getTime()) continue;

        // Guarded on status inside the DAL, so a concurrent settle pass cannot
        // double-apply. A zero-row update means someone else got there first.
        const result = await markNoShowDal(booking.id, now);
        if (result.count === 0) continue;

        // Faculty manage their own time — only students are blocked.
        if (booking.bookerType !== "STUDENT") continue;

        // One block per booking (bookingId is unique), so re-settling never stacks.
        const existing = await findBlockByBookingDal(booking.id);
        if (existing) continue;

        logger.info("Cabin booking settled as a no-show", {
            bookingId: booking.id,
            cabin: booking.cabinName,
            slot: formatSlotLabel(booking.slotStart, booking.slotEnd),
        });

        await createBlockDal({
            memberRef: booking.bookedByRef,
            memberName: booking.bookedByName,
            reason: "NO_SHOW",
            note: `Missed check-in for ${booking.cabinName} at ${formatSlotLabel(booking.slotStart, booking.slotEnd)}`,
            startsAt: now,
            // Blocked for the rest of today plus the next two calendar days.
            expiresAt: istToUtc(
                addDaysToKey(booking.date, LIBRARY_RULES.noShowBlockDays + 1),
                "00:00",
            ),
            bookingId: booking.id,
        });
    }

    return { settledAt: now };
};

// ---- Eligibility ----------------------------------------------------------

/**
 * The single place that answers "can this person book right now, and why not".
 * Returns a reason code so the UI can explain rather than just refuse.
 */
export const getBookingEligibility = async (identity, dateKey = istDateKey()) => {
    if (!identity) {
        return { canBook: false, reason: "NO_SESSION", message: "Sign in to book a cabin." };
    }

    if (!identity.inDirectory) {
        return {
            canBook: false,
            reason: "NOT_IN_DIRECTORY",
            message:
                "We could not find you in the university directory. Please see the library desk so they can book on your behalf.",
            bookingsToday: 0,
            remainingToday: 0,
        };
    }

    const block = await findActiveBlockDal(identity.referenceId);
    if (block) {
        return {
            canBook: false,
            reason: "BLOCKED",
            message: block.expiresAt
                ? "Cabin booking is paused for you after a missed check-in."
                : "Cabin booking is blocked for your account. Please meet the library team.",
            block: serializeBlock(block),
            bookingsToday: 0,
            remainingToday: 0,
        };
    }

    // Faculty: no daily cap. `remainingToday: null` means "unlimited", which the
    // UI renders as no counter at all rather than as zero.
    if (identity.bookerType === "FACULTY") {
        return { canBook: true, bookingsToday: 0, remainingToday: null };
    }

    const bookingsToday = await countBookingsTodayDal(identity.referenceId, dateKey);
    const remainingToday = Math.max(0, LIBRARY_RULES.studentMaxBookingsPerDay - bookingsToday);

    if (remainingToday === 0) {
        return {
            canBook: false,
            reason: "DAILY_LIMIT",
            message: "You have used both of today's cabin slots. Bookings reset tomorrow.",
            bookingsToday,
            remainingToday,
        };
    }

    return { canBook: true, bookingsToday, remainingToday };
};

/**
 * Resolve group members against the directory, rejecting anyone who does not
 * exist, is listed twice, is the owner again, or is currently blocked.
 *
 * Returning identity FROM the directory is what removes enrollment numbers
 * from the form: the client sends referenceIds it picked from a search, and
 * the names on the booking come from the directory, not from the client.
 */
export const resolveGroupMembers = async (refs, ownerRef) => {
    const wanted = [];
    const seen = new Set([ownerRef]);

    for (const raw of refs ?? []) {
        const ref = String(raw ?? "").trim();
        if (!ref) continue;
        if (seen.has(ref)) {
            return {
                error:
                    ref === ownerRef
                        ? "You are already on this booking."
                        : "Someone is listed twice on this booking.",
            };
        }
        seen.add(ref);
        wanted.push(ref);
    }

    if (wanted.length === 0) return { members: [] };

    const found = await findMembersByRefsDal(wanted);
    const byRef = new Map(found.map((m) => [m.referenceId, m]));

    const missing = wanted.filter((r) => !byRef.has(r));
    if (missing.length > 0) {
        return { error: `${missing.join(", ")} is not in the university directory.` };
    }

    // One query for every member, rather than one per member.
    const blocks = await findActiveBlocksForRefsDal(wanted);
    if (blocks.length > 0) {
        const names = blocks.map((b) => byRef.get(b.memberRef)?.displayName ?? b.memberRef);
        return { error: `${names.join(", ")} cannot use cabins right now (missed check-in).` };
    }

    return {
        members: wanted.map((ref) => ({
            referenceId: ref,
            name: byRef.get(ref)?.displayName ?? ref,
        })),
    };
};

// ---- Serialisation --------------------------------------------------------

export const serializeCabin = (cabin) =>
    cabin && {
        id: cabin.id,
        name: cabin.name,
        code: cabin.code,
        minCapacity: cabin.minCapacity,
        maxCapacity: cabin.maxCapacity,
        floor: cabin.floor,
        amenities: cabin.amenities ?? [],
        isActive: cabin.isActive,
        unavailableReason: cabin.unavailableReason,
    };

export const serializeBooking = (booking) =>
    booking && {
        id: booking.id,
        cabinId: booking.cabinId,
        cabinName: booking.cabinName,
        date: booking.date,
        slotStart: booking.slotStart,
        slotEnd: booking.slotEnd,
        slotLabel: formatSlotLabel(booking.slotStart, booking.slotEnd),
        startAt: booking.startAt,
        endAt: booking.endAt,
        bookedByRef: booking.bookedByRef,
        bookedByName: booking.bookedByName,
        bookerType: booking.bookerType,
        contactPhone: booking.contactPhone,
        groupMembers: booking.groupMembers ?? [],
        peopleCount: booking.peopleCount,
        status: booking.status,
        checkedInAt: booking.checkedInAt,
        checkedOutAt: booking.checkedOutAt,
        cancelledAt: booking.cancelledAt,
        // Only meaningful while the booking is still waiting to be claimed.
        checkInDeadline: booking.status === "BOOKED" ? checkInDeadline(booking) : null,
        createdAt: booking.createdAt,
    };

export const serializeBlock = (block) =>
    block && {
        id: block.id,
        memberRef: block.memberRef,
        memberName: block.memberName,
        reason: block.reason,
        note: block.note,
        startsAt: block.startsAt,
        expiresAt: block.expiresAt,
        isPermanent: !block.expiresAt,
        liftedAt: block.liftedAt ?? null,
    };

export default {
    resolveLibraryIdentity,
    settleBookings,
    getBookingEligibility,
    resolveGroupMembers,
    serializeCabin,
    serializeBooking,
    serializeBlock,
};
