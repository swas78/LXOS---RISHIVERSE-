"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { FileUploader } from "@/components/lx/FileUploader";
import type { LxAttachment } from "@/features/upload/uploadApi";
import type {
    CreateLxLostFoundPayload,
    LxLostFoundCategory,
    LxLostFoundKind,
} from "@/features/lx/lostFound/types";

const CATEGORIES: { value: LxLostFoundCategory; label: string }[] = [
    { value: "ELECTRONICS", label: "Electronics" },
    { value: "ID_CARD", label: "ID card" },
    { value: "KEYS", label: "Keys" },
    { value: "WALLET", label: "Wallet / purse" },
    { value: "CLOTHING", label: "Clothing" },
    { value: "BOOK", label: "Book" },
    { value: "STATIONERY", label: "Stationery" },
    { value: "ACCESSORY", label: "Accessory" },
    { value: "OTHER", label: "Other" },
];

const field =
    "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

const todayKey = () =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

export function ReportItemForm({
    onClose,
    onSubmit,
}: {
    onClose: () => void;
    onSubmit: (payload: CreateLxLostFoundPayload) => Promise<boolean>;
}) {
    const [kind, setKind] = useState<LxLostFoundKind>("FOUND");
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "OTHER" as LxLostFoundCategory,
        location: "",
        occurredOn: todayKey(),
        contactPhone: "",
    });
    const [images, setImages] = useState<LxAttachment[]>([]);
    const [busy, setBusy] = useState(false);

    const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
        setForm((f) => ({ ...f, [k]: v }));

    const submit = async () => {
        if (!form.title.trim() || form.description.trim().length < 10) {
            toast.error("Add a name and a description so the owner can recognise it.");
            return;
        }
        if (images.length === 0) {
            toast.error("Add at least one photo — it is how people recognise their things.");
            return;
        }
        if (!form.location.trim()) {
            toast.error("Say roughly where it was lost or found.");
            return;
        }

        setBusy(true);
        const ok = await onSubmit({
            kind,
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            images: images.map((a) => a.s3Path),
            location: form.location.trim(),
            occurredOn: form.occurredOn,
            contactPhone: form.contactPhone.trim() || null,
        });
        setBusy(false);
        if (ok) onClose();
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title="Report an item"
            footer={
                <>
                    <SheetCancelButton onClick={onClose}>Cancel</SheetCancelButton>
                    <SheetSubmitButton onClick={submit} disabled={busy}>
                        {busy ? "Submitting…" : "Submit for review"}
                    </SheetSubmitButton>
                </>
            }
        >
            <p className="mb-4 flex items-start gap-1.5 text-xs text-text-body">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                An admin checks every report before it appears on the board — photos of ID cards and
                personal property are not published unreviewed.
            </p>

            {/* Lost vs found changes how the whole post reads, so it is the first
            choice rather than a dropdown buried in the form. */}
            <div className="mb-4 grid grid-cols-2 gap-2">
                {(["FOUND", "LOST"] as LxLostFoundKind[]).map((k) => (
                    <button
                        key={k}
                        type="button"
                        onClick={() => setKind(k)}
                        className={`rounded-lg border px-3 py-2.5 text-left transition ${
                            kind === k
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-subtle"
                        }`}
                    >
                        <span className="block text-sm font-medium">
                            {k === "FOUND" ? "I found something" : "I lost something"}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-text-body">
                            {k === "FOUND"
                                ? "Help it get back to its owner"
                                : "Ask if anyone has seen it"}
                        </span>
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                <input
                    className={field}
                    placeholder={kind === "FOUND" ? "What did you find?" : "What did you lose?"}
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                />
                <textarea
                    className={field}
                    rows={3}
                    placeholder="Describe it — colour, marks, stickers, anything that identifies it"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                    <select
                        className={field}
                        value={form.category}
                        onChange={(e) => set("category", e.target.value as LxLostFoundCategory)}
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                    <input
                        className={field}
                        type="date"
                        max={todayKey()}
                        value={form.occurredOn}
                        onChange={(e) => set("occurredOn", e.target.value)}
                    />
                </div>

                <input
                    className={field}
                    placeholder={
                        kind === "FOUND" ? "Where did you find it?" : "Where did you last have it?"
                    }
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                />

                <FileUploader
                    label="Photos"
                    hint="At least one. This is how someone recognises their own things."
                    accept="image/*"
                    maxFiles={6}
                    variant="grid"
                    value={images}
                    onChange={setImages}
                />

                <div>
                    <input
                        className={field}
                        placeholder="Contact number (optional)"
                        inputMode="numeric"
                        value={form.contactPhone}
                        onChange={(e) => set("contactPhone", e.target.value)}
                    />
                    <p className="mt-1 text-[11px] text-text-body">
                        Shown on the board only once your report is approved. Leave it blank and
                        people will reach you through the LX team.
                    </p>
                </div>
            </div>
        </Sheet>
    );
}
