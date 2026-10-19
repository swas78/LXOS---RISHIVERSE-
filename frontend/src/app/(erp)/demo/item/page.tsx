"use client";

import { CreateItemForm } from "./components/CreateItemForm";
import { ItemList } from "./components/ItemList";
import { useDemoItems } from "./hooks/useDemoItems";

export default function DemoItemPage() {
    const { items, loading, error, search, setSearch, createItem, removeItem, pagination } =
        useDemoItems();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Demo Item</h1>
                <p className="mt-1 text-sm text-text-body">
                    Golden example for outsourcing teams — copy this page +{" "}
                    <code className="text-xs">features/demo/item</code> when building a real module.
                </p>
            </div>

            <CreateItemForm onCreate={createItem} />

            <div className="flex items-center gap-3">
                <input
                    className="w-full max-w-sm rounded-md border border-border px-3 py-2 text-sm"
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <span className="text-xs text-text-body">{pagination.totalRecords} total</span>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <ItemList items={items} loading={loading} onDelete={(id) => void removeItem(id)} />
        </div>
    );
}
