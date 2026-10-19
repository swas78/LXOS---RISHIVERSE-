"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { attachmentUrl, uploadFile, type LxAttachment } from "@/features/upload/uploadApi";

type Props = {
    value: LxAttachment[];
    onChange: (next: LxAttachment[]) => void;
    /** `image/*`, `application/pdf`, … Defaults to images + PDF. */
    accept?: string;
    /** Hard cap on how many files may be attached. */
    maxFiles?: number;
    /** Per-file size cap in MB. Core allows 10 MB images / 5 MB PDFs. */
    maxSizeMb?: number;
    label?: string;
    hint?: string;
    /** `grid` shows image thumbnails; `list` shows filename rows. */
    variant?: "grid" | "list";
    disabled?: boolean;
};

const isImage = (a: LxAttachment) => a.contentType?.startsWith("image/");

/** Turn an `accept` attribute into something a person can read. */
const describeAccept = (accept: string) => {
    const parts = accept
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    const labels = parts.map((a) => {
        if (a === "image/*") return "images";
        if (a === "application/pdf") return "PDF";
        if (a === "video/*") return "video";
        return a
            .replace(/^\./, "")
            .replace(/^[a-z]+\//, "")
            .toUpperCase();
    });
    return [...new Set(labels)].join(", ") || "any file";
};

export function FileUploader({
    value,
    onChange,
    accept = "image/*,application/pdf",
    maxFiles = 6,
    maxSizeMb = 10,
    label = "Attachments",
    hint,
    variant = "grid",
    disabled = false,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [dragging, setDragging] = useState(false);

    const remaining = maxFiles - value.length;

    const handleFiles = useCallback(
        async (files: FileList | null) => {
            if (!files || files.length === 0) return;

            const picked = Array.from(files);
            if (picked.length > remaining) {
                toast.error(
                    `You can attach ${maxFiles} file${maxFiles === 1 ? "" : "s"} at most — taking the first ${remaining}.`,
                );
            }
            const batch = picked.slice(0, Math.max(remaining, 0));
            if (batch.length === 0) return;

            const tooBig = batch.filter((f) => f.size > maxSizeMb * 1024 * 1024);
            if (tooBig.length > 0) {
                toast.error(
                    `${tooBig.map((f) => f.name).join(", ")} exceeds the ${maxSizeMb} MB limit.`,
                );
            }
            const ok = batch.filter((f) => f.size <= maxSizeMb * 1024 * 1024);
            if (ok.length === 0) return;

            setBusy(true);
            const uploaded: LxAttachment[] = [];
            for (const file of ok) {
                try {
                    const att = await uploadFile(file, (p) =>
                        setProgress((s) => ({ ...s, [file.name]: p })),
                    );
                    uploaded.push(att);
                } catch {
                    toast.error(`Couldn't upload ${file.name}.`);
                } finally {
                    setProgress((s) => {
                        // Drop this file's entry. Destructuring it out would leave an
                        // unused binding, so the key is removed explicitly.
                        const next = { ...s };
                        delete next[file.name];
                        return next;
                    });
                }
            }
            setBusy(false);

            if (uploaded.length > 0) {
                onChange([...value, ...uploaded]);
                toast.success(
                    `${uploaded.length} file${uploaded.length === 1 ? "" : "s"} uploaded.`,
                );
            }
        },
        [maxFiles, maxSizeMb, onChange, remaining, value],
    );

    const remove = (s3Path: string) => onChange(value.filter((a) => a.s3Path !== s3Path));

    const inFlight = Object.entries(progress);

    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
                <label className="text-sm font-medium">{label}</label>
                <span className="text-xs text-text-body">
                    {value.length}/{maxFiles}
                </span>
            </div>

            {hint && <p className="text-xs text-text-body">{hint}</p>}

            {/* Drop zone */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled && remaining > 0) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (!disabled && remaining > 0) void handleFiles(e.dataTransfer.files);
                }}
                onClick={() => !disabled && remaining > 0 && inputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition ${
                    dragging ? "border-primary bg-primary/5" : "border-border hover:bg-subtle"
                } ${disabled || remaining <= 0 ? "pointer-events-none opacity-50" : ""}`}
            >
                {busy ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                    <Upload className="h-5 w-5 text-text-body" />
                )}
                <p className="mt-1.5 text-xs text-text-body">
                    {remaining <= 0
                        ? "Attachment limit reached"
                        : busy
                          ? "Uploading…"
                          : "Drag files here, or click to browse"}
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={maxFiles > 1}
                    hidden
                    onChange={(e) => {
                        void handleFiles(e.target.files);
                        e.target.value = ""; // let the same file be re-picked
                    }}
                />
            </div>

            {/*
             * The constraints, stated before the attempt rather than after it.
             * The widget guide puts this line under every dropzone, and the
             * component already knows both values — leaving them out meant a
             * person only discovered the limit by tripping over it.
             */}
            <p className="mt-1.5 text-xs text-text-body">
                Supported: {describeAccept(accept)}
                <span className="mx-1.5 text-border-strong">|</span>
                Max file size: {maxSizeMb} mb
            </p>

            {/* In-flight progress */}
            {inFlight.length > 0 && (
                <ul className="space-y-1">
                    {inFlight.map(([name, pct]) => (
                        <li key={name} className="text-xs text-text-body">
                            <div className="flex justify-between gap-2">
                                <span className="truncate">{name}</span>
                                <span>{pct}%</span>
                            </div>
                            <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-border">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Uploaded */}
            {value.length > 0 &&
                (variant === "grid" ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {value.map((a) => {
                            const src = attachmentUrl(a);
                            return (
                                <div
                                    key={a.s3Path}
                                    className="group relative aspect-video overflow-hidden rounded-card border border-border bg-subtle"
                                >
                                    {isImage(a) && src ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={src}
                                            alt={a.fileName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center gap-1 p-1">
                                            <FileText className="h-5 w-5 text-text-body" />
                                            <span className="line-clamp-2 text-center text-[10px] text-text-body">
                                                {a.fileName}
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => remove(a.s3Path)}
                                        aria-label={`Remove ${a.fileName}`}
                                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <ul className="divide-y divide-border rounded-card border border-border">
                        {value.map((a) => {
                            const src = attachmentUrl(a);
                            return (
                                <li key={a.s3Path} className="flex items-center gap-2 px-2.5 py-2">
                                    {isImage(a) ? (
                                        <ImageIcon className="h-4 w-4 shrink-0 text-text-body" />
                                    ) : (
                                        <FileText className="h-4 w-4 shrink-0 text-text-body" />
                                    )}
                                    {src ? (
                                        <a
                                            href={src}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 truncate text-xs hover:underline"
                                        >
                                            {a.fileName}
                                        </a>
                                    ) : (
                                        <span className="flex-1 truncate text-xs">
                                            {a.fileName}
                                        </span>
                                    )}
                                    <span className="shrink-0 text-[10px] text-text-body">
                                        {(a.size / 1024).toFixed(0)} KB
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => remove(a.s3Path)}
                                        aria-label={`Remove ${a.fileName}`}
                                        className="shrink-0 rounded p-0.5 text-text-body hover:bg-muted hover:text-foreground"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ))}
        </div>
    );
}

export default FileUploader;
