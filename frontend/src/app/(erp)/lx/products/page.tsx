"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./components/ProductCard";
import { SubmitProductForm } from "./components/SubmitProductForm";
import { useProducts, type ProductScope } from "./hooks/useProducts";
import type { LxProductCategory } from "@/features/lx/product/types";
import { Pagination } from "@/components/ui/table";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";

const CATEGORIES: LxProductCategory[] = [
    "WEBSITE",
    "WEB_APP",
    "MOBILE_APP",
    "HARDWARE",
    "DESIGN",
    "RESEARCH",
    "GAME",
    "OTHER",
];

export default function ProductsPage() {
    const { can } = useCan();
    const canCreate = can(PERMISSIONS.SUBMIT_PRODUCT);
    const canReview = can(PERMISSIONS.APPROVE_PRODUCT);

    const {
        products,
        loading,
        error,
        pagination,
        page,
        setPage,
        limit,
        scope,
        setScope,
        search,
        setSearch,
        category,
        setCategory,
        createProduct,
        reviewProduct,
    } = useProducts();
    const [open, setOpen] = useState(false);

    const tabs: { value: ProductScope; label: string; show: boolean }[] = [
        { value: "SHOWCASE", label: "Showcase", show: true },
        { value: "PENDING", label: "Pending review", show: canReview },
        { value: "MINE", label: "My submissions", show: true },
    ];

    const review = (id: string, action: "approve" | "reject") => {
        const rejectionReason =
            action === "reject"
                ? (window.prompt("Reason for rejection (optional):") ?? undefined)
                : undefined;
        void reviewProduct(id, { action, rejectionReason });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">Learner Products</h1>
                    <p className="mt-1 text-sm text-text-body">
                        Products and websites built by learners — showcased once an admin approves
                        them.
                    </p>
                </div>
                {canCreate && (
                    <Button className="shrink-0 gap-1.5" onClick={() => setOpen(true)}>
                        <Plus className="h-4 w-4" /> Submit Product
                    </Button>
                )}
            </div>

            {/* Scope tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs
                    .filter((t) => t.show)
                    .map((t) => (
                        <button
                            key={t.value}
                            onClick={() => setScope(t.value)}
                            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                                scope === t.value
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border text-text-body hover:bg-subtle"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
            </div>

            {/* Search + category */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-body" />
                        <input
                            className="w-full rounded-card border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-border-focus"
                            placeholder="Search products…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="rounded-card border border-border bg-card px-3 py-2 text-sm outline-none focus:border-border-focus"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as LxProductCategory | "")}
                    >
                        <option value="">All categories</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c.replace("_", " ")}
                            </option>
                        ))}
                    </select>
                </div>
                <span className="text-sm text-text-body">{pagination.totalCount} products</span>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            {loading && products.length === 0 ? (
                <p className="text-sm text-text-body">Loading products…</p>
            ) : products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                    <p className="text-sm text-text-body">
                        {scope === "SHOWCASE"
                            ? "No approved products yet — be the first to submit one!"
                            : scope === "PENDING"
                              ? "Nothing awaiting review."
                              : "You haven't submitted any products yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            showStatus={scope !== "SHOWCASE"}
                            canReview={canReview && scope === "PENDING"}
                            onReview={review}
                        />
                    ))}
                </div>
            )}

            {open && <SubmitProductForm onClose={() => setOpen(false)} onSubmit={createProduct} />}

            <Pagination
                page={page}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                limit={limit}
                onPage={setPage}
                noun="products"
            />
        </div>
    );
}
