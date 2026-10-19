import type { LxEventType } from "@/features/lx/event/types";

export type CalendarEvent = {
    id: string;
    title: string;
    type: LxEventType;
    startDate: string;
    endDate: string;
    roomNames: string[];
    location: string;
    clubName: string | null;
    clanName: string | null;
    budgetAllocated: number | null;
    status: string;
};
