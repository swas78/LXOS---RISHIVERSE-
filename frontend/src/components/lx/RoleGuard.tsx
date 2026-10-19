"use client";

import { type ReactNode } from "react";
import { useCan } from "@/hooks/useCan";
import type { Rule } from "@/lib/routes";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export function RoleGuard({ rule, children }: { rule?: Rule; children: ReactNode }) {
    const { status, error, can, role, refetch } = useCan();

    // If no rule is specified, this route/component is unrestricted — render immediately
    if (!rule) {
        return <>{children}</>;
    }

    if (status === "idle" || status === "loading") {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-icon-secondary" />
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-error">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">{error || "Failed to load permissions"}</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-subtle"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // If there's a rule and the current user doesn't pass it, show 403
    if (rule && !rule({ can, role })) {
        return (
            <div className="flex min-h-[400px] items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-subtle">
                        <AlertCircle className="h-6 w-6 text-error-subtle-foreground" />
                    </div>
                    <h2 className="mb-2 text-lg font-semibold">Access Denied</h2>
                    <p className="mb-6 text-sm text-text-secondary">
                        You don&apos;t have permission to view this page. If you believe this is a
                        mistake, please contact the LX Team.
                    </p>
                    <Link
                        href="/lx/dashboard"
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
