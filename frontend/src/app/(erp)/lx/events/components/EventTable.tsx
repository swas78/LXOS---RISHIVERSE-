"use client";

import Link from "next/link";
import type { LxEvent } from "@/features/lx/event/types";
import { EventTypeBadge } from "./EventTypeBadge";
import { EventStatusBadge } from "./EventStatusBadge";
import { formatDateRange } from "../utils/format";
import { SortableTh, type SortDir } from "@/components/ui/table";

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

/**
 * Only what the list endpoint can order by. A header that offers a sort the
 * server cannot honour is worse than no header at all — it looks broken.
 */
const COLUMNS = [
    { key: "title", label: "Event", sortable: true },
    { key: "type", label: "Type", sortable: false },
    { key: "startDate", label: "When", sortable: true },
    { key: "venue", label: "Venue", sortable: false },
    { key: "budgetAllocated", label: "Budget", sortable: false },
    { key: "status", label: "Status", sortable: true },
] as const;

/**
 * The table half of the Gate Pass pattern: the same rows the cards show, in a
 * form you can scan and order. Cards are better for browsing, a table is
 * better for comparing — the product offers both and lets the person choose.
 */
export function EventTable({
    events,
    sortBy,
    sortDir,
    onSort,
}: {
    events: LxEvent[];
    sortBy?: string | null;
    sortDir?: SortDir;
    onSort?: (key: string) => void;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
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
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => {
                            const venue = event.roomNames?.length
                                ? event.roomNames.join(", ")
                                : event.location || "—";
                            return (
                                <tr
                                    key={event.id}
                                    className="border-b border-border-subtle last:border-b-0 hover:bg-subtle"
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/lx/events/${event.id}`}
                                            className="font-medium text-text-heading hover:underline"
                                        >
                                            {event.title}
                                        </Link>
                                        <p className="mt-0.5 text-xs text-text-body">
                                            {event.clubName || event.clanName || "LX"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <EventTypeBadge type={event.type} />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-text-body">
                                        {formatDateRange(event.startDate, event.endDate)}
                                    </td>
                                    <td className="px-4 py-3 text-text-body">{venue}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-text-body">
                                        {event.budgetAllocated
                                            ? inr.format(event.budgetAllocated)
                                            : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <EventStatusBadge status={event.status} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
