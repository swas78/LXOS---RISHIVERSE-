"use client";

import type { LxClubCategory } from "@/features/lx/club/types";
import { CATEGORY_OPTIONS } from "./categoryMeta";
import { FilterBar, FilterDropdown, ResultCount, SearchInput } from "@/components/ui/filters";

const OPTIONS = [{ value: "", label: "All" }, ...CATEGORY_OPTIONS];

type Props = {
    search: string;
    setSearch: (v: string) => void;
    category: LxClubCategory | "";
    setCategory: (v: LxClubCategory | "") => void;
    total: number;
};

export function ClubFilters({ search, setSearch, category, setCategory, total }: Props) {
    return (
        <FilterBar trailing={<ResultCount count={total} noun="clubs" />}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search clubs…" />
            <FilterDropdown
                label="Category"
                value={category}
                onChange={(v) => setCategory(v as LxClubCategory | "")}
                options={OPTIONS}
            />
        </FilterBar>
    );
}
