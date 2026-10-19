"use client";

import { Button } from "@/components/ui/button";
import type { DemoItem } from "@/features/demo/item/types";

type Props = {
    items: DemoItem[];
    loading: boolean;
    onDelete: (id: string) => void;
};

export function ItemList({ items, loading, onDelete }: Props) {
    if (loading && items.length === 0) {
        return <p className="text-sm text-text-body">Loading…</p>;
    }

    if (items.length === 0) {
        return <p className="text-sm text-text-body">No items yet. Create one above.</p>;
    }

    return (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 p-4">
                    <div>
                        <p className="font-medium">{item.title}</p>
                        {item.description && (
                            <p className="mt-1 text-sm text-text-body">{item.description}</p>
                        )}
                        <p className="mt-2 text-xs text-text-body">Status: {item.status}</p>
                    </div>
                    <Button variant="outline" type="button" onClick={() => onDelete(item.id)}>
                        Delete
                    </Button>
                </li>
            ))}
        </ul>
    );
}
