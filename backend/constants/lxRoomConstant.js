// LX Room constants.

export const LX_ROOM_TYPES = [
    "CLASSROOM",
    "SEMINAR",
    "LAB",
    "AUDITORIUM",
    "MEETING",
    "STUDIO",
    "OUTDOOR",
    "OTHER",
];

// Allow-list of amenities a room may advertise.
export const LX_ROOM_AMENITIES = [
    "PROJECTOR",
    "WHITEBOARD",
    "AC",
    "SOUND_SYSTEM",
    "MIC",
    "STAGE",
    "WIFI",
    "POWER_OUTLETS",
];

export const LX_ROOM_EDITABLE_FIELDS = [
    "name",
    "building",
    "floor",
    "capacity",
    "type",
    "amenities",
    "isActive",
];

export const LX_ROOM_SORT_BY = ["name", "capacity", "type", "createdAt", "updatedAt"];
