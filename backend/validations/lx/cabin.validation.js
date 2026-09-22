import { z } from "zod";
import {
    LX_CABIN_BOOKING_ACTIONS,
    LX_CABIN_BLOCK_REASONS,
} from "../../constants/lxCabinConstant.js";

// A calendar day in IST, "YYYY-MM-DD".
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

// Wall-clock time of day, "HH:mm".
const hhmm = z.string().regex(/^\d{2}:\d{2}$/, "slotStart must be HH:mm");

/**
 * Indian mobile number. Accepts what people actually type — spaces, dashes,
 * a +91 prefix — and normalises to the last ten digits, rejecting anything
 * that is not a plausible mobile.
 */
export const phoneSchema = z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, "").slice(-10))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit Indian mobile number");

export const createCabinBookingSchema = z.object({
    cabinId: z.string().trim().min(1, "cabinId is required"),
    slotStart: hhmm,
    phone: phoneSchema,
    /// Core `User.referenceId` values of everyone else on the booking. Resolved
    /// against the directory server-side, so a client cannot invent a person.
    groupMemberRefs: z.array(z.string().trim().min(1)).max(10).optional().default([]),
});

export const bookingActionSchema = z.object({
    action: z.enum(LX_CABIN_BOOKING_ACTIONS),
});

export const listBookingsSchema = z.object({
    date: dateKey.optional(),
    scope: z.enum(["mine", "all"]).optional().default("mine"),
});

export const boardQuerySchema = z.object({
    date: dateKey.optional(),
});

export const directoryQuerySchema = z.object({
    q: z.string().trim().default(""),
});

export const availabilityQuerySchema = z.object({
    date: dateKey.optional(),
});

export const createCabinSchema = z
    .object({
        name: z.string().trim().min(1, "name is required").max(120),
        code: z.string().trim().min(1, "code is required").max(16).toUpperCase(),
        minCapacity: z.coerce.number().int().min(1).default(2),
        maxCapacity: z.coerce.number().int().min(1).default(4),
        floor: z.string().trim().max(60).optional().nullable(),
        amenities: z.array(z.string().trim().max(40)).optional().default([]),
    })
    .refine((v) => v.maxCapacity >= v.minCapacity, {
        message: "maxCapacity must be at least minCapacity",
        path: ["maxCapacity"],
    });

export const updateCabinSchema = z
    .object({
        name: z.string().trim().min(1).max(120).optional(),
        minCapacity: z.coerce.number().int().min(1).optional(),
        maxCapacity: z.coerce.number().int().min(1).optional(),
        floor: z.string().trim().max(60).optional().nullable(),
        amenities: z.array(z.string().trim().max(40)).optional(),
        isActive: z.boolean().optional(),
        unavailableReason: z.string().trim().max(200).optional().nullable(),
    })
    .refine(
        (v) =>
            v.minCapacity === undefined ||
            v.maxCapacity === undefined ||
            v.maxCapacity >= v.minCapacity,
        { message: "maxCapacity must be at least minCapacity", path: ["maxCapacity"] },
    );

export const createBlockSchema = z.object({
    memberRef: z.string().trim().min(1, "memberRef is required"),
    /// Omit or pass 0 for a permanent block, liftable only at the desk.
    days: z.coerce.number().int().min(0).max(365).optional(),
    note: z.string().trim().max(300).optional().nullable(),
    reason: z.enum(LX_CABIN_BLOCK_REASONS).optional().default("MANUAL"),
});

export const liftBlockSchema = z.object({
    reason: z.string().trim().max(300).optional().nullable(),
});
