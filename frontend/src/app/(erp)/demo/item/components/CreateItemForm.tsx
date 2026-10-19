"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { createItemSchema } from "../schemas/itemSchema";

type Props = {
    onCreate: (payload: {
        title: string;
        description?: string | null;
        status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
    }) => Promise<boolean>;
};

export function CreateItemForm({ onCreate }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        const parsed = createItemSchema.safeParse({
            title,
            description: description || null,
            status: "DRAFT",
        });
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Invalid form");
            return;
        }
        setBusy(true);
        setError(null);
        const ok = await onCreate(parsed.data);
        setBusy(false);
        if (ok) {
            setTitle("");
            setDescription("");
        }
    };

    return (
        <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Create item</h2>
            <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                placeholder="Description (optional)"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Create"}
            </Button>
        </form>
    );
}
