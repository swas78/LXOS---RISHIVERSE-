"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { updateClubThunk } from "@/features/lx/club/clubThunks";
import type { LxClub, LxClubCategory } from "@/features/lx/club/types";

const CATEGORIES: { value: LxClubCategory; label: string }[] = [
    { value: "TECHNICAL", label: "Technical" },
    { value: "CULTURAL", label: "Cultural" },
    { value: "SPORTS", label: "Sports" },
    { value: "SOCIAL", label: "Social" },
    { value: "ACADEMIC", label: "Academic" },
    { value: "OTHER", label: "Other" },
];

// Admin edit of a club — name, description, category, budget allocated & used,
// head, active. Every field the admin might need to correct.
export function EditClubForm({ club, onClose }: { club: LxClub; onClose: () => void }) {
    const dispatch = useAppDispatch();
    const [form, setForm] = useState({
        name: club.name,
        description: club.description,
        category: club.category,
        budgetAllocated: String(club.budgetAllocated ?? 0),
        budgetSpent: String(club.budgetSpent ?? 0),
        headName: club.headName ?? "",
        headEmail: club.headEmail ?? "",
        isActive: club.isActive,
    });
    const [busy, setBusy] = useState(false);
    const field =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

    const save = async () => {
        if (!form.name.trim()) return;
        setBusy(true);
        const res = await dispatch(
            updateClubThunk({
                id: club.id,
                payload: {
                    name: form.name.trim(),
                    description: form.description.trim(),
                    category: form.category,
                    budgetAllocated: Number(form.budgetAllocated) || 0,
                    budgetSpent: Number(form.budgetSpent) || 0,
                    headName: form.headName.trim() || null,
                    headEmail: form.headEmail.trim() || null,
                    isActive: form.isActive,
                },
            }),
        );
        setBusy(false);
        if (updateClubThunk.fulfilled.match(res)) onClose();
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title={<>Edit {club.name}</>}
            footer={
                <>
                    <SheetCancelButton onClick={onClose}>Cancel</SheetCancelButton>
                    <SheetSubmitButton onClick={save} disabled={busy}>
                        {busy ? "Saving…" : "Save changes"}
                    </SheetSubmitButton>
                </>
            }
        >
            <div className="space-y-3">
                <input
                    className={field}
                    placeholder="Club name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <textarea
                    className={field}
                    rows={2}
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-text-body">
                        Category
                        <select
                            className={field}
                            value={form.category}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    category: e.target.value as LxClubCategory,
                                }))
                            }
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs text-text-body">
                        Active
                        <select
                            className={field}
                            value={form.isActive ? "yes" : "no"}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, isActive: e.target.value === "yes" }))
                            }
                        >
                            <option value="yes">Active</option>
                            <option value="no">Inactive</option>
                        </select>
                    </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-text-body">
                        Budget allocated (₹)
                        <input
                            type="number"
                            className={field}
                            value={form.budgetAllocated}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, budgetAllocated: e.target.value }))
                            }
                        />
                    </label>
                    <label className="text-xs text-text-body">
                        Used / spent (₹)
                        <input
                            type="number"
                            className={field}
                            value={form.budgetSpent}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, budgetSpent: e.target.value }))
                            }
                        />
                    </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        className={field}
                        placeholder="Head name"
                        value={form.headName}
                        onChange={(e) => setForm((f) => ({ ...f, headName: e.target.value }))}
                    />
                    <input
                        className={field}
                        placeholder="Head email"
                        value={form.headEmail}
                        onChange={(e) => setForm((f) => ({ ...f, headEmail: e.target.value }))}
                    />
                </div>
            </div>
        </Sheet>
    );
}
