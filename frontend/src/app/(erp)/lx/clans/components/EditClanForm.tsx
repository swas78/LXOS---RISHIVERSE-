"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { updateClanThunk } from "@/features/lx/clan/clanThunks";
import type { LxClan } from "@/features/lx/clan/types";

// Admin edit of a clan — budget allocated & used, description, colour.
// (Points are changed through the point ledger via "Manage points".)
export function EditClanForm({ clan, onClose }: { clan: LxClan; onClose: () => void }) {
    const dispatch = useAppDispatch();
    const [form, setForm] = useState({
        budgetAllocated: String(clan.budgetAllocated ?? 0),
        budgetSpent: String(clan.budgetSpent ?? 0),
        description: clan.description ?? "",
        color: clan.color,
    });
    const [busy, setBusy] = useState(false);
    const field =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

    const save = async () => {
        setBusy(true);
        const res = await dispatch(
            updateClanThunk({
                id: clan.id,
                payload: {
                    budgetAllocated: Number(form.budgetAllocated) || 0,
                    budgetSpent: Number(form.budgetSpent) || 0,
                    description: form.description.trim(),
                    color: form.color,
                },
            }),
        );
        setBusy(false);
        if (updateClanThunk.fulfilled.match(res)) onClose();
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title={<>Edit {clan.name}</>}
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
                <label className="block text-xs text-text-body">
                    Colour
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            className="h-9 w-12 rounded-card border border-border"
                            value={form.color}
                            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                        />
                        <input
                            className={field}
                            value={form.color}
                            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                        />
                    </div>
                </label>
                <textarea
                    className={field}
                    rows={2}
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
            </div>
        </Sheet>
    );
}
