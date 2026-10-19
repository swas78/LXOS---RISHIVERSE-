"use client";

import { File, FileText, Image, Receipt, Trash2 } from "lucide-react";
import type { ComponentType } from "react";
import type { LxFile, LxFileType } from "@/features/lx/file/types";
import { SortableTh, type SortDir } from "@/components/ui/table";

const TYPE_META: Record<
    LxFileType,
    { label: string; icon: ComponentType<{ className?: string }>; bg: string; fg: string }
> = {
    BILL: {
        label: "Bill",
        icon: Receipt,
        bg: "var(--warning-subtle)",
        fg: "var(--warning-subtle-foreground)",
    },
    REPORT: {
        label: "Report",
        icon: FileText,
        bg: "var(--info-subtle)",
        fg: "var(--info-subtle-foreground)",
    },
    POSTER: {
        label: "Poster",
        icon: Image,
        bg: "var(--secondary-subtle)",
        fg: "var(--secondary-subtle-foreground)",
    },
    DOCUMENT: {
        label: "Document",
        icon: FileText,
        bg: "var(--success-subtle)",
        fg: "var(--success-subtle-foreground)",
    },
    OTHER: { label: "Other", icon: File, bg: "var(--muted)", fg: "var(--text-subheading)" },
};

export function formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(gb < 10 ? 1 : 0)} GB`;
}

function TypeBadge({ type }: { type: LxFileType }) {
    const meta = TYPE_META[type];
    const Icon = meta.icon;
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: meta.bg, color: meta.fg }}
        >
            <Icon className="h-3 w-3" />
            {meta.label}
        </span>
    );
}

type Props = {
    sortBy?: string | null;
    sortDir?: SortDir;
    onSort?: (key: string) => void;
    files: LxFile[];
    onDelete: (id: string) => void;
};

// Which columns can be ordered. The guide shows the sort glyph on every
// sortable header — without it there is no clue a column can be ordered at all.
const COLUMNS = [
    { key: "originalName", label: "File", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "size", label: "Size", sortable: true },
    // The list endpoint cannot order by uploader, so this header does not pretend to.
    { key: "uploadedByName", label: "Uploaded by", sortable: false },
    { key: "createdAt", label: "Date", sortable: true },
    { key: "tags", label: "Tags", sortable: false },
] as const;

export function FileTable({ files, onDelete, sortBy, sortDir, onSort }: Props) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card">
            {/* Desktop / tablet table */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                    <thead className="bg-subtle">
                        <tr>
                            {COLUMNS.map((c) => (
                                <SortableTh
                                    key={c.key}
                                    sortKey={c.key}
                                    activeKey={sortBy}
                                    dir={sortDir}
                                    onSort={c.sortable ? onSort : undefined}
                                >
                                    {c.label}
                                </SortableTh>
                            ))}
                            <th className="border-b border-border px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file) => {
                            const meta = TYPE_META[file.type];
                            const Icon = meta.icon;
                            return (
                                <tr
                                    key={file.id}
                                    className="border-b border-border last:border-0 hover:bg-subtle"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                                style={{ background: meta.bg, color: meta.fg }}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {file.originalName}
                                                </p>
                                                {file.description && (
                                                    <p className="truncate text-xs text-text-body">
                                                        {file.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <TypeBadge type={file.type} />
                                    </td>
                                    <td className="px-4 py-3 text-text-body">
                                        {formatBytes(file.size)}
                                    </td>
                                    <td className="px-4 py-3 text-text-body">
                                        {file.uploadedByName}
                                    </td>
                                    <td className="px-4 py-3 text-text-body">
                                        {new Date(file.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        {file.tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {file.tags.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-card bg-muted px-1.5 py-0.5 text-[11px] font-medium text-text-body"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {file.tags.length > 3 && (
                                                    <span className="text-[11px] text-text-body">
                                                        +{file.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-text-body">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => onDelete(file.id)}
                                            aria-label="Delete file record"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-card text-text-body transition hover:bg-error-subtle hover:text-error"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border md:hidden">
                {files.map((file) => {
                    const meta = TYPE_META[file.type];
                    const Icon = meta.icon;
                    return (
                        <div key={file.id} className="flex items-start gap-3 p-4">
                            <span
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                                style={{ background: meta.bg, color: meta.fg }}
                            >
                                <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="truncate font-medium">{file.originalName}</p>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(file.id)}
                                        aria-label="Delete file record"
                                        className="shrink-0 text-text-body transition hover:text-error"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <TypeBadge type={file.type} />
                                    <span className="text-xs text-text-body">
                                        {formatBytes(file.size)}
                                    </span>
                                    <span className="text-xs text-text-body">
                                        {new Date(file.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-text-body">
                                    By {file.uploadedByName}
                                </p>
                                {file.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {file.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-card bg-muted px-1.5 py-0.5 text-[11px] font-medium text-text-body"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
