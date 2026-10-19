export const ENDPOINTS = {
    DEMO: {
        ITEM: {
            ALL: "/demo/item/all",
            NEW: "/demo/item/new",
            BY_ID: (id: string) => `/demo/item/${id}`,
        },
    },
    LX: {
        // Dev-only actor switcher
        USER: {
            ALL: "/lx/user/all",
            ME: "/lx/user/me",
        },
        ACCESS: {
            ALL: "/lx/access/all",
            ASSIGN: "/lx/access/assign",
            REMOVE: "/lx/access/remove",
        },
        ROOM: {
            ALL: "/lx/room/all",
            NEW: "/lx/room/new",
            BY_ID: (id: string) => `/lx/room/${id}`,
        },
        BOOKING: {
            ALL: "/lx/room-booking/all",
            NEW: "/lx/room-booking/new",
            AVAILABILITY: "/lx/room-booking/availability",
            BULK: "/lx/room-booking/bulk",
            REVIEW: (id: string) => `/lx/room-booking/${id}/review`,
            CANCEL: (id: string) => `/lx/room-booking/${id}/cancel`,
        },
        LOST_FOUND: {
            ALL: "/lx/lost-found/all",
            NEW: "/lx/lost-found/new",
            BY_ID: (id: string) => `/lx/lost-found/${id}`,
            REVIEW: (id: string) => `/lx/lost-found/${id}/review`,
            RESOLVE: (id: string) => `/lx/lost-found/${id}/resolve`,
        },
        CABIN: {
            // Everyone
            BOARD: "/lx/cabin/board",
            DIRECTORY: "/lx/cabin/directory",
            BOOKINGS: "/lx/cabin/booking/all",
            BOOK: "/lx/cabin/booking/new",
            BOOKING: (id: string) => `/lx/cabin/booking/${id}`,
            // Library desk
            DESK_BOARD: "/lx/cabin/desk/board",
            ALL: "/lx/cabin/all",
            NEW: "/lx/cabin/new",
            BY_ID: (id: string) => `/lx/cabin/${id}`,
            BLOCKS: "/lx/cabin/block/all",
            BLOCK_NEW: "/lx/cabin/block/new",
            BLOCK_LIFT: (id: string) => `/lx/cabin/block/${id}/lift`,
        },
        REPORT: {
            ALL: "/lx/report/all",
            CSV: "/lx/report/csv",
            SEMESTERS: "/lx/report/semesters",
            ROLLOVER: "/lx/report/rollover",
        },
        CLUB: {
            ALL: "/lx/club/all",
            NEW: "/lx/club/new",
            BY_ID: (id: string) => `/lx/club/${id}`,
        },
        CLAN: {
            ALL: "/lx/clan/all",
            NEW: "/lx/clan/new",
            BY_ID: (id: string) => `/lx/clan/${id}`,
            POINTS: (id: string) => `/lx/clan/${id}/points`,
        },
        EVENT: {
            ALL: "/lx/event/all",
            NEW: "/lx/event/new",
            BY_ID: (id: string) => `/lx/event/${id}`,
            APPROVE: (id: string) => `/lx/event/${id}/approve`,
            COMPLETE: (id: string) => `/lx/event/${id}/complete`,
            AVAILABILITY: "/lx/event/availability",
        },
        ACHIEVEMENT: {
            ALL: "/lx/achievement/all",
            NEW: "/lx/achievement/new",
            BY_ID: (id: string) => `/lx/achievement/${id}`,
            REVIEW: (id: string) => `/lx/achievement/${id}/review`,
        },
        EXPENSE: {
            ALL: "/lx/expense/all",
            NEW: "/lx/expense/new",
            BY_ID: (id: string) => `/lx/expense/${id}`,
            VERIFY: (id: string) => `/lx/expense/${id}/verify`,
        },
        REIMBURSEMENT: {
            ALL: "/lx/reimbursement/all",
            NEW: "/lx/reimbursement/new",
            BY_ID: (id: string) => `/lx/reimbursement/${id}`,
            REVIEW: (id: string) => `/lx/reimbursement/${id}/review`,
            PROCESS: (id: string) => `/lx/reimbursement/${id}/process`,
        },
        INITIATIVE: {
            ALL: "/lx/initiative/all",
            NEW: "/lx/initiative/new",
            BY_ID: (id: string) => `/lx/initiative/${id}`,
        },
        FILE: {
            ALL: "/lx/file/all",
            NEW: "/lx/file/new",
            BY_ID: (id: string) => `/lx/file/${id}`,
        },
        PRODUCT: {
            ALL: "/lx/product/all",
            NEW: "/lx/product/new",
            BY_ID: (id: string) => `/lx/product/${id}`,
            REVIEW: (id: string) => `/lx/product/${id}/review`,
        },
        APPROVAL: {
            ALL: "/lx/approval/all",
            ACT: "/lx/approval/act",
        },
        FEED: {
            ALL: "/lx/feed/all",
        },
        BUDGET: {
            SUMMARY: "/lx/budget/summary",
        },
        DASHBOARD: {
            STATS: "/lx/dashboard/stats",
        },
        ANALYTICS: {
            ALL: "/lx/analytics/all",
        },
        CALENDAR: {
            ALL: "/lx/calendar/all",
        },
    },
} as const;
