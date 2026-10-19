"use client";

import type { LxEventStatus } from "@/features/lx/event/types";
import { useCan } from "@/hooks/useCan";
import { PERMISSIONS } from "@/lib/permissions";
import { Badge, approvalTone } from "@/components/ui/badge";

const LABEL: Record<LxEventStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};

/**
 * A status badge that only appears when the status tells the viewer something.
 *
 * The backend already hides pending and rejected events from anyone who cannot
 * act on them, so for a general student every visible event is APPROVED. A badge
 * with exactly one possible value is not information — it is decoration that
 * implies some other state exists.
 *
 * COMPLETED and CANCELLED stay visible to everyone, because "this already
 * happened" and "this is off" genuinely change what the reader should do. An
 * organiser still sees PENDING and REJECTED on their OWN events, since the
 * backend lets those through and tracking a submission is the point.
 */
export function EventStatusBadge({ status }: { status: LxEventStatus }) {
    const { can } = useCan();
    if (!can(PERMISSIONS.APPROVE_EVENT) && status === "APPROVED") return null;

    return (
        <Badge tone={approvalTone(status)} dot>
            {LABEL[status] ?? status}
        </Badge>
    );
}
