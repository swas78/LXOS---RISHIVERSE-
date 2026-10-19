// Local date/currency formatting for the events UI. No external deps —
// uses the platform Intl APIs only.

const dateFmt = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
});

const timeFmt = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
});

const parse = (value: string | Date) => {
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value: string | Date) => {
    const d = parse(value);
    return d ? dateFmt.format(d) : "—";
};

export const formatDateTime = (value: string | Date) => {
    const d = parse(value);
    return d ? dateTimeFmt.format(d) : "—";
};

// Compact range: same day → "12 Mar 2026, 10:00 AM – 2:00 PM";
// otherwise → "12 Mar 2026, 10:00 AM → 13 Mar 2026, 6:00 PM".
export const formatDateRange = (start: string | Date, end: string | Date) => {
    const s = parse(start);
    const e = parse(end);
    if (!s) return "—";
    if (!e) return dateTimeFmt.format(s);

    const sameDay =
        s.getFullYear() === e.getFullYear() &&
        s.getMonth() === e.getMonth() &&
        s.getDate() === e.getDate();

    if (sameDay) {
        return `${dateFmt.format(s)}, ${timeFmt.format(s)} – ${timeFmt.format(e)}`;
    }
    return `${dateTimeFmt.format(s)} → ${dateTimeFmt.format(e)}`;
};

export const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);

// Convert an ISO/date string into the value a datetime-local input expects.
export const toDateTimeLocal = (value: string | Date) => {
    const d = parse(value);
    if (!d) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours(),
    )}:${pad(d.getMinutes())}`;
};
