// LX Achievement constants.

export const LX_ACHIEVEMENT_CATEGORIES = [
    "ACADEMIC",
    "SPORTS",
    "CULTURAL",
    "TECHNICAL",
    "SOCIAL",
    "OTHER",
];

// ACHIEVEMENT — a recorded win shown on the Achievements page.
// UPDATE — a club blog post that only surfaces in the feed.
export const LX_ACHIEVEMENT_KINDS = ["ACHIEVEMENT", "UPDATE"];

export const LX_ACHIEVEMENT_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

export const LX_ACHIEVEMENT_EDITABLE_FIELDS = [
    "title",
    "description",
    "eventId",
    "clubId",
    "clubName",
    "clanId",
    "clanName",
    "points",
    "achievedDate",
    "semester",
    "category",
    "kind",
    "participants",
    "images",
];

export const LX_ACHIEVEMENT_SORT_BY = ["achievedDate", "title", "createdAt", "points"];
