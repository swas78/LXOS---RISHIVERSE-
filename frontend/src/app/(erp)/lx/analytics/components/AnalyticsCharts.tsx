"use client";

// recharts is NOT a dependency of rishiverse-frontend-v2 (see Sarthak's note).
// Whether it is added is a product decision, so the charts are isolated here
// and loaded with next/dynamic: they stay out of the main bundle, and if the
// answer is "use whatever v2 already has", only this file is rewritten.
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { AnalyticsData } from "@/features/lx/analytics/types";

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const TYPE_COLORS: Record<string, string> = {
    CLUB: "var(--chart-2)",
    CLAN: "var(--chart-5)",
    LX: "var(--success)",
    FEST: "var(--chart-4)",
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
            <h2 className="mb-3 text-sm font-semibold">{title}</h2>
            <div className="h-64 w-full">{children}</div>
        </div>
    );
}

function Empty({ loading }: { loading: boolean }) {
    return (
        <div className="flex h-full items-center justify-center text-sm text-text-body">
            {loading ? "Loading…" : "No data yet."}
        </div>
    );
}

export default function AnalyticsCharts({
    data,
    loading,
}: {
    data: AnalyticsData | null;
    loading: boolean;
}) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Club Activity (events organised)">
                {data?.clubActivity?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.clubActivity} margin={{ left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
                                interval={0}
                                angle={-25}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
                            />
                            <Tooltip />
                            <Bar dataKey="events" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Empty loading={loading} />
                )}
            </ChartCard>

            <ChartCard title="Events by Type">
                {data?.eventsByType?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.eventsByType}
                                dataKey="count"
                                nameKey="type"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={2}
                            >
                                {data.eventsByType.map((e) => (
                                    <Cell
                                        key={e.type}
                                        fill={TYPE_COLORS[e.type] ?? "var(--icon-secondary)"}
                                    />
                                ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <Empty loading={loading} />
                )}
            </ChartCard>

            <ChartCard title="Budget vs Spending (per club)">
                {data?.budgetVsSpending?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.budgetVsSpending} margin={{ left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
                                interval={0}
                                angle={-25}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis tick={{ fontSize: 11, fill: "var(--chart-axis)" }} />
                            <Tooltip formatter={(v: unknown) => inr.format(Number(v))} />
                            <Legend />
                            <Bar dataKey="allocated" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="spent" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Empty loading={loading} />
                )}
            </ChartCard>

            <ChartCard title="Clan Performance (points)">
                {data?.clanPerformance?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.clanPerformance} margin={{ left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
                            />
                            <Tooltip />
                            <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                                {data.clanPerformance.map((c) => (
                                    <Cell key={c.name} fill={c.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Empty loading={loading} />
                )}
            </ChartCard>
        </div>
    );
}
