"use client";

import type { LxFileType } from "@/features/lx/file/types";
import { FilterBar, FilterDropdown, ResultCount, SearchInput } from "@/components/ui/filters";

const TYPES = [
    { value: "", label: "All" },
    { value: "BILL", label: "Bills" },
    { value: "REPORT", label: "Reports" },
    { value: "POSTER", label: "Posters" },
    { value: "DOCUMENT", label: "Documents" },
    { value: "OTHER", label: "Other" },
];

type Props = {
    search: string;
    setSearch: (v: string) => void;
    type: LxFileType | "";
    setType: (v: LxFileType | "") => void;
    total: number;
};

export function FileFilters({ search, setSearch, type, setType, total }: Props) {
    return (
        <FilterBar trailing={<ResultCount count={total} noun="files" />}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search files…" />
            <FilterDropdown
                label="Type"
                value={type}
                onChange={(v) => setType(v as LxFileType | "")}
                options={TYPES}
            />
        </FilterBar>
    );
}
