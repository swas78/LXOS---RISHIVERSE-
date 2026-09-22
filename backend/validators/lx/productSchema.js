import { z } from 'zod';
import {
  LX_PRODUCT_CATEGORIES,
  LX_PRODUCT_SORT_BY,
  LX_PRODUCT_STATUSES,
} from '../../constants/lxProductConstant.js';

// Ordered list of core S3 pointers. Order IS the contract — `images[0]` is the
// cover on the showcase card, so an update that only reshuffles the array is a
// legitimate edit. Existence of each object is checked in the service; the
// regex here only rejects things that were never pointers to begin with.
const imagesField = z
  .array(
    z
      .string()
      .trim()
      .max(500)
      .regex(/^s3:[^:]+:.+$/, 'each image must look like s3:<bucket>:<key>'),
  )
  .max(8, 'at most 8 images');

const csvToArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    return val.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return undefined;
};

export const createProductSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(200),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().min(1, 'description is required').max(5000),
  url: z.string().trim().url('url must be a valid URL').max(500).optional().nullable().or(z.literal('')),
  repoUrl: z.string().trim().url('repoUrl must be a valid URL').max(500).optional().nullable().or(z.literal('')),
  images: imagesField.default([]),
  category: z
    .enum(LX_PRODUCT_CATEGORIES, {
      errorMap: () => ({ message: `category must be one of: ${LX_PRODUCT_CATEGORIES.join(', ')}` }),
    })
    .optional(),
  techStack: z.preprocess(csvToArray, z.array(z.string().trim()).optional()),
  tags: z.preprocess(csvToArray, z.array(z.string().trim()).optional()),
  teamMembers: z.preprocess(csvToArray, z.array(z.string().trim()).optional()),
  clubId: z.string().trim().optional().nullable(),
  clubName: z.string().trim().optional().nullable(),
});

export const updateProductSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().min(1).max(5000).optional(),
  url: z.string().trim().max(500).optional().nullable(),
  repoUrl: z.string().trim().max(500).optional().nullable(),
  // No default here: an absent `images` must leave the stored order alone,
  // while a present one replaces it wholesale (that is how reordering works).
  images: imagesField.optional(),
  category: z.enum(LX_PRODUCT_CATEGORIES).optional(),
  techStack: z.preprocess(csvToArray, z.array(z.string().trim()).optional()),
  tags: z.preprocess(csvToArray, z.array(z.string().trim()).optional()),
  teamMembers: z.preprocess(csvToArray, z.array(z.string().trim()).optional()),
  clubId: z.string().trim().optional().nullable(),
  clubName: z.string().trim().optional().nullable(),
  featured: z.boolean().optional(),
});

export const reviewProductSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().trim().max(1000).optional().nullable(),
});

export const getAllProductsSchema = z.object({
  search: z.preprocess((val) => {
    if (typeof val !== 'string') return undefined;
    const t = val.trim();
    return t === '' ? undefined : t;
  }, z.string().optional()),
  status: z.preprocess((val) => {
    if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
    return undefined;
  }, z.array(z.enum(LX_PRODUCT_STATUSES)).optional()),
  category: z.preprocess((val) => {
    if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
    return undefined;
  }, z.array(z.enum(LX_PRODUCT_CATEGORIES)).optional()),
  createdByRef: z.string().trim().optional(),
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
  sortBy: z.enum(LX_PRODUCT_SORT_BY).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
