"use client";

import { useEffect, useState } from "react";
import { Check, FileText, ImageIcon, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/lx/FileUploader";
import { attachmentUrl, type LxAttachment } from "@/features/upload/uploadApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    createExpenseThunk,
    fetchExpensesThunk,
    verifyExpenseThunk,
} from "@/features/lx/expense/expenseThunks";
import type { LxExpenseCategory } from "@/features/lx/expense/types";
import { eventApi } from "@/features/lx/event/eventApi";

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const CATEGORIES: LxExpenseCategory[] = [
    "VENUE",
    "FOOD",
    "EQUIPMENT",
    "DECORATION",
    "PRIZES",
    "MARKETING",
    "OTHER",
];

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
    PENDING: { bg: "var(--warning-subtle)", fg: "var(--warning-subtle-foreground)" },
    APPROVED: { bg: "var(--success-subtle)", fg: "var(--success-subtle-foreground)" },
    REJECTED: { bg: "var(--error-subtle)", fg: "var(--error-subtle-foreground)" },
};

type EventLite = { id: string; title: string };

/**
 * A verifier is approving money against these, so the receipt has to be one
 * click away from the row — not behind a detail page that does not exist yet.
 */
function BillLinks({ bills }: { bills: LxAttachment[] }) {
    if (bills.length === 0) return <span className="text-text-body">—</span>;
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {bills.map((b) => {
                const href = attachmentUrl(b);
                const image = b.contentType?.startsWith("image/");
                return (
                    <a
                        key={b.s3Path}
                        href={href ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={b.fileName}
                        className="block h-9 w-9 shrink-0 overflow-hidden rounded border border-border hover:border-primary"
                    >
                        {image && href ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={href}
                                alt={b.fileName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center">
                                {image ? (
                                    <ImageIcon className="h-4 w-4 text-text-body" />
                                ) : (
                                    <FileText className="h-4 w-4 text-text-body" />
                                )}
                            </span>
                        )}
                    </a>
                );
            })}
        </div>
    );
}

export default function ExpensesPage() {
    const dispatch = useAppDispatch();
    const expenses = useAppSelector((s) => s.lxExpense.expenses);
    const loading = useAppSelector((s) => s.lxExpense.loading);
    const [events, setEvents] = useState<EventLite[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        eventId: "",
        title: "",
        amount: "",
        category: "OTHER" as LxExpenseCategory,
    });
    const [bills, setBills] = useState<LxAttachment[]>([]);

    useEffect(() => {
        void dispatch(fetchExpensesThunk(undefined));
        // Event picker: the whole list is wanted for a <select>, and 100 is core's
        // cap. Routed through eventApi rather than raw axios.
        void eventApi
            .getAll({ limit: 100 })
            .then((r) => setEvents(r.data.map((e: EventLite) => ({ id: e.id, title: e.title }))))
            .catch(() => {});
    }, [dispatch]);

    const submit = async () => {
        if (!form.eventId || !form.title || !form.amount) return;
        const ev = events.find((e) => e.id === form.eventId);
        const ok = await dispatch(
            createExpenseThunk({
                eventId: form.eventId,
                eventTitle: ev?.title,
                title: form.title,
                amount: Number(form.amount),
                category: form.category,
                bills,
            }),
        );
        if (createExpenseThunk.fulfilled.match(ok)) {
            setForm({ eventId: "", title: "", amount: "", category: "OTHER" });
            setBills([]);
            setOpen(false);
        }
    };

    const verify = (id: string, action: "approve" | "reject") => {
        const rejectionReason =
            action === "reject"
                ? (window.prompt("Reason for rejection (optional):") ?? undefined)
                : undefined;
        void dispatch(verifyExpenseThunk({ id, payload: { action, rejectionReason } }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">Event Expenses</h1>
                    <p className="mt-1 text-sm text-text-body">
                        Spend logged against events. Approving an expense updates the event budget.
                    </p>
                </div>
                <Button className="shrink-0 gap-1.5" onClick={() => setOpen((v) => !v)}>
                    <Plus className="h-4 w-4" /> New Expense
                </Button>
            </div>

            {open && (
                <div className="space-y-3 rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <select
                            className="rounded-card border border-border px-3 py-2 text-sm"
                            value={form.eventId}
                            onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))}
                        >
                            <option value="">Select event…</option>
                            {events.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.title}
                                </option>
                            ))}
                        </select>
                        <input
                            className="rounded-card border border-border px-3 py-2 text-sm"
                            placeholder="Title"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        />
                        <input
                            className="rounded-card border border-border px-3 py-2 text-sm"
                            placeholder="Amount (₹)"
                            type="number"
                            value={form.amount}
                            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                        />
                        <select
                            className="rounded-card border border-border px-3 py-2 text-sm"
                            value={form.category}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    category: e.target.value as LxExpenseCategory,
                                }))
                            }
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <FileUploader
                        value={bills}
                        onChange={setBills}
                        variant="list"
                        label="Bills"
                        accept="image/*,application/pdf"
                        maxFiles={6}
                    />

                    <div className="flex justify-end">
                        <Button onClick={submit}>Save</Button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-card">
                <table className="w-full min-w-[760px] text-sm">
                    <thead className="border-b border-border bg-subtle text-left text-xs text-text-body">
                        <tr>
                            <th className="px-4 py-2.5 font-medium">Expense</th>
                            <th className="px-4 py-2.5 font-medium">Event</th>
                            <th className="px-4 py-2.5 font-medium">Category</th>
                            <th className="px-4 py-2.5 font-medium">Amount</th>
                            <th className="px-4 py-2.5 font-medium">Bills</th>
                            <th className="px-4 py-2.5 font-medium">Status</th>
                            <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading && expenses.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-center text-text-body">
                                    Loading…
                                </td>
                            </tr>
                        ) : expenses.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-6 text-center text-text-body">
                                    No expenses yet.
                                </td>
                            </tr>
                        ) : (
                            expenses.map((x) => {
                                const st = STATUS_STYLE[x.status] ?? STATUS_STYLE.PENDING;
                                return (
                                    <tr key={x.id}>
                                        <td className="px-4 py-3 font-medium">{x.title}</td>
                                        <td className="px-4 py-3 text-text-body">
                                            {x.eventTitle ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-text-body">{x.category}</td>
                                        <td className="px-4 py-3">{inr.format(x.amount)}</td>
                                        <td className="px-4 py-3">
                                            <BillLinks bills={x.bills ?? []} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                                                style={{ background: st.bg, color: st.fg }}
                                            >
                                                {x.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {x.status === "PENDING" && (
                                                <div className="inline-flex gap-1.5">
                                                    <button
                                                        onClick={() => verify(x.id, "approve")}
                                                        className="rounded-full bg-success-subtle p-1.5 text-success-subtle-foreground hover:bg-success-subtle/70"
                                                        title="Approve"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => verify(x.id, "reject")}
                                                        className="rounded-full bg-error-subtle p-1.5 text-error-subtle-foreground hover:bg-error-subtle/70"
                                                        title="Reject"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
