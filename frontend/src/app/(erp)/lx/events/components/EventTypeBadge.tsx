"use client";

import type { LxEventType } from "@/features/lx/event/types";
import { Badge, type BadgeTone } from "@/components/ui/badge";

/**
 * Event type is a category, not a status, so the tones here are chosen only to
 * keep the four types apart. They follow the same grouping the old hard-coded
 * hexes used (club blue, LX green, fest amber) so nothing moves visually; clan
 * shifts from violet to the brand's secondary, since violet is not in the
 * palette at all.
 */
const TYPE: Record<LxEventType, { tone: BadgeTone; label: string }> = {
    CLUB: { tone: "info", label: "Club" },
    CLAN: { tone: "secondary", label: "Clan" },
    LX: { tone: "success", label: "LX" },
    FEST: { tone: "warning", label: "Fest" },
};

export function EventTypeBadge({ type }: { type: LxEventType }) {
    const t = TYPE[type] ?? TYPE.LX;
    return (
        <Badge tone={t.tone} className="font-semibold">
            {t.label}
        </Badge>
    );
}
