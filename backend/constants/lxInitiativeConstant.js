// LX Initiative constants.

export const LX_INITIATIVE_STATUSES = ["PLANNING", "ACTIVE", "COMPLETED"];

// Priority is a free string on the model; this allow-list keeps input sane.
export const LX_INITIATIVE_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export const LX_INITIATIVE_EDITABLE_FIELDS = [
    "title",
    "description",
    "clanId",
    "clanName",
    "semester",
    "status",
    "progress",
    "priority",
    "team",
];

export const LX_INITIATIVE_SORT_BY = ["date", "title", "progress", "createdAt", "updatedAt"];
