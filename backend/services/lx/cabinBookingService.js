// ---------------------------------------------------------------------------
// Library study cabins — the booking board, creating a booking, and the four
// desk actions (check in, check out, cancel, mark a no-show).
// ---------------------------------------------------------------------------
import createContextLogger from "../../logger/contextLogger.js";
import {
    LIBRARY_RULES,
    LIVE_STATUSES,
    addDaysToKey,
    buildSlotKey,
    checkInDeadline,
    checkInOpensAt,
    findSlot,
    formatSlotLabel,
    generateSlots,
    istDateKey,
    istToUtc,
    isSlotBookable,
} from "../../helper/lxLibrary.js";
import { hasPermission, PERMISSIONS } from "../../helper/lxPermissions.js";
import {
    createBlockDal,
    createBookingDal,
    findBlockByBookingDal,
    findFrequentCancellersDal,
    findMembersByRefsDal,
    findSlotClashForRefsDal,
    getAllCabinsDal,
    getBookingByIdDal,
    getBookingsForDateDal,
    getBookingsForMemberDal,
    getCabinByIdDal,
    saveContactPhoneDal,
    searchDirectoryDal,
    updateBookingDal,
} from "../../dals/lx/cabinDal.js";
import {
    getBookingEligibility,
    resolveGroupMembers,
    resolveLibraryIdentity,
    serializeBlock,
    serializeBooking,
    serializeCabin,
    settleBookings,
} from "./cabinService.js";

const logger = createContextLogger("cabinBookingService");

const ok = (message, data, statusCode = 200) => ({ success: true, message, statusCode, data });
const fail = (message, statusCode) => ({ success: false, message, statusCode });

const isLibrarian = (actor) => hasPermission(actor?.role, PERMISSIONS.MANAGE_LIBRARY_CABINS);

// ---- The student / faculty booking board -----------------------------------

/**
 * One call returns everything the booking screen needs: who you are, whether
 * you may book, what you already hold today, and every cabin with its free
 * slots already worked out. The client does no rule arithmetic at all.
 */
export const getCabinBoardService = async (actor, { date } = {}) => {
    try {
        await settleBookings();

        const dateKey = date ?? istDateKey();
        const identity = await resolveLibraryIdentity(actor);
        const eligibility = await getBookingEligibility(identity, dateKey);

        const [cabins, dayBookings] = await Promise.all([
            getAllCabinsDal(),
            getBookingsForDateDal(dateKey),
        ]);

        const now = new Date();
        const slots = generateSlots(dateKey);

        // Slots already claimed, keyed "cabinId|slotStart".
        const taken = new Set(
            dayBookings
                .filter((b) => LIVE_STATUSES.includes(b.status))
                .map((b) => `${b.cabinId}|${b.slotStart}`),
        );

        // Every slot is returned with a status rather than filtered away: a student
        // seeing today's hours struck through understands the day far better than a
        // list that silently shrinks. Who holds a taken slot is deliberately NOT
        // included — that is the desk's business, not other students'.
        const cabinsWithSlots = cabins.map((cabin) => {
            const cabinSlots = slots.map((slot) => {
                const status = !isSlotBookable(slot, now)
                    ? "PAST"
                    : !cabin.isActive
                      ? "CLOSED"
                      : taken.has(`${cabin.id}|${slot.slotStart}`)
                        ? "TAKEN"
                        : "FREE";
                return {
                    slotStart: slot.slotStart,
                    slotEnd: slot.slotEnd,
                    label: slot.label,
                    startAt: slot.startAt,
                    endAt: slot.endAt,
                    status,
                    available: status === "FREE",
                };
            });

            return {
                ...serializeCabin(cabin),
                slots: cabinSlots,
                freeSlotCount: cabinSlots.filter((s) => s.status === "FREE").length,
            };
        });

        const myBookings = identity
            ? dayBookings.filter((b) => b.bookedByRef === identity.referenceId)
            : [];

        return ok("Cabin board fetched successfully", {
            date: dateKey,
            rules: LIBRARY_RULES,
            identity,
            eligibility,
            cabins: cabinsWithSlots,
            myBookings: myBookings.map(serializeBooking),
        });
    } catch (error) {
        logger.error("Error in getCabinBoardService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// ---- Creating a booking ----------------------------------------------------

export const createCabinBookingService = async (payload, actor) => {
    try {
        await settleBookings();

        const dateKey = istDateKey();
        const identity = await resolveLibraryIdentity(actor);

        const eligibility = await getBookingEligibility(identity, dateKey);
        if (!eligibility.canBook) {
            // 403 is right for "you specifically may not", 422 for the daily cap —
            // the request is well-formed, the state of the world refuses it.
            const statusCode = eligibility.reason === "DAILY_LIMIT" ? 422 : 403;
            return { ...fail(eligibility.message, statusCode), reason: eligibility.reason };
        }

        const slot = findSlot(dateKey, payload.slotStart);
        if (!slot) return fail("That time slot does not exist.", 400);
        if (!isSlotBookable(slot)) return fail("That slot has already passed.", 409);

        const cabin = await getCabinByIdDal(payload.cabinId);
        if (!cabin) return fail("That cabin does not exist.", 404);
        if (!cabin.isActive) {
            return fail(cabin.unavailableReason || "That cabin is out of service.", 409);
        }

        const { members, error: memberError } = await resolveGroupMembers(
            payload.groupMemberRefs,
            identity.referenceId,
        );
        if (memberError) return fail(memberError, 400);

        const peopleCount = members.length + 1;
        if (peopleCount > cabin.maxCapacity) {
            return fail(
                `${cabin.name} seats at most ${cabin.maxCapacity} people. You have ${peopleCount}.`,
                422,
            );
        }
        // Group cabins carry a minimum so one student cannot hold six seats.
        // Faculty are exempt: a one-to-one consultation is a legitimate use.
        if (identity.bookerType === "STUDENT" && peopleCount < cabin.minCapacity) {
            return fail(
                `${cabin.name} is for groups of ${cabin.minCapacity}-${cabin.maxCapacity}. You have ${peopleCount}.`,
                422,
            );
        }

        // Nobody — owner or member — can be in two cabins in the same hour.
        const everyone = [identity.referenceId, ...members.map((m) => m.referenceId)];
        const clash = await findSlotClashForRefsDal(everyone, dateKey, slot.slotStart);
        if (clash) {
            return fail("Someone in this group already has a cabin for that hour.", 409);
        }

        let booking;
        try {
            booking = await createBookingDal({
                cabinId: cabin.id,
                cabinName: cabin.name,
                date: dateKey,
                slotStart: slot.slotStart,
                slotEnd: slot.slotEnd,
                startAt: slot.startAt,
                endAt: slot.endAt,
                // Claiming the slot IS the unique insert. Two people pressing at the
                // same instant cannot both succeed, because the database says so.
                slotKey: buildSlotKey(cabin.id, dateKey, slot.slotStart),
                bookedByRef: identity.referenceId,
                bookedByName: identity.name,
                bookerType: identity.bookerType,
                contactPhone: payload.phone,
                groupMembers: members,
                peopleCount,
                status: "BOOKED",
            });
        } catch (error) {
            if (error?.code === "P2002") {
                return fail("Someone just took that slot. Pick another one.", 409);
            }
            throw error;
        }

        // Remembered so the next booking asks for nothing at all.
        if (payload.phone && payload.phone !== identity.phone) {
            await saveContactPhoneDal(identity.referenceId, payload.phone);
        }

        return ok("Cabin booked", serializeBooking(booking), 201);
    } catch (error) {
        logger.error("Error in createCabinBookingService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// ---- Desk actions ----------------------------------------------------------

export const actOnCabinBookingService = async (bookingId, action, actor) => {
    try {
        await settleBookings();

        const booking = await getBookingByIdDal(bookingId);
        if (!booking) return fail("Booking not found", 404);

        const librarian = isLibrarian(actor);
        const owner = booking.bookedByRef === actor?.referenceId;
        if (!librarian && !owner) {
            return fail("This is not your booking.", 403);
        }

        const now = new Date();
        const deskStamp =
            librarian && !owner
                ? { handledByRef: actor.referenceId, handledByName: actor.displayName ?? null }
                : {};

        if (action === "check-in") {
            if (booking.status !== "BOOKED") {
                return fail("This booking is not waiting for check-in.", 409);
            }
            // A booking cannot be claimed hours early — the cabin belongs to whoever
            // has the current hour until theirs begins.
            if (now < checkInOpensAt(booking)) {
                return fail("Check-in opens a few minutes before the slot starts.", 409);
            }
            if (checkInDeadline(booking) < now) {
                return fail("The check-in window has closed.", 409);
            }
            const updated = await updateBookingDal(bookingId, {
                status: "CHECKED_IN",
                checkedInAt: now,
                ...deskStamp,
            });
            return ok("Checked in", serializeBooking(updated));
        }

        if (action === "check-out") {
            if (booking.status !== "CHECKED_IN") {
                return fail("This session is not currently checked in.", 409);
            }
            const updated = await updateBookingDal(bookingId, {
                status: "COMPLETED",
                checkedOutAt: now,
                // Releasing the key hands the rest of the hour back to everyone else.
                slotKey: null,
                ...deskStamp,
            });
            return ok("Checked out", serializeBooking(updated));
        }

        if (action === "cancel") {
            if (!LIVE_STATUSES.includes(booking.status)) {
                return fail("This booking can no longer be cancelled.", 409);
            }
            const updated = await updateBookingDal(bookingId, {
                status: "CANCELLED",
                cancelledAt: now,
                slotKey: null,
                ...deskStamp,
            });
            return ok("Booking cancelled", serializeBooking(updated));
        }

        if (action === "no-show") {
            if (!librarian) return fail("Only the library desk can mark a no-show.", 403);
            if (booking.status !== "BOOKED") {
                return fail("Only a waiting booking can be marked a no-show.", 409);
            }

            const updated = await updateBookingDal(bookingId, {
                status: "NO_SHOW",
                markedNoShowAt: now,
                slotKey: null,
                handledByRef: actor.referenceId,
                handledByName: actor.displayName ?? null,
            });

            // Faculty are trusted to manage their own time — only students are blocked.
            if (booking.bookerType === "STUDENT") {
                const existing = await findBlockByBookingDal(bookingId);
                if (!existing) {
                    await createBlockDal({
                        memberRef: booking.bookedByRef,
                        memberName: booking.bookedByName,
                        reason: "NO_SHOW",
                        note: `Marked a no-show at the desk for ${booking.cabinName} at ${formatSlotLabel(booking.slotStart, booking.slotEnd)}`,
                        startsAt: now,
                        expiresAt: istToUtc(
                            addDaysToKey(booking.date, LIBRARY_RULES.noShowBlockDays + 1),
                            "00:00",
                        ),
                        bookingId,
                        createdByRef: actor.referenceId,
                    });
                }
            }

            return ok("Marked as a no-show", serializeBooking(updated));
        }

        return fail("Unknown action", 400);
    } catch (error) {
        logger.error("Error in actOnCabinBookingService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// ---- The librarian's desk board --------------------------------------------

/**
 * The whole day in one call, already grouped the way the desk actually works
 * through it: who needs checking in now, who is inside, who is coming, and
 * what is already settled.
 */
export const getDeskBoardService = async (actor, { date } = {}) => {
    try {
        await settleBookings();

        const dateKey = date ?? istDateKey();
        const [cabins, bookings] = await Promise.all([
            getAllCabinsDal(),
            getBookingsForDateDal(dateKey),
        ]);

        const now = new Date();
        const all = bookings.map(serializeBooking);

        const awaitingCheckIn = all.filter(
            (b) => b.status === "BOOKED" && new Date(b.startAt) <= now,
        );
        const upcoming = all.filter((b) => b.status === "BOOKED" && new Date(b.startAt) > now);
        const ongoing = all.filter((b) => b.status === "CHECKED_IN");
        const finished = all.filter((b) =>
            ["COMPLETED", "NO_SHOW", "CANCELLED"].includes(b.status),
        );

        // Frequent cancellers are SURFACED, not auto-punished. The printed rule
        // says three cancellations in a week is a permanent block; applying that
        // automatically would bar a student with no conversation and no appeal, so
        // the desk is shown the list and decides. See the handoff note.
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const cancellers = await findFrequentCancellersDal(
            weekAgo,
            LIBRARY_RULES.cancellationWatchlistThreshold,
        );
        const cancellerRefs = cancellers.map((c) => c.bookedByRef);
        const cancellerNames = cancellerRefs.length
            ? new Map(
                  (await findMembersByRefsDal(cancellerRefs)).map((m) => [
                      m.referenceId,
                      m.displayName,
                  ]),
              )
            : new Map();

        return ok("Desk board fetched successfully", {
            date: dateKey,
            rules: LIBRARY_RULES,
            cabins: cabins.map(serializeCabin),
            awaitingCheckIn,
            ongoing,
            upcoming,
            finished,
            stats: {
                booked: all.filter((b) => b.status !== "CANCELLED").length,
                checkedIn: ongoing.length,
                noShows: all.filter((b) => b.status === "NO_SHOW").length,
                cancelled: all.filter((b) => b.status === "CANCELLED").length,
                seatsInUse: ongoing.reduce((sum, b) => sum + (b.peopleCount ?? 0), 0),
            },
            watchlist: cancellers.map((c) => ({
                memberRef: c.bookedByRef,
                name: cancellerNames.get(c.bookedByRef) ?? c.bookedByRef,
                cancellations: c._count._all,
            })),
        });
    } catch (error) {
        logger.error("Error in getDeskBoardService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

// ---- Lists, directory, cabin admin -----------------------------------------

export const listCabinBookingsService = async (actor, { date, scope }) => {
    try {
        await settleBookings();
        const dateKey = date ?? istDateKey();

        const bookings =
            scope === "all" && isLibrarian(actor)
                ? await getBookingsForDateDal(dateKey)
                : await getBookingsForMemberDal(actor?.referenceId ?? "__none__", dateKey);

        return ok("Bookings fetched successfully", {
            date: dateKey,
            bookings: bookings.map(serializeBooking),
        });
    } catch (error) {
        logger.error("Error in listCabinBookingsService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

/**
 * Typeahead for adding people to a booking. Only students are returned: a
 * faculty member books their own cabin rather than joining a study group.
 */
export const searchDirectoryService = async (actor, query) => {
    try {
        const q = String(query ?? "").trim();
        if (q.length < 2) return ok("Directory searched", { results: [] });

        const rows = await searchDirectoryDal(q, actor?.referenceId ?? "__none__");
        return ok("Directory searched", {
            results: rows
                .filter((r) => !/^EMP/i.test(r.referenceId))
                .map((r) => ({
                    referenceId: r.referenceId,
                    name: r.displayName ?? r.referenceId,
                })),
        });
    } catch (error) {
        logger.error("Error in searchDirectoryService", {
            error: { message: error.message, stack: error.stack },
        });
        throw error;
    }
};

export { serializeBlock };
