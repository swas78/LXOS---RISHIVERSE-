"use client";

import { useEffect, useMemo, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Loader2, Search, ShieldCheck, UserPlus, X } from "lucide-react";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cabinApi } from "@/features/lx/cabin/cabinApi";
import type {
    CreateLxCabinBookingPayload,
    LxCabinIdentity,
    LxCabinSlot,
    LxCabinWithSlots,
    LxDirectoryPerson,
} from "@/features/lx/cabin/types";

const field =
    "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

export function BookingDialog({
    cabin,
    slot,
    identity,
    onClose,
    onConfirm,
}: {
    cabin: LxCabinWithSlots;
    slot: LxCabinSlot;
    identity: LxCabinIdentity;
    onClose: () => void;
    onConfirm: (payload: CreateLxCabinBookingPayload) => Promise<string | null>;
}) {
    // Pre-filled from the profile. After the first booking this is never typed again.
    const [phone, setPhone] = useState(identity.phone ?? "");
    const [members, setMembers] = useState<LxDirectoryPerson[]>([]);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<LxDirectoryPerson[]>([]);
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedQuery = useDebouncedValue(query, 250);

    // Whether results are SHOWN is derived from the query, not stored. Clearing
    // them through setState inside the effect made the effect write state
    // synchronously on every keystroke; this needs no write at all.
    const queryIsSearchable = debouncedQuery.trim().length >= 2;
    const visibleResults = queryIsSearchable ? results : [];

    useEffect(() => {
        if (!queryIsSearchable) return;
        const controller = new AbortController();
        // The spinner has to appear the moment the request starts, so this flag is
        // set synchronously on purpose. Moving it past the await would show the
        // spinner only after the response, which is the opposite of its job.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearching(true);
        cabinApi
            .searchDirectory(debouncedQuery, controller.signal)
            .then((res) => setResults(res.data.results))
            .catch(() => setResults([]))
            .finally(() => setSearching(false));
        return () => controller.abort();
    }, [debouncedQuery, queryIsSearchable]);

    const peopleCount = members.length + 1;
    // Faculty are exempt from the minimum: a one-to-one consultation is a
    // legitimate use of a group room. The server enforces the same rule.
    const minRequired = identity.bookerType === "STUDENT" ? cabin.minCapacity : 1;
    const capacityOk = peopleCount >= minRequired && peopleCount <= cabin.maxCapacity;

    const capacityHint = useMemo(() => {
        if (peopleCount < minRequired) {
            const needed = minRequired - peopleCount;
            return `Add ${needed} more ${needed === 1 ? "person" : "people"} — this cabin is for groups of ${cabin.minCapacity}-${cabin.maxCapacity}.`;
        }
        if (peopleCount > cabin.maxCapacity)
            return `This cabin seats at most ${cabin.maxCapacity}.`;
        return `${peopleCount} of ${cabin.maxCapacity} seats`;
    }, [peopleCount, minRequired, cabin.minCapacity, cabin.maxCapacity]);

    const phoneValid = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10));

    const addMember = (person: LxDirectoryPerson) => {
        if (members.some((m) => m.referenceId === person.referenceId)) return;
        setMembers((prev) => [...prev, person]);
        setQuery("");
        setResults([]);
    };

    const submit = async () => {
        setSubmitting(true);
        setError(null);
        const message = await onConfirm({
            cabinId: cabin.id,
            slotStart: slot.slotStart,
            phone: phone.trim(),
            groupMemberRefs: members.map((m) => m.referenceId),
        });
        setSubmitting(false);
        if (message) setError(message);
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title={<>{cabin.name}</>}
            footer={
                <>
                    <SheetCancelButton onClick={onClose}>Cancel</SheetCancelButton>
                    <SheetSubmitButton
                        onClick={submit}
                        disabled={submitting || !capacityOk || !phoneValid}
                    >
                        {submitting ? "Confirming…" : "Confirm booking"}
                    </SheetSubmitButton>
                </>
            }
        >
            <div className="mt-4 space-y-5">
                {/* Identity is READ-ONLY on purpose. It comes from the university
              directory, so there is nothing here to mistype — and no way to
              submit an enrollment number that belongs to someone else. */}
                <div className="rounded-xl border border-border bg-subtle p-4">
                    <div className="mb-3 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-body">
                            Booking as
                        </span>
                    </div>
                    <p className="font-semibold">{identity.name}</p>
                    <div className="mt-2 space-y-1">
                        <IdentityRow
                            label={identity.bookerType === "STUDENT" ? "Enrollment" : "Employee ID"}
                            value={identity.referenceId}
                        />
                        <IdentityRow label="Email" value={identity.email} />
                        <IdentityRow
                            label="Booking as"
                            value={identity.bookerType === "STUDENT" ? "Student" : "Faculty"}
                        />
                    </div>
                </div>

                {/* The one thing the directory cannot give us. */}
                <div className="space-y-1.5">
                    <label htmlFor="cabin-phone" className="block text-xs font-medium">
                        Phone number
                        {identity.phone && (
                            <span className="ml-1.5 font-normal text-text-body">
                                · saved from last time
                            </span>
                        )}
                    </label>
                    <input
                        id="cabin-phone"
                        className={field}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        inputMode="numeric"
                    />
                    <p className="text-[11px] text-text-body">
                        Kept on your profile so you never type it again.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-medium">Who is joining you</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-body" />
                        <input
                            className={`${field} pl-9`}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search the directory by name or enrollment number"
                        />
                        {searching && (
                            <Loader2 className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-text-body" />
                        )}
                    </div>

                    {visibleResults.length > 0 && (
                        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                            {visibleResults.map((person) => (
                                <button
                                    key={person.referenceId}
                                    type="button"
                                    onClick={() => addMember(person)}
                                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-subtle"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-medium">
                                            {person.name}
                                        </p>
                                        <p className="truncate text-[11px] text-text-body">
                                            {person.referenceId}
                                        </p>
                                    </div>
                                    <UserPlus className="h-3.5 w-3.5 shrink-0 text-text-body" />
                                </button>
                            ))}
                        </div>
                    )}

                    {members.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {members.map((member) => (
                                <span
                                    key={member.referenceId}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px]"
                                >
                                    {member.name}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMembers((prev) =>
                                                prev.filter(
                                                    (m) => m.referenceId !== member.referenceId,
                                                ),
                                            )
                                        }
                                        className="text-text-body transition hover:text-error"
                                        aria-label={`Remove ${member.name}`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <p className={`text-[11px] ${capacityOk ? "text-text-body" : "text-warning"}`}>
                        {capacityHint}
                    </p>
                </div>

                {error && (
                    <p className="rounded-lg border border-error-subtle bg-error-subtle px-3 py-2 text-xs text-error">
                        {error}
                    </p>
                )}
            </div>
        </Sheet>
    );
}

function IdentityRow({ label, value }: { label: string; value: string | null }) {
    if (!value) return null;
    return (
        <div className="flex justify-between gap-4 text-xs">
            <span className="text-text-body">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}
