"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { CalendarRange, Download, Printer, RefreshCw } from "lucide-react";
import { Button, SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchReportThunk,
    fetchSemestersThunk,
    rolloverThunk,
} from "@/features/lx/report/reportThunks";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";
import { downloadReportCsvThunk } from "@/features/lx/report/reportThunks";

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

export default function ReportPage() {
    const dispatch = useAppDispatch();
    const { can } = useCan();
    const report = useAppSelector((s) => s.lxReport.report);
    const downloading = useAppSelector((s) => s.lxReport.downloading);
    const loading = useAppSelector((s) => s.lxReport.loading);
    const semesters = useAppSelector((s) => s.lxReport.semesters);
    const current = useAppSelector((s) => s.lxReport.current);
    const [semester, setSemester] = useState<string>("");
    const [rollOpen, setRollOpen] = useState(false);

    // The blob fetch and the browser download both live in reportApi + its
    // thunk; the page only asks for it.
    const downloadCsv = () => {
        void dispatch(
            downloadReportCsvThunk({ semester, filenameHint: semester || current || "current" }),
        );
    };

    const allowed = can(PERMISSIONS.GENERATE_REPORT);
    const canRollover = can(PERMISSIONS.MANAGE_SEMESTER);

    useEffect(() => {
        if (allowed) void dispatch(fetchSemestersThunk());
    }, [dispatch, allowed]);

    useEffect(() => {
        if (allowed) void dispatch(fetchReportThunk(semester || undefined));
    }, [dispatch, allowed, semester]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">LX Report</h1>
                    <p className="mt-1 text-sm text-text-body">
                        One report with events, budgets, achievements, reimbursements and clan
                        activity — for any semester.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-card border border-border bg-card px-2.5 py-1.5">
                        <CalendarRange className="h-4 w-4 text-text-body" />
                        <select
                            className="bg-transparent text-sm outline-none"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                        >
                            <option value="">{current ? `Current (${current})` : "Current"}</option>
                            {semesters.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        variant="outline"
                        className="gap-1.5"
                        onClick={downloadCsv}
                        disabled={downloading}
                    >
                        <Download className="h-4 w-4" />{" "}
                        {downloading ? "Preparing…" : "Download CSV"}
                    </Button>
                    <Button variant="outline" className="gap-1.5" onClick={() => window.print()}>
                        <Printer className="h-4 w-4" /> Print / PDF
                    </Button>
                    {canRollover && (
                        <Button className="gap-1.5" onClick={() => setRollOpen(true)}>
                            <RefreshCw className="h-4 w-4" /> Roll to new semester
                        </Button>
                    )}
                </div>
            </div>

            {loading && !report ? (
                <p className="text-sm text-text-body">Generating report…</p>
            ) : report ? (
                <div className="space-y-6">
                    {/* Report header (visible in print) */}
                    <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
                        <h2 className="text-lg font-semibold">LX Management OS — Report</h2>
                        <p className="text-sm text-text-body">
                            Semester:{" "}
                            <span className="font-medium text-foreground">{report.semester}</span> ·
                            Generated {new Date(report.generatedAt).toLocaleString("en-IN")}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                            {report.summary.map((m) => (
                                <div key={m.metric} className="rounded-lg border border-border p-3">
                                    <p className="text-xs text-text-body">{m.metric}</p>
                                    <p className="mt-1 text-lg font-semibold">
                                        {m.metric.includes("₹") ||
                                        m.metric.toLowerCase().includes("budget")
                                            ? inr.format(m.value)
                                            : m.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <BudgetTable title="Club Budgets" rows={report.clubBudgets} />
                    <BudgetTable title="Clan Budgets" rows={report.clanBudgets} showPoints />

                    <ReportTable
                        title="Events"
                        cols={[
                            "Title",
                            "Type",
                            "Org",
                            "Start",
                            "Status",
                            "Venue",
                            "Allocated",
                            "Spent",
                        ]}
                        rows={report.events.map((e) => [
                            e.title,
                            e.type,
                            e.org,
                            e.start,
                            e.status,
                            e.venue,
                            inr.format(e.allocated),
                            inr.format(e.spent),
                        ])}
                    />

                    <ReportTable
                        title="Achievements"
                        cols={["Title", "Category", "Org", "Points", "Status", "Date"]}
                        rows={report.achievements.map((a) => [
                            a.title,
                            a.category,
                            a.org,
                            String(a.points),
                            a.status,
                            a.date,
                        ])}
                    />

                    <ReportTable
                        title="Reimbursements"
                        cols={["Title", "By", "Amount", "Charged to", "Purpose", "Status"]}
                        rows={report.reimbursements.map((r) => [
                            r.title,
                            r.by,
                            inr.format(r.amount),
                            r.chargedTo,
                            r.purpose,
                            r.status,
                        ])}
                    />

                    <ReportTable
                        title="Clan Initiatives"
                        cols={["Title", "Clan", "Status", "Date"]}
                        rows={report.initiatives.map((it) => [
                            it.title,
                            it.clan,
                            it.status,
                            it.date,
                        ])}
                    />

                    <ReportTable
                        title="Clan Point History"
                        cols={["Clan", "Change", "Total", "Reason", "Date"]}
                        rows={report.pointHistory.map((h) => [
                            h.clan,
                            (h.delta >= 0 ? "+" : "") + h.delta,
                            String(h.points),
                            h.reason,
                            h.date,
                        ])}
                    />
                </div>
            ) : null}

            {rollOpen && (
                <RolloverModal
                    current={current}
                    onClose={() => setRollOpen(false)}
                    onDone={async (newSemester, resetAllocation) => {
                        await dispatch(rolloverThunk({ newSemester, resetAllocation }));
                        setRollOpen(false);
                        void dispatch(fetchSemestersThunk());
                        void dispatch(fetchReportThunk(undefined));
                        setSemester("");
                    }}
                />
            )}
        </div>
    );
}

function BudgetTable({
    title,
    rows,
    showPoints,
}: {
    title: string;
    rows: { name: string; allocated: number; used: number; remaining: number; points?: number }[];
    showPoints?: boolean;
}) {
    return (
        <ReportTable
            title={title}
            cols={
                showPoints
                    ? ["Name", "Points", "Allocated", "Used", "Remaining"]
                    : ["Name", "Allocated", "Used", "Remaining"]
            }
            rows={rows.map((r) =>
                showPoints
                    ? [
                          r.name,
                          String(r.points ?? 0),
                          inr.format(r.allocated),
                          inr.format(r.used),
                          inr.format(r.remaining),
                      ]
                    : [
                          r.name,
                          inr.format(r.allocated),
                          inr.format(r.used),
                          inr.format(r.remaining),
                      ],
            )}
        />
    );
}

function ReportTable({ title, cols, rows }: { title: string; cols: string[]; rows: string[][] }) {
    return (
        <section className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
            <h3 className="mb-3 text-sm font-semibold">
                {title} <span className="text-text-body">({rows.length})</span>
            </h3>
            {rows.length === 0 ? (
                <p className="text-sm text-text-body">None.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-text-body">
                                {cols.map((c) => (
                                    <th key={c} className="px-2 py-2 font-medium">
                                        {c}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {rows.map((row, i) => (
                                <tr key={i}>
                                    {row.map((cell, j) => (
                                        <td key={j} className="px-2 py-2">
                                            {cell || "—"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

function RolloverModal({
    current,
    onClose,
    onDone,
}: {
    current: string | null;
    onClose: () => void;
    onDone: (newSemester: string, resetAllocation: boolean) => void;
}) {
    const [name, setName] = useState("");
    const [reset, setReset] = useState(false);
    const field =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";
    return (
        <Sheet
            open
            onClose={onClose}
            title="Roll to a new semester"
            description="This archives every club and clan's current budget into history (viewable in past-semester reports), then opens the new semester with spend reset to zero."
            footer={
                <>
                    <SheetCancelButton onClick={onClose}>Cancel</SheetCancelButton>
                    <SheetSubmitButton onClick={() => name.trim() && onDone(name.trim(), reset)}>
                        Roll over
                    </SheetSubmitButton>
                </>
            }
        >
            <div className="space-y-3">
                <label className="text-xs text-text-body">
                    New semester name
                    <input
                        className={field}
                        placeholder="e.g. Fall 2026"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={reset}
                        onChange={(e) => setReset(e.target.checked)}
                    />
                    Also reset allocations to 0 (re-allocate afterwards)
                </label>
                {current && (
                    <p className="text-xs text-text-body">
                        Current semester: {current} is archived.
                    </p>
                )}
            </div>
        </Sheet>
    );
}
