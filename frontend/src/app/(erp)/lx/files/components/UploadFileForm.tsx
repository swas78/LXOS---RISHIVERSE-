"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import type { CreateLxFilePayload, LxFileType } from "@/features/lx/file/types";
import { uploadFileSchema } from "../schemas/fileSchema";

const TYPE_OPTIONS: { value: LxFileType; label: string }[] = [
    { value: "DOCUMENT", label: "Document" },
    { value: "BILL", label: "Bill" },
    { value: "REPORT", label: "Report" },
    { value: "POSTER", label: "Poster" },
    { value: "OTHER", label: "Other" },
];

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateLxFilePayload) => Promise<boolean>;
};

const emptyForm = {
    originalName: "",
    type: "DOCUMENT" as LxFileType,
    tags: "",
    path: "",
    size: "",
    eventId: "",
    clubId: "",
    description: "",
};

export function UploadFileForm({ open, onClose, onSubmit }: Props) {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    if (!open) return null;

    const set = (key: keyof typeof form, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = uploadFileSchema.safeParse(form);
        if (!parsed.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path[0];
                if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
            }
            setErrors(fieldErrors);
            return;
        }
        setErrors({});

        const v = parsed.data;
        const tags = (v.tags ?? "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const payload: CreateLxFilePayload = {
            originalName: v.originalName,
            filename: v.originalName,
            path: v.path && v.path.length > 0 ? v.path : `lx/files/${v.originalName}`,
            type: v.type,
            tags,
            ...(v.size ? { size: parseInt(v.size, 10) } : {}),
            ...(v.eventId ? { eventId: v.eventId } : {}),
            ...(v.clubId ? { clubId: v.clubId } : {}),
            ...(v.description ? { description: v.description } : {}),
        };

        setSubmitting(true);
        const ok = await onSubmit(payload);
        setSubmitting(false);
        if (ok) {
            setForm(emptyForm);
            onClose();
        }
    };

    const fieldClass =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

    return (
        <Sheet
            open
            onClose={onClose}
            title="Add file record"
            footer={
                <>
                    <SheetCancelButton type="button" onClick={onClose}>
                        Cancel
                    </SheetCancelButton>
                    <SheetSubmitButton type="submit" form="upload-file-form" disabled={submitting}>
                        {submitting ? "Saving…" : "Add file record"}
                    </SheetSubmitButton>
                </>
            }
        >
            <form id="upload-file-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium">File name</label>
                    <input
                        className={fieldClass}
                        placeholder="Annual Report 2026.pdf"
                        value={form.originalName}
                        onChange={(e) => set("originalName", e.target.value)}
                    />
                    {errors.originalName && (
                        <p className="mt-1 text-xs text-error">{errors.originalName}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Type</label>
                        <select
                            className={fieldClass}
                            value={form.type}
                            onChange={(e) => set("type", e.target.value as LxFileType)}
                        >
                            {TYPE_OPTIONS.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Size (bytes)</label>
                        <input
                            className={fieldClass}
                            placeholder="Optional"
                            inputMode="numeric"
                            value={form.size}
                            onChange={(e) => set("size", e.target.value)}
                        />
                        {errors.size && <p className="mt-1 text-xs text-error">{errors.size}</p>}
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Tags</label>
                    <input
                        className={fieldClass}
                        placeholder="Comma separated, e.g. finance, 2026, audit"
                        value={form.tags}
                        onChange={(e) => set("tags", e.target.value)}
                    />
                    {errors.tags && <p className="mt-1 text-xs text-error">{errors.tags}</p>}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">URL / path</label>
                    <input
                        className={fieldClass}
                        placeholder="https://… (optional link to the file)"
                        value={form.path}
                        onChange={(e) => set("path", e.target.value)}
                    />
                    {errors.path && <p className="mt-1 text-xs text-error">{errors.path}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Event ID</label>
                        <input
                            className={fieldClass}
                            placeholder="Optional"
                            value={form.eventId}
                            onChange={(e) => set("eventId", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Club ID</label>
                        <input
                            className={fieldClass}
                            placeholder="Optional"
                            value={form.clubId}
                            onChange={(e) => set("clubId", e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Description</label>
                    <textarea
                        className={fieldClass}
                        rows={3}
                        placeholder="Optional notes about this file"
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                    />
                    {errors.description && (
                        <p className="mt-1 text-xs text-error">{errors.description}</p>
                    )}
                </div>
            </form>
        </Sheet>
    );
}

export const SUPPORTED_FILE_TYPES = TYPE_OPTIONS;
