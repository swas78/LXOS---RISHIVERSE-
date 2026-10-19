"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { CreateLxClubPayload, LxClubCategory } from "@/features/lx/club/types";
import { createClubSchema } from "../schemas/clubSchema";
import { CATEGORY_OPTIONS } from "./categoryMeta";

type Props = {
    onCreate: (payload: CreateLxClubPayload) => Promise<boolean>;
    onClose: () => void;
};

export function CreateClubForm({ onCreate, onClose }: Props) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<LxClubCategory>("OTHER");
    const [budgetAllocated, setBudgetAllocated] = useState("10000");
    const [headName, setHeadName] = useState("");
    const [headEmail, setHeadEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        const parsed = createClubSchema.safeParse({
            name,
            description,
            category,
            budgetAllocated: budgetAllocated ? Number(budgetAllocated) : undefined,
            headName: headName || null,
            headEmail: headEmail || undefined,
        });
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Invalid form");
            return;
        }
        setBusy(true);
        setError(null);
        const ok = await onCreate({
            name: parsed.data.name,
            description: parsed.data.description,
            category: parsed.data.category,
            budgetAllocated: parsed.data.budgetAllocated,
            headName: parsed.data.headName ?? null,
            headEmail: parsed.data.headEmail || null,
        });
        setBusy(false);
        if (ok) {
            setName("");
            setDescription("");
            setCategory("OTHER");
            setBudgetAllocated("");
            setHeadName("");
            setHeadEmail("");
            onClose();
        }
    };

    const inputCls =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";
    const labelCls = "mb-1 block text-xs font-medium text-text-body";

    return (
        <form
            onSubmit={submit}
            className="space-y-4 rounded-2xl border border-border-subtle bg-card p-5 shadow-xs"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">New Club</h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-text-body hover:text-foreground"
                >
                    Cancel
                </button>
            </div>

            <div>
                <label className={labelCls}>Name</label>
                <input
                    className={inputCls}
                    placeholder="e.g. Robotics Club"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div>
                <label className={labelCls}>Description</label>
                <textarea
                    className={inputCls}
                    placeholder="What is this club about?"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className={labelCls}>Category</label>
                    <select
                        className={inputCls}
                        value={category}
                        onChange={(e) => setCategory(e.target.value as LxClubCategory)}
                    >
                        {CATEGORY_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelCls}>Budget Allocated (₹)</label>
                    <input
                        className={inputCls}
                        type="number"
                        min={0}
                        placeholder="0"
                        value={budgetAllocated}
                        onChange={(e) => setBudgetAllocated(e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelCls}>Head Name</label>
                    <input
                        className={inputCls}
                        placeholder="Club head"
                        value={headName}
                        onChange={(e) => setHeadName(e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelCls}>Head Email</label>
                    <input
                        className={inputCls}
                        type="email"
                        placeholder="head@rishihood.edu.in"
                        value={headEmail}
                        onChange={(e) => setHeadEmail(e.target.value)}
                    />
                </div>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                    {busy ? "Saving…" : "Create Club"}
                </Button>
            </div>
        </form>
    );
}
