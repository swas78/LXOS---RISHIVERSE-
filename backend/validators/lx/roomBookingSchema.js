import { z } from 'zod';
import {
  LX_ROOM_BOOKING_SORT_BY,
  LX_ROOM_BOOKING_STATUSES,
} from '../../constants/lxRoomBookingConstant.js';

export const createRoomBookingSchema = z
  .object({
    roomId: z.string().trim().min(1, 'roomId is required'),
    roomName: z.string().trim().max(120).optional().nullable(),
    eventId: z.string().trim().optional().nullable(),
    eventTitle: z.string().trim().max(200).optional().nullable(),
    title: z.string().trim().min(1, 'title is required').max(200),
    purpose: z.string().trim().max(1000).optional(),
    startTime: z.coerce.date({ errorMap: () => ({ message: 'startTime is required' }) }),
    endTime: z.coerce.date({ errorMap: () => ({ message: 'endTime is required' }) }),
  })
  .refine((v) => v.endTime > v.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

export const updateRoomBookingSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  purpose: z.string().trim().max(1000).optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
});

export const reviewRoomBookingSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().trim().max(1000).optional().nullable(),
});

export const roomBookingAvailabilitySchema = z
  .object({
    roomId: z.string().trim().min(1, 'roomId is required'),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    excludeBookingId: z.string().trim().optional(),
  })
  .refine((v) => v.endTime > v.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

export const getAllRoomBookingsSchema = z.object({
  roomId: z.string().trim().optional(),
  eventId: z.string().trim().optional(),
  status: z.preprocess((val) => {
    if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
    return undefined;
  }, z.array(z.enum(LX_ROOM_BOOKING_STATUSES)).optional()),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.preprocess((val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(1).max(200).default(50)),
  sortBy: z.enum(LX_ROOM_BOOKING_SORT_BY).optional().default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
