// ---------------------------------------------------------------------------
// DEV UPLOAD SHIM — LOCAL ONLY. NOT PART OF HANDOFF.
//
// Core already owns file uploads: `@aws-sdk/client-s3` is a RishiVerse-Backend
// dependency and `POST /api/v1/upload/presigned-url` is a live endpoint. This
// module must NOT add a second S3 client (lxos-core-pack/upload.md).
//
// So the kit fakes that endpoint byte-for-byte instead. Same request shape,
// same response shape, same `s3:<bucket>:<key>` pointer format — the only
// difference is that `uploadUrl` points at this server and the bytes land in
// `.uploads/` on disk rather than in S3.
//
// WHAT THIS BUYS US: the frontend upload flow (presign -> PUT -> persist the
// returned s3Path) is the REAL production flow. At handoff you delete this
// service and its routes and repoint one constant in the frontend:
//
//   src/features/upload/uploadApi.ts:  UPLOAD_BASE = "/lx/upload"  ->  "/upload"
//
// Nothing else changes. Bytes never pass through Express in production, and
// they only do here because there is no S3 in a local kit.
// ---------------------------------------------------------------------------
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import createContextLogger from '../../logger/contextLogger.js';

const logger = createContextLogger('lxUploadService');

// Stands in for the real bucket name so pointers look production-shaped.
const DEV_BUCKET = 'lx-dev-bucket';

// On-disk root for the fake bucket. Gitignored.
const UPLOAD_ROOT = path.resolve(process.cwd(), '.uploads');

// Mirrors core's accepted `type` values.
const TYPE_PREFIX = {
  img: 'img',
  image: 'img',
  pdf: 'pdf',
  video: 'video',
  document: 'document',
};

// Core's documented limits: 10 MB images, 5 MB PDFs.
export const MAX_BYTES = { img: 10 * 1024 * 1024, pdf: 5 * 1024 * 1024, default: 10 * 1024 * 1024 };

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Presigned URLs are short-lived in S3; mirror that so the UI shows the same
// expiry and we exercise the same "presign then immediately PUT" flow.
const EXPIRES_IN_SECONDS = 3600;

/** Strip anything that could escape the upload root or confuse a filesystem. */
const safeFileName = (name) =>
  String(name || 'file')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'file';

/** Build a core-shaped pointer: `s3:<bucket>:<prefix>/<uuid>-<name>`. */
export const buildS3Path = (prefix, fileName) =>
  `s3:${DEV_BUCKET}:${prefix}/${crypto.randomUUID()}-${safeFileName(fileName)}`;

/** Parse `s3:<bucket>:<key>` -> { bucket, key }, or null if not a pointer. */
export const parseS3Path = (s3Path) => {
  const m = /^s3:([^:]+):(.+)$/.exec(String(s3Path ?? ''));
  return m ? { bucket: m[1], key: m[2] } : null;
};

/**
 * Turn a stored pointer into a URL a browser can GET.
 *
 * PRODUCTION: core's `middleware/s3UrlMiddleware.js` does this, signing a
 * short-lived GET. Here we just point back at the local read route. Callers
 * should treat the result as ephemeral and never persist it.
 */
export const resolveS3Url = (s3Path) => {
  const parsed = parseS3Path(s3Path);
  if (!parsed) return null;
  return `/api/v1/lx/upload/object/${encodeURIComponent(parsed.key)}`;
};

/** Map a stored `s3Path` onto every attachment in a bills-style array. */
export const withResolvedUrls = (attachments) =>
  (Array.isArray(attachments) ? attachments : []).map((a) => ({
    ...a,
    url: resolveS3Url(a?.s3Path),
  }));

/**
 * Issue a "presigned" upload target. Mirrors core's response body exactly:
 * { message, uploadUrl, s3Path, expiresIn }.
 */
export const createPresignedUrlService = async ({ fileName, contentType, type }) => {
  const prefix = TYPE_PREFIX[type];
  if (!prefix) {
    return {
      success: false,
      statusCode: 400,
      message: `Unsupported upload type "${type}". Use one of: ${Object.keys(TYPE_PREFIX).join(', ')}`,
    };
  }

  if (prefix === 'img' && !ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return {
      success: false,
      statusCode: 400,
      message: `Unsupported image type "${contentType}". Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  const s3Path = buildS3Path(prefix, fileName);
  const { key } = parseS3Path(s3Path);

  return {
    success: true,
    statusCode: 200,
    message: 'Presigned upload URL generated successfully',
    data: {
      uploadUrl: `/api/v1/lx/upload/object/${encodeURIComponent(key)}`,
      s3Path,
      expiresIn: EXPIRES_IN_SECONDS,
    },
  };
};

/**
 * Accept the raw PUT body for a previously issued key. Dev-only: in production
 * this PUT goes straight to S3 and never reaches Express.
 */
export const putObjectService = async ({ key, body, contentType }) => {
  const parsed = path.normalize(key);
  if (parsed.startsWith('..') || path.isAbsolute(parsed)) {
    return { success: false, statusCode: 400, message: 'Invalid object key' };
  }

  const limit = parsed.startsWith('pdf/') ? MAX_BYTES.pdf : MAX_BYTES.default;
  if (body.length > limit) {
    return {
      success: false,
      statusCode: 413,
      message: `File exceeds the ${Math.round(limit / 1024 / 1024)} MB limit`,
    };
  }

  const dest = path.join(UPLOAD_ROOT, parsed);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, body);
  await fs.writeFile(`${dest}.meta`, JSON.stringify({ contentType, size: body.length }));

  logger.debug('Stored dev upload', { key: parsed, size: body.length });
  return { success: true, statusCode: 200, message: 'Uploaded', data: { key: parsed } };
};

/** Read an object back out of the fake bucket. */
export const getObjectService = async (key) => {
  const parsed = path.normalize(key);
  if (parsed.startsWith('..') || path.isAbsolute(parsed)) {
    return { success: false, statusCode: 400, message: 'Invalid object key' };
  }

  const src = path.join(UPLOAD_ROOT, parsed);
  try {
    const body = await fs.readFile(src);
    let contentType = 'application/octet-stream';
    try {
      contentType = JSON.parse(await fs.readFile(`${src}.meta`, 'utf8')).contentType ?? contentType;
    } catch {
      // No sidecar — fall back to the generic type.
    }
    return { success: true, statusCode: 200, message: 'OK', data: { body, contentType } };
  } catch {
    return { success: false, statusCode: 404, message: 'Object not found' };
  }
};

/**
 * Verify a client-supplied pointer actually exists before we persist it.
 *
 * upload.md: "Treat confirm as untrusted until you verify the object exists
 * (or at least that s3Path matches the presign prefix)." A client can POST any
 * string; without this a row can reference a file that was never uploaded.
 */
export const objectExists = async (s3Path) => {
  const parsed = parseS3Path(s3Path);
  if (!parsed) return false;
  const normalized = path.normalize(parsed.key);
  if (normalized.startsWith('..') || path.isAbsolute(normalized)) return false;
  try {
    await fs.access(path.join(UPLOAD_ROOT, normalized));
    return true;
  } catch {
    return false;
  }
};

export default {
  createPresignedUrlService,
  putObjectService,
  getObjectService,
  objectExists,
  resolveS3Url,
  withResolvedUrls,
  buildS3Path,
  parseS3Path,
};
