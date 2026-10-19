"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAnalyticsThunk } from "@/features/lx/analytics/analyticsThunks";
import { downloadReportCsvThunk, fetchSemestersThunk } from "@/features/lx/report/reportThunks";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";
import dynamic from "next/dynamic";
import { StatTile, StatTileRow } from "@/components/ui/stat-tile";

// Charts are the heaviest thing on this page and recharts is not in v2's
// dependency list, so they load on demand rather than in the main bundle.
const AnalyticsCharts = dynamic(() => import("./components/AnalyticsCharts"), {
    ssr: false,
    loading: () => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="h-72 animate-pulse rounded-xl border border-border bg-subtle"
                />
            ))}
        </div>
    ),
});

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

export default function AnalyticsPage() {
    const dispatch = useAppDispatch();
    const data = useAppSelector((s) => s.lxAnalytics.data);
    const loading = useAppSelector((s) => s.lxAnalytics.loading);
    // Busy state now lives in the report slice alongside the download thunk.
    const downloading = useAppSelector((s) => s.lxReport.downloading);
    const semesters = useAppSelector((s) => s.lxReport.semesters);
    const current = useAppSelector((s) => s.lxReport.current);
    const { can } = useCan();
    const canReport = can(PERMISSIONS.GENERATE_REPORT);
    const [semester, setSemester] = useState("");

    useEffect(() => {
        void dispatch(fetchAnalyticsThunk());
        if (canReport) void dispatch(fetchSemestersThunk());
    }, [dispatch, canReport]);

    // Download the semester report as CSV (mirrors learnerexperienceos export).
    // The download lives in reportApi + a thunk. A page that reaches for axios
    // has quietly become a data layer.
    const downloadReport = () => {
        void dispatch(
            downloadReportCsvThunk({ semester, filenameHint: semester || current || "current" }),
        );
    };

    const stats = data?.stats;
    const statCards = [
        { label: "Total Events", value: stats?.totalEvents ?? 0 },
        { label: "Budget Allocated", value: stats ? inr.format(stats.budgetAllocated) : "—" },
        { label: "Expenses", value: stats ? inr.format(stats.expenses) : "—" },
        { label: "Achievements", value: stats?.achievements ?? 0 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-text">Analytics</h1>
                    <p className="mt-1 text-sm text-text-body">
                        A visual overview of institutional activity — events, budgets, and clans.
                    </p>
                </div>
                {canReport && (
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 rounded-card border border-border bg-card px-2.5 py-1.5">
                            <CalendarRange className="h-4 w-4 text-text-body" />
                            <select
                                className="bg-transparent text-sm outline-none"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                            >
                                <option value="">
                                    {current ? `Current (${current})` : "Current"}
                                </option>
                                {semesters.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button className="gap-1.5" onClick={downloadReport} disabled={downloading}>
                            <Download className="h-4 w-4" />{" "}
                            {downloading ? "Preparing…" : "Download semester report"}
                        </Button>
                    </div>
                )}
            </div>

            <StatTileRow>
                {statCards.map((c, i) => (
                    <StatTile
                        key={c.label}
                        label={c.label}
                        value={loading && !data ? "…" : c.value}
                        // Four unlabelled counts: cycle the tints so the row
                        // reads as a band rather than four identical blocks.
                        tone={(["brand", "info", "success", "warning"] as const)[i % 4]}
                    />
                ))}
            </StatTileRow>

            <AnalyticsCharts data={data} loading={loading} />
        </div>
    );
}
