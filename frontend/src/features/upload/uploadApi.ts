import api from "@/lib/axios";

/**
 * Upload client — deliberately mirrors rishiverse-frontend-v2's existing
 * `src/features/upload/uploadApi.ts` (getPresignedUrl / uploadToS3).
 *
 * HANDOFF: production already has this file. Delete this copy and change the
 * imports in the LX pages — or, if you want zero import churn, just flip
 * UPLOAD_BASE below from "/lx/upload" to "/upload". The request/response
 * shapes are identical either way, because the kit's dev shim mirrors core's
 * endpoint byte-for-byte (see backend services/lx/uploadService.js).
 *
 * Do NOT add a second axios instance or talk to S3 from a component. The flow
 * is always: component -> hook -> this module.
 */
const UPLOAD_BASE = "/lx/upload";

/** Core's accepted upload categories. */
export type UploadType = "img" | "image" | "pdf" | "video" | "document";

export type PresignedUrlResponse = {
    message: string;
    uploadUrl: string;
    /** Durable pointer: `s3:<bucket>:<key>`. This is what gets persisted. */
    s3Path: string;
    expiresIn: number;
};

/**
 * One stored attachment. Matches the backend `attachmentSchema` and the shape
 * documented on `LxExpense.bills` / `LxReimbursement.bills`.
 */
export type LxAttachment = {
    s3Path: string;
    fileName: string;
    contentType: string;
    size: number;
    uploadedAt?: string;
    /** Signed, short-lived read URL. Present on reads only — never persisted. */
    url?: string | null;
};

/** Step 1 — ask the server where to put the bytes. */
export async function getPresignedUrl(params: {
    fileName: string;
    contentType: string;
    type: UploadType;
}): Promise<PresignedUrlResponse> {
    const { data } = await api.post<PresignedUrlResponse>(`${UPLOAD_BASE}/presigned-url`, params);
    return data;
}

/**
 * Step 2 — PUT the bytes to the returned URL.
 *
 * `Content-Type` must match the value passed to getPresignedUrl EXACTLY: in
 * production it is part of the S3 signature, so a mismatch is a 403.
 *
 * This deliberately uses a bare axios-style request without the app's JSON
 * default header, and does not send credentials — a signed S3 URL carries its
 * own auth in the query string.
 */
export async function uploadToS3(
    uploadUrl: string,
    file: File,
    contentType: string,
    onProgress?: (percent: number) => void,
): Promise<void> {
    // A relative URL means the kit's dev shim (same origin as the API); an
    // absolute one means real S3. axios handles both, but only the former should
    // carry our baseURL.
    const isAbsolute = /^https?:\/\//i.test(uploadUrl);

    await api.put(uploadUrl, file, {
        baseURL: isAbsolute ? undefined : api.defaults.baseURL,
        headers: { "Content-Type": contentType },
        transformRequest: [(d) => d], // don't let axios JSON-stringify the File
        onUploadProgress: (e) => {
            if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
        },
    });
}

/** Pick the core upload category for a browser File. */
export function uploadTypeFor(file: File): UploadType {
    if (file.type.startsWith("image/")) return "img";
    if (file.type === "application/pdf") return "pdf";
    if (file.type.startsWith("video/")) return "video";
    return "document";
}

/**
 * Convenience: presign + PUT, returning the attachment record to persist.
 * This is the only function most callers need.
 */
export async function uploadFile(
    file: File,
    onProgress?: (percent: number) => void,
): Promise<LxAttachment> {
    const contentType = file.type || "application/octet-stream";
    const { uploadUrl, s3Path } = await getPresignedUrl({
        fileName: file.name,
        contentType,
        type: uploadTypeFor(file),
    });

    await uploadToS3(uploadUrl, file, contentType, onProgress);

    return {
        s3Path,
        fileName: file.name,
        contentType,
        size: file.size,
        uploadedAt: new Date().toISOString(),
    };
}

/**
 * Turn a stored `s3:<bucket>:<key>` pointer into something an <img> can load.
 *
 * Reads normally arrive with `url` already populated (core's s3UrlMiddleware
 * signs it server-side). This is the fallback for pointers that did not go
 * through that middleware.
 */
export function s3PathToUrl(s3Path?: string | null): string | null {
    if (!s3Path) return null;
    const m = /^s3:[^:]+:(.+)$/.exec(s3Path);
    if (!m) return s3Path.startsWith("http") ? s3Path : null;
    const base = api.defaults.baseURL ?? "";
    return `${base}${UPLOAD_BASE}/object/${encodeURIComponent(m[1])}`;
}

/** Resolve an attachment's displayable URL, preferring a server-signed one. */
export function attachmentUrl(a: Pick<LxAttachment, "s3Path" | "url">): string | null {
    return a.url ?? s3PathToUrl(a.s3Path);
}
