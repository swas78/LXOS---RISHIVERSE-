"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "sonner";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { FileUploader } from "@/components/lx/FileUploader";
import type { LxAttachment } from "@/features/upload/uploadApi";
import { MAX_BILLS } from "@/features/lx/reimbursement/reimbursementConstants";
import type {
    CreateLxReimbursementPayload,
    LxReimbursementCategory,
} from "@/features/lx/reimbursement/types";

const CATEGORIES: LxReimbursementCategory[] = [
    "FOOD",
    "TRAVEL",
    "MATERIALS",
    "EQUIPMENT",
    "PRINTING",
    "ACCOMMODATION",
    "OTHER",
];

type Props = {
    onClose: () => void;
    onSubmit: (payload: CreateLxReimbursementPayload) => Promise<boolean>;
};

export function SubmitReimbursementForm({ onClose, onSubmit }: Props) {
    const [form, setForm] = useState({
        title: "",
        amount: "",
        expenseDate: "",
        category: "OTHER" as LxReimbursementCategory,
        purpose: "",
        accountHolderName: "",
        accountNumber: "",
        ifsc: "",
    });
    const [bills, setBills] = useState<LxAttachment[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const field =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

    const submit = async () => {
        if (!form.title.trim() || !form.amount || !form.expenseDate) {
            toast.error("Title, amount and date are required.");
            return;
        }
        // The server rejects a receiptless claim too; catching it here saves an
        // upload-less round trip and points at the uploader.
        if (bills.length === 0) {
            toast.error("Attach at least one bill or receipt.");
            return;
        }
        setSubmitting(true);
        const ok = await onSubmit({
            title: form.title.trim(),
            amount: Number(form.amount),
            expenseDate: new Date(form.expenseDate).toISOString(),
            category: form.category,
            purpose: form.purpose.trim(),
            bills,
        });
        setSubmitting(false);
        if (ok) onClose();
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title="Submit Reimbursement"
            footer={
                <>
                    <SheetCancelButton onClick={onClose} disabled={submitting}>
                        Cancel
                    </SheetCancelButton>
                    <SheetSubmitButton onClick={submit} disabled={submitting}>
                        {submitting ? "Submitting…" : "Submit"}
                    </SheetSubmitButton>
                </>
            }
        >
            <div className="space-y-3">
                <input
                    className={field}
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                        type="number"
                        className={field}
                        placeholder="Amount (₹)"
                        value={form.amount}
                        onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    />
                    <input
                        type="date"
                        className={field}
                        value={form.expenseDate}
                        onChange={(e) => setForm((f) => ({ ...f, expenseDate: e.target.value }))}
                    />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <select
                        className={field}
                        value={form.category}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                category: e.target.value as LxReimbursementCategory,
                            }))
                        }
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <input
                        className={field}
                        placeholder="Purpose / event"
                        value={form.purpose}
                        onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                    />
                </div>

                <FileUploader
                    variant="list"
                    label="Bills / receipts"
                    accept="image/*,application/pdf"
                    maxFiles={MAX_BILLS}
                    hint="At least one required — approvers review the receipt, not just the amount."
                    value={bills}
                    onChange={setBills}
                    disabled={submitting}
                />

                {/* No bank fields. Core owns payout details on the student profile
              (lxos-core-pack/payouts.md) — this module records only WHO to pay. */}
                <p className="pt-1 text-xs text-text-body">
                    Payouts go to the bank account on your student profile.
                </p>
            </div>
        </Sheet>
    );
}

export default SubmitReimbursementForm;
