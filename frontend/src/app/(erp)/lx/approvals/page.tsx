"use client";

import { useEffect, useState } from "react";
import {
    Award,
    CalendarDays,
    Check,
    DoorOpen,
    PackageSearch,
    Receipt,
    Rocket,
    Wallet,
    X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { actOnApprovalThunk, fetchApprovalsThunk } from "@/features/lx/approval/approvalThunks";
import type { ApprovalItem, ApprovalType } from "@/features/lx/approval/types";
import { formatDate } from "../events/utils/format";

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const TYPE_META: Record<ApprovalType, { label: string; icon: typeof Award; color: string }> = {
    EVENT: { label: "Event", icon: CalendarDays, color: "var(--chart-2)" },
    ACHIEVEMENT: { label: "Achievement", icon: Award, color: "var(--chart-5)" },
    REIMBURSEMENT: { label: "Reimbursement", icon: Receipt, color: "var(--chart-4)" },
    EXPENSE: { label: "Expense", icon: Wallet, color: "var(--success)" },
    PRODUCT: { label: "Learner Product", icon: Rocket, color: "var(--chart-3)" },
    BOOKING: { label: "Room Booking", icon: DoorOpen, color: "var(--info)" },
    LOST_FOUND: { label: "Lost & Found", icon: PackageSearch, color: "var(--secondary)" },
};

const FILTERS: { value: ApprovalType | "ALL"; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "EVENT", label: "Events" },
    { value: "ACHIEVEMENT", label: "Achievements" },
    { value: "REIMBURSEMENT", label: "Reimbursements" },
    { value: "EXPENSE", label: "Expenses" },
    { value: "LOST_FOUND", label: "Lost & Found" },
    { value: "PRODUCT", label: "Products" },
    { value: "BOOKING", label: "Bookings" },
];

export default function ApprovalsPage() {
    const dispatch = useAppDispatch();
    const items = useAppSelector((s) => s.lxApproval.items);
    const meta = useAppSelector((s) => s.lxApproval.meta);
    const loading = useAppSelector((s) => s.lxApproval.loading);
    const [filter, setFilter] = useState<ApprovalType | "ALL">("ALL");

    useEffect(() => {
        void dispatch(fetchApprovalsThunk(undefined));
    }, [dispatch]);

    const shown = filter === "ALL" ? items : items.filter((i) => i.type === filter);

    const act = (item: ApprovalItem, action: "approve" | "reject" | "process") => {
        let rejectionReason: string | undefined;
        if (action === "reject") {
            rejectionReason = window.prompt("Reason for rejection (optional):") ?? undefined;
        }
        void dispatch(
            actOnApprovalThunk({ type: item.type, id: item.id, action, rejectionReason }),
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-primary-text">Approvals</h1>
                <p className="mt-1 text-sm text-text-body">
                    Everything that needs a decision, in one queue.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => {
                    const count = f.value === "ALL" ? items.length : (meta?.counts?.[f.value] ?? 0);
                    const active = filter === f.value;
                    return (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                                active
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border text-text-body hover:bg-subtle"
                            }`}
                        >
                            {f.label} {count > 0 && <span className="opacity-80">({count})</span>}
                        </button>
                    );
                })}
            </div>

            {loading && items.length === 0 ? (
                <p className="text-sm text-text-body">Loading approvals…</p>
            ) : shown.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                    <p className="text-sm text-text-body">
                        Nothing pending. You&apos;re all caught up.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border-subtle bg-card">
                    {shown.map((item) => {
                        const meta2 = TYPE_META[item.type];
                        const Icon = meta2.icon;
                        const needsProcess =
                            item.type === "REIMBURSEMENT" && item.status === "APPROVED";
                        return (
                            <div
                                key={`${item.type}-${item.id}`}
                                className="flex items-center gap-3 p-4"
                            >
                                <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                    style={{ background: `${meta2.color}1a`, color: meta2.color }}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="truncate font-medium">{item.title}</span>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-text-body">
                                            {meta2.label}
                                        </span>
                                        {needsProcess && (
                                            <span className="rounded-full bg-info-subtle px-2 py-0.5 text-[11px] font-medium text-info">
                                                Awaiting finance
                                            </span>
                                        )}
                                    </div>
                                    <p className="truncate text-xs text-text-body">
                                        {item.subtitle} · {item.requestedBy} ·{" "}
                                        {formatDate(item.date)}
                                        {item.amount != null && ` · ${inr.format(item.amount)}`}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    {needsProcess ? (
                                        <button
                                            onClick={() => act(item, "process")}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-3 py-1.5 text-sm font-medium text-success-subtle-foreground hover:bg-success-subtle/70"
                                        >
                                            <Check className="h-4 w-4" /> Process payment
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => act(item, "approve")}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-3 py-1.5 text-sm font-medium text-success-subtle-foreground hover:bg-success-subtle/70"
                                            >
                                                <Check className="h-4 w-4" /> Approve
                                            </button>
                                            <button
                                                onClick={() => act(item, "reject")}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-error-subtle px-3 py-1.5 text-sm font-medium text-error-subtle-foreground hover:bg-error-subtle/70"
                                            >
                                                <X className="h-4 w-4" /> Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
