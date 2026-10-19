export type StoreItem = {
    id: string;
    title: string;
    description: string | null;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

const globalStore = globalThis as typeof globalThis & {
    __demoItems?: StoreItem[];
};

function db(): StoreItem[] {
    if (!globalStore.__demoItems) {
        globalStore.__demoItems = [
            {
                id: "demo-1",
                title: "Welcome item",
                description:
                    "Replace this module with yours — copy features/demo/item + this page.",
                status: "ACTIVE",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null,
            },
        ];
    }
    return globalStore.__demoItems;
}

export function listItems(search?: string) {
    const q = search?.trim().toLowerCase();
    return db().filter((i) => {
        if (i.deletedAt) return false;
        if (!q) return true;
        return i.title.toLowerCase().includes(q) || (i.description ?? "").toLowerCase().includes(q);
    });
}

export function createItem(input: {
    title: string;
    description?: string | null;
    status?: StoreItem["status"];
}) {
    const now = new Date().toISOString();
    const item: StoreItem = {
        id: `demo-${crypto.randomUUID()}`,
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? "DRAFT",
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
    };
    db().unshift(item);
    return item;
}

export function softDeleteItem(id: string) {
    const item = db().find((i) => i.id === id && !i.deletedAt);
    if (!item) return null;
    item.deletedAt = new Date().toISOString();
    item.updatedAt = item.deletedAt;
    return item;
}
