"use client";

import Link from "next/link";
import { MapPin, Users, Wallet } from "lucide-react";
import type { LxEvent } from "@/features/lx/event/types";
import { EventTypeBadge } from "./EventTypeBadge";
import { EventStatusBadge } from "./EventStatusBadge";
import { formatDateRange } from "../utils/format";

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

export function EventCard({ event }: { event: LxEvent }) {
    const venue = event.roomNames?.length ? event.roomNames.join(", ") : event.location || "—";
    const owner = event.clubName || event.clanName || "LX";
    return (
        <Link
            href={`/lx/events/${event.id}`}
            className="flex flex-col rounded-2xl border border-border-subtle bg-card p-5 shadow-xs transition hover:shadow-md"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="truncate font-semibold leading-tight">{event.title}</h3>
                    <p className="mt-0.5 text-xs text-text-body">{owner}</p>
                </div>
                <EventStatusBadge status={event.status} />
            </div>

            <p className="mt-2 line-clamp-2 text-sm text-text-body">{event.description}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-body">
                <span>{formatDateRange(event.startDate, event.endDate)}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-body">
                <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {venue}
                </span>
                {event.attendees > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> {event.attendees}
                    </span>
                )}
                {/* Event money follows the owning club/clan's visibility. When it is
            scoped away the chip is dropped rather than shown as ₹0. */}
                {event.budgetAllocated != null && event.budgetAllocated > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                        <Wallet className="h-3.5 w-3.5" /> {inr.format(event.budgetAllocated)}
                    </span>
                )}
            </div>

            <div className="mt-3">
                <EventTypeBadge type={event.type} />
            </div>
        </Link>
    );
}
