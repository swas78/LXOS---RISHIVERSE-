"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCalendarThunk } from "@/features/lx/calendar/calendarThunks";
import type { CalendarEvent } from "@/features/lx/calendar/types";

/*
 * Tinted chips rather than solid fills. At 11px these are "small text", so they
 * need 4.5:1 — and white on the info and warning fills lands at 3.1:1 and
 * 2.8:1. The subtle/strong pairing clears it for every type, and uses the same
 * tone per event type as EventTypeBadge so the calendar and the events list
 * agree on what a "Fest" looks like.
 */
const TYPE_CHIP: Record<string, { bg: string; fg: string }> = {
    CLUB: { bg: "var(--info-subtle)", fg: "var(--info-subtle-foreground)" },
    CLAN: { bg: "var(--secondary-subtle)", fg: "var(--secondary-subtle-foreground)" },
    LX: { bg: "var(--success-subtle)", fg: "var(--success-subtle-foreground)" },
    FEST: { bg: "var(--warning-subtle)", fg: "var(--warning-subtle-foreground)" },
};

const FALLBACK_CHIP = { bg: "var(--muted)", fg: "var(--text-subheading)" };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ymd(d: Date) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function CalendarPage() {
    const dispatch = useAppDispatch();
    const events = useAppSelector((s) => s.lxCalendar.events);
    const [cursor, setCursor] = useState(() => new Date());

    useEffect(() => {
        void dispatch(fetchCalendarThunk(undefined));
    }, [dispatch]);

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(
        cursor,
    );

    // Build the grid: leading blanks + days of month.
    const cells = useMemo(() => {
        const first = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const lead = first.getDay();
        const arr: (Date | null)[] = [];
        for (let i = 0; i < lead; i += 1) arr.push(null);
        for (let d = 1; d <= daysInMonth; d += 1) arr.push(new Date(year, month, d));
        while (arr.length % 7 !== 0) arr.push(null);
        return arr;
    }, [year, month]);

    const byDay = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        for (const e of events) {
            const d = new Date(e.startDate);
            const key = ymd(d);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(e);
        }
        return map;
    }, [events]);

    const todayKey = ymd(new Date());

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">Calendar</h1>
                    <p className="mt-1 text-sm text-text-body">
                        Every approved event across campus, in one view.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="rounded-card border border-border p-1.5 hover:bg-subtle"
                        onClick={() => setCursor(new Date(year, month - 1, 1))}
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-[9rem] text-center text-sm font-medium">
                        {monthLabel}
                    </span>
                    <button
                        className="rounded-card border border-border p-1.5 hover:bg-subtle"
                        onClick={() => setCursor(new Date(year, month + 1, 1))}
                        aria-label="Next month"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
                {Object.entries(TYPE_CHIP).map(([k, chip]) => (
                    <span key={k} className="inline-flex items-center gap-1.5 text-text-body">
                        {/* The dot is a graphic, not text, so it takes the strong
                            tone rather than the subtle fill the chip uses. */}
                        <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: chip.fg }}
                        />
                        {k}
                    </span>
                ))}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-card">
                <div className="min-w-[560px]">
                    <div className="grid grid-cols-7 border-b border-border bg-subtle text-center text-xs font-medium text-text-body">
                        {WEEKDAYS.map((d) => (
                            <div key={d} className="py-2">
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {cells.map((date, i) => {
                            const key = date ? ymd(date) : `blank-${i}`;
                            const dayEvents = date ? (byDay.get(ymd(date)) ?? []) : [];
                            const isToday = date && ymd(date) === todayKey;
                            return (
                                <div
                                    key={key}
                                    className="min-h-[90px] border-b border-r border-border p-1.5 last:border-r-0"
                                >
                                    {date && (
                                        <>
                                            <div
                                                className={`mb-1 text-xs ${
                                                    isToday
                                                        ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground"
                                                        : "text-text-body"
                                                }`}
                                            >
                                                {date.getDate()}
                                            </div>
                                            <div className="space-y-1">
                                                {dayEvents.slice(0, 3).map((e) => (
                                                    <Link
                                                        key={e.id}
                                                        href={`/lx/events/${e.id}`}
                                                        className="block truncate rounded px-1.5 py-0.5 text-[11px] font-medium"
                                                        style={{
                                                            background: (
                                                                TYPE_CHIP[e.type] ?? FALLBACK_CHIP
                                                            ).bg,
                                                            color: (
                                                                TYPE_CHIP[e.type] ?? FALLBACK_CHIP
                                                            ).fg,
                                                        }}
                                                        title={e.title}
                                                    >
                                                        {e.title}
                                                    </Link>
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <span className="text-[10px] text-text-body">
                                                        +{dayEvents.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
