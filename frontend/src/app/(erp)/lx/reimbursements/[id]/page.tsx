"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CircleDollarSign, FileCheck2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchReimbursementByIdThunk,
    processReimbursementThunk,
    reviewReimbursementThunk,
} from "@/features/lx/reimbursement/reimbursementThunks";
import { BillGallery } from "../components/BillGallery";
import { ProcessPayoutDialog } from "../components/ProcessPayoutDialog";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});
const fmt = (v: string | null) =>
    v
        ? new Intl.DateTimeFormat("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
          }).format(new Date(v))
        : null;

export default function ReimbursementDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const dispatch = useAppDispatch();
    const r = useAppSelector((s) => s.lxReimbursement.selected);
    const loading = useAppSelector((s) => s.lxReimbursement.detailLoading);
    const role = useAppSelector((s) => s.lxActor.current?.role ?? null);
    const [processing, setProcessing] = useState(false);

    const { can } = useCan();

    useEffect(() => {
        void dispatch(fetchReimbursementByIdThunk(id));
    }, [dispatch, id]);

    const claim = r && r.id === id ? r : null;
    if (loading && !claim) return <p className="text-sm text-text-body">Loading…</p>;
    if (!claim) return <p className="text-sm text-text-body">Reimbursement not found.</p>;

    const canReview = can(PERMISSIONS.REVIEW_REIMBURSEMENT) && claim.status === "PENDING";
    const canProcess = can(PERMISSIONS.PROCESS_REIMBURSEMENT) && claim.status === "APPROVED";
    const rejected = claim.status === "REJECTED";

    const steps = [
        { key: "raised", label: "Raised", icon: Send, at: claim.createdAt, done: true },
        {
            key: "approved",
            label: "LX Approved",
            icon: FileCheck2,
            at: claim.reviewedAt,
            done: ["APPROVED", "PROCESSED"].includes(claim.status),
        },
        {
            key: "processed",
            label: "Finance Processed",
            icon: CircleDollarSign,
            at: claim.processedAt,
            done: claim.status === "PROCESSED",
        },
    ];

    const review = (action: "approve" | "reject") => {
        const rejectionReason =
            action === "reject" ? (window.prompt("Reason?") ?? undefined) : undefined;
        void dispatch(reviewReimbursementThunk({ id, payload: { action, rejectionReason } }));
    };

    const process = async (payoutTxnRef: string) => {
        const result = await dispatch(processReimbursementThunk({ id, payoutTxnRef }));
        return processReimbursementThunk.fulfilled.match(result);
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <Link
                href="/lx/reimbursements"
                className="inline-flex items-center gap-1.5 text-sm text-text-body hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" /> Back to reimbursements
            </Link>

            <div className="rounded-2xl border border-border-subtle bg-card p-6 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-primary-text">{claim.title}</h1>
                        <p className="mt-1 text-sm text-text-body">
                            {claim.submittedByName} · {claim.category}
                            {claim.purpose ? ` · ${claim.purpose}` : ""}
                        </p>
                    </div>
                    <span className="text-2xl font-bold">{inr.format(claim.amount)}</span>
                </div>

                {/* Timeline */}
                {!rejected ? (
                    <div className="mt-6 flex items-center">
                        {steps.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div
                                    key={s.key}
                                    className="flex flex-1 items-center last:flex-none"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className={`flex h-9 w-9 items-center justify-center rounded-full ${s.done ? "bg-success text-success-foreground" : "bg-border text-text-body"}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <p className="mt-1.5 text-xs font-medium">{s.label}</p>
                                        <p className="text-[10px] text-text-body">
                                            {fmt(s.at) ?? "—"}
                                        </p>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div
                                            className={`mx-1 h-0.5 flex-1 ${steps[i + 1].done ? "bg-success" : "bg-border"}`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="mt-4 rounded-lg bg-error-subtle p-3 text-sm text-error">
                        Rejected{claim.rejectionReason ? `: ${claim.rejectionReason}` : ""}
                    </p>
                )}

                {/* Who gets paid (derived) + the transaction that paid them */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-subtle p-3 text-sm">
                        <p className="mb-1 text-xs font-medium text-text-body">Payout to</p>
                        {/* Under D3 this is a pointer, not credentials — Finance resolves the
                account from the student profile in the core UI. */}
                        <p className="break-all font-mono text-xs">{claim.payoutRef || "—"}</p>
                    </div>
                    <div className="rounded-lg bg-subtle p-3 text-sm">
                        <p className="mb-1 text-xs font-medium text-text-body">
                            Transaction reference
                        </p>
                        {claim.payoutTxnRef ? (
                            <p className="break-all font-mono text-xs">{claim.payoutTxnRef}</p>
                        ) : (
                            <p className="text-text-body">
                                {claim.status === "PROCESSED"
                                    ? "Processed (no reference recorded)"
                                    : "Recorded by Finance when processed."}
                            </p>
                        )}
                    </div>
                </div>

                <BillGallery bills={claim.bills} />

                {(canReview || canProcess) && (
                    <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                        {canReview && (
                            <>
                                <Button
                                    variant="softSuccess"
                                    className="gap-1.5"
                                    onClick={() => review("approve")}
                                >
                                    <Check className="h-4 w-4" /> Approve (LX)
                                </Button>
                                <Button
                                    variant="softDanger"
                                    className="gap-1.5"
                                    onClick={() => review("reject")}
                                >
                                    <X className="h-4 w-4" /> Reject
                                </Button>
                            </>
                        )}
                        {canProcess && (
                            <Button
                                variant="softSuccess"
                                className="gap-1.5"
                                onClick={() => setProcessing(true)}
                            >
                                <CircleDollarSign className="h-4 w-4" /> Mark processed (Finance)
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {processing && (
                <ProcessPayoutDialog
                    payoutRef={claim.payoutRef}
                    onClose={() => setProcessing(false)}
                    onConfirm={process}
                />
            )}
        </div>
    );
}
