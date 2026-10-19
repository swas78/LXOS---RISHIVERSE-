"use client";

import type { LxRoomType } from "@/features/lx/room/types";
import { FilterBar, FilterDropdown, ResultCount, SearchInput } from "@/components/ui/filters";

const TYPES = [
    { value: "", label: "All" },
    { value: "CLASSROOM", label: "Classrooms" },
    { value: "SEMINAR", label: "Seminar Halls" },
    { value: "LAB", label: "Labs" },
    { value: "AUDITORIUM", label: "Auditoriums" },
    { value: "MEETING", label: "Meeting Rooms" },
    { value: "STUDIO", label: "Studios" },
    { value: "OUTDOOR", label: "Outdoor" },
];

type Props = {
    search: string;
    setSearch: (v: string) => void;
    type: LxRoomType | "";
    setType: (v: LxRoomType | "") => void;
    total: number;
};

export function RoomFilters({ search, setSearch, type, setType, total }: Props) {
    return (
        <FilterBar trailing={<ResultCount count={total} noun="rooms" />}>
            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search rooms by name or building…"
            />
            <FilterDropdown
                label="Type"
                value={type}
                onChange={(v) => setType(v as LxRoomType | "")}
                options={TYPES}
            />
        </FilterBar>
    );
}
