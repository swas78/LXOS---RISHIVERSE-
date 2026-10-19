"use client";

import type { ReactNode } from "react";

import type { LxEventStatus, LxEventType } from "@/features/lx/event/types";
import { FilterBar, FilterDropdown, ResultCount, SearchInput } from "@/components/ui/filters";

const TYPES = [
    { value: "", label: "All" },
    { value: "CLUB", label: "Club" },
    { value: "CLAN", label: "Clan" },
    { value: "LX", label: "LX" },
    { value: "FEST", label: "Fest" },
];

const STATUSES = [
    { value: "", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
];

type Props = {
    search: string;
    setSearch: (v: string) => void;
    type: LxEventType | "";
    setType: (v: LxEventType | "") => void;
    status: LxEventStatus | "";
    setStatus: (v: LxEventStatus | "") => void;
    total: number;
    /** Right-hand slot — the view toggle lives here. */
    trailing?: ReactNode;
};

export function EventFilters({
    search,
    setSearch,
    type,
    setType,
    status,
    setStatus,
    total,
    trailing,
}: Props) {
    return (
        <FilterBar
            trailing={
                <>
                    <ResultCount count={total} noun="events" />
                    {trailing}
                </>
            }
        >
            <SearchInput value={search} onChange={setSearch} placeholder="Search events…" />
            <FilterDropdown
                label="Type"
                value={type}
                onChange={(v) => setType(v as LxEventType | "")}
                options={TYPES}
            />
            <FilterDropdown
                label="Status"
                value={status}
                onChange={(v) => setStatus(v as LxEventStatus | "")}
                options={STATUSES}
            />
        </FilterBar>
    );
}
