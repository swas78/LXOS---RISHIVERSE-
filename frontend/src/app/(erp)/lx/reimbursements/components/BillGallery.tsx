"use client";

import { FileText } from "lucide-react";
import { attachmentUrl, type LxAttachment } from "@/features/upload/uploadApi";

type Props = { bills: LxAttachment[] };

const isImage = (b: LxAttachment) => b.contentType?.startsWith("image/");

/**
 * Read-only view of a claim's receipts. An approver has to be able to look at
 * the bill before approving, so images render inline and everything opens full
 * size in a new tab.
 */
export function BillGallery({ bills }: Props) {
    return (
        <div className="mt-6 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium text-text-body">
                Bills / receipts {bills.length > 0 && `(${bills.length})`}
            </p>

            {bills.length === 0 ? (
                <p className="text-sm text-text-body">No receipt attached.</p>
            ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {bills.map((b) => {
                        const src = attachmentUrl(b);
                        return (
                            <a
                                key={b.s3Path}
                                href={src ?? undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={b.fileName}
                                className="group overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary"
                            >
                                <div className="flex aspect-video items-center justify-center bg-subtle">
                                    {isImage(b) && src ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={src}
                                            alt={b.fileName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <FileText className="h-6 w-6 text-text-body" />
                                    )}
                                </div>
                                <p className="truncate px-2 py-1.5 text-[11px] text-text-body group-hover:text-foreground">
                                    {b.fileName}
                                </p>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default BillGallery;
