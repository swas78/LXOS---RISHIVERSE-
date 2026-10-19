"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Paperclip, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    createReimbursementThunk,
    fetchReimbursementsThunk,
} from "@/features/lx/reimbursement/reimbursementThunks";
import type { CreateLxReimbursementPayload } from "@/features/lx/reimbursement/types";
import { SubmitReimbursementForm } from "./components/SubmitReimbursementForm";

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
    PENDING: { bg: "var(--warning-subtle)", fg: "var(--warning-subtle-foreground)" },
    APPROVED: { bg: "var(--info-subtle)", fg: "var(--info-subtle-foreground)" },
    PROCESSED: { bg: "var(--success-subtle)", fg: "var(--success-subtle-foreground)" },
    REJECTED: { bg: "var(--error-subtle)", fg: "var(--error-subtle-foreground)" },
};

export default function ReimbursementsPage() {
    const dispatch = useAppDispatch();
    const list = useAppSelector((s) => s.lxReimbursement.reimbursements);
    const loading = useAppSelector((s) => s.lxReimbursement.loading);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        void dispatch(fetchReimbursementsThunk(undefined));
    }, [dispatch]);

    const submit = async (payload: CreateLxReimbursementPayload) => {
        const result = await dispatch(createReimbursementThunk(payload));
        return createReimbursementThunk.fulfilled.match(result);
    };

    const stats = useMemo(() => {
        const by = (s: string) => list.filter((r) => r.status === s);
        const sum = (arr: typeof list) => arr.reduce((a, r) => a + r.amount, 0);
        return {
            total: { n: list.length, amt: sum(list) },
            pending: { n: by("PENDING").length, amt: sum(by("PENDING")) },
            approved: { n: by("APPROVED").length, amt: sum(by("APPROVED")) },
            processed: { n: by("PROCESSED").length, amt: sum(by("PROCESSED")) },
            rejected: { n: by("REJECTED").length, amt: sum(by("REJECTED")) },
        };
    }, [list]);

    const strip = [
        { label: "Submitted", ...stats.total, color: "var(--text-subheading)" },
        { label: "Pending", ...stats.pending, color: "var(--warning-subtle-foreground)" },
        { label: "Approved", ...stats.approved, color: "var(--info-subtle-foreground)" },
        { label: "Processed", ...stats.processed, color: "var(--success-subtle-foreground)" },
        { label: "Rejected", ...stats.rejected, color: "var(--error-subtle-foreground)" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">Reimbursements</h1>
                    <p className="mt-1 text-sm text-text-body">
                        One platform, not ten sheets — submit, track, and process claims end-to-end.
                    </p>
                </div>
                <Button className="shrink-0 gap-1.5" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" /> Submit Request
                </Button>
            </div>

            {/* Stat strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {strip.map((s) => (
                    <div
                        key={s.label}
                        className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs"
                    >
                        <p className="text-xs text-text-body">{s.label}</p>
                        <p className="mt-1 text-lg font-semibold" style={{ color: s.color }}>
                            {s.n}
                        </p>
                        <p className="text-xs text-text-body">{inr.format(s.amt)}</p>
                    </div>
                ))}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-card">
                <table className="w-full min-w-[720px] text-sm">
                    <thead className="border-b border-border bg-subtle text-left text-xs text-text-body">
                        <tr>
                            <th className="px-4 py-2.5 font-medium">Person</th>
                            <th className="px-4 py-2.5 font-medium">Purpose</th>
                            <th className="px-4 py-2.5 font-medium">Category</th>
                            <th className="px-4 py-2.5 font-medium">Amount</th>
                            <th className="px-4 py-2.5 font-medium">Status</th>
                            <th className="px-4 py-2.5 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading && list.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-text-body">
                                    Loading…
                                </td>
                            </tr>
                        ) : list.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-text-body">
                                    No reimbursements yet.
                                </td>
                            </tr>
                        ) : (
                            list.map((r) => {
                                const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.PENDING;
                                return (
                                    <tr key={r.id} className="hover:bg-subtle">
                                        <td className="px-4 py-3 font-medium">
                                            {r.submittedByName}
                                        </td>
                                        <td className="px-4 py-3 text-text-body">
                                            <span className="inline-flex items-center gap-1.5">
                                                {r.purpose || r.eventTitle || r.title}
                                                {r.bills.length > 0 && (
                                                    <span
                                                        className="inline-flex items-center gap-0.5 text-[11px]"
                                                        title={`${r.bills.length} receipt${r.bills.length === 1 ? "" : "s"}`}
                                                    >
                                                        <Paperclip className="h-3 w-3" />
                                                        {r.bills.length}
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-text-body">{r.category}</td>
                                        <td className="px-4 py-3">{inr.format(r.amount)}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                                                style={{ background: st.bg, color: st.fg }}
                                            >
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/lx/reimbursements/${r.id}`}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Open
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {open && <SubmitReimbursementForm onClose={() => setOpen(false)} onSubmit={submit} />}
        </div>
    );
}
