"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "./components/EventCard";
import { EventFilters } from "./components/EventFilters";
import { CreateEventForm } from "./components/CreateEventForm";
import { useEvents } from "./hooks/useEvents";
import { Pagination, ViewToggle } from "@/components/ui/table";
import { EventTable } from "./components/EventTable";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";

export default function EventsPage() {
    const { can } = useCan();
    const {
        events,
        loading,
        error,
        pagination,
        page,
        setPage,
        limit,
        search,
        setSearch,
        type,
        setType,
        status,
        setStatus,
        createEvent,
        sortBy,
        sortDir,
        onSort,
    } = useEvents();
    const [open, setOpen] = useState(false);
    // Cards to browse, table to compare — the Gate Pass screens offer both.
    const [view, setView] = useState<"grid" | "table">("grid");

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">Events</h1>
                    <p className="mt-1 text-sm text-text-body">
                        The heartbeat of campus life — request, approve, and book in one place.
                    </p>
                </div>
                {can(PERMISSIONS.CREATE_EVENT) && (
                    <Button className="shrink-0 gap-1.5" onClick={() => setOpen(true)}>
                        <Plus className="h-4 w-4" /> New Event
                    </Button>
                )}
            </div>

            <EventFilters
                search={search}
                setSearch={setSearch}
                type={type}
                setType={setType}
                status={status}
                setStatus={setStatus}
                total={pagination.totalCount}
                trailing={<ViewToggle view={view} onChange={setView} />}
            />

            {error && <p className="text-sm text-error">{error}</p>}

            {loading && events.length === 0 ? (
                <p className="text-sm text-text-body">Loading events…</p>
            ) : events.length === 0 ? (
                <p className="text-sm text-text-body">No events match your filters.</p>
            ) : (
                <>
                    {view === "grid" ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {events.map((e) => (
                                <EventCard key={e.id} event={e} />
                            ))}
                        </div>
                    ) : (
                        <EventTable
                            events={events}
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={onSort}
                        />
                    )}
                </>
            )}

            <CreateEventForm open={open} onClose={() => setOpen(false)} onCreate={createEvent} />

            <Pagination
                page={page}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                limit={limit}
                onPage={setPage}
                noun="events"
            />
        </div>
    );
}
