import { z } from 'zod';
import {
  LX_ROOM_TYPES,
  LX_ROOM_AMENITIES,
  LX_ROOM_SORT_BY,
} from '../../constants/lxRoomConstant.js';

const amenitiesField = z
  .array(
    z.enum(LX_ROOM_AMENITIES, {
      message: `amenities must be from: ${LX_ROOM_AMENITIES.join(', ')}`,
    }),
  )
  .optional();

export const createRoomSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(120),
  building: z.string().trim().max(120).optional().nullable(),
  floor: z.string().trim().max(60).optional().nullable(),
  capacity: z.number().int().min(0).max(100000).optional(),
  type: z
    .enum(LX_ROOM_TYPES, {
      message: `type must be one of: ${LX_ROOM_TYPES.join(', ')}`,
    })
    .optional(),
  amenities: amenitiesField,
  isActive: z.boolean().optional(),
});

export const updateRoomSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  building: z.string().trim().max(120).optional().nullable(),
  floor: z.string().trim().max(60).optional().nullable(),
  capacity: z.number().int().min(0).max(100000).optional(),
  type: z
    .enum(LX_ROOM_TYPES, {
      message: `type must be one of: ${LX_ROOM_TYPES.join(', ')}`,
    })
    .optional(),
  amenities: amenitiesField,
  isActive: z.boolean().optional(),
});

export const getAllRoomsSchema = z.object({
  search: z.preprocess((val) => {
    if (typeof val !== 'string') return undefined;
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  }, z.string().optional()),
  type: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return undefined;
  }, z.array(z.enum(LX_ROOM_TYPES)).optional()),
  isActive: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    return val;
  }, z.boolean().optional()),
  page: z.preprocess((val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'string') return parseInt(val, 10);
    return val;
  }, z.number().int().min(1).max(100).default(10)),
  sortBy: z.enum(LX_ROOM_SORT_BY).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
