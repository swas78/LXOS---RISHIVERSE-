"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClubCard } from "./components/ClubCard";
import { ClubFilters } from "./components/ClubFilters";
import { CreateClubForm } from "./components/CreateClubForm";
import { useClubs } from "./hooks/useClubs";
import { useBudgetAwareness, useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";
import type { LxClub } from "@/features/lx/club/types";
import { Pagination } from "@/components/ui/table";

export default function ClubsPage() {
    const {
        clubs,
        loading,
        error,
        pagination,
        page,
        setPage,
        limit,
        search,
        setSearch,
        category,
        setCategory,
        createClub,
        removeClub,
    } = useClubs();
    const { can } = useCan();
    const canManage = can(PERMISSIONS.MANAGE_CLUBS);
    const budgetAware = useBudgetAwareness();

    const [showForm, setShowForm] = useState(false);

    const handleDelete = (club: LxClub) => {
        if (window.confirm(`Remove “${club.name}”? This hides it from the platform.`)) {
            void removeClub(club.id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">Clubs</h1>
                    {/* The subtitle itself leaked the existence of budgets to people
              who have no budget role. It now describes only what they can see. */}
                    <p className="mt-1 text-sm text-text-body">
                        {budgetAware
                            ? "Student clubs across campus — categories, budgets, and their leads."
                            : "Student clubs across campus — what they do and who leads them."}
                    </p>
                </div>
                {canManage && (
                    <Button className="shrink-0 gap-1.5" onClick={() => setShowForm((v) => !v)}>
                        <Plus className="h-4 w-4" />
                        New Club
                    </Button>
                )}
            </div>

            {showForm && canManage && (
                <CreateClubForm onCreate={createClub} onClose={() => setShowForm(false)} />
            )}

            <ClubFilters
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                total={pagination.totalCount}
            />

            {error && <p className="text-sm text-error">{error}</p>}

            {loading && clubs.length === 0 ? (
                <p className="text-sm text-text-body">Loading clubs…</p>
            ) : clubs.length === 0 ? (
                <p className="text-sm text-text-body">No clubs match your filters.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {clubs.map((club) => (
                        <ClubCard
                            key={club.id}
                            club={club}
                            onDelete={canManage ? handleDelete : undefined}
                        />
                    ))}
                </div>
            )}

            <Pagination
                page={page}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                limit={limit}
                onPage={setPage}
                noun="clubs"
            />
        </div>
    );
}
