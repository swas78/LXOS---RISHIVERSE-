"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "sonner";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";

type Props = {
    /** Derived pointer to WHO gets paid. Shown for confirmation, never editable. */
    payoutRef: string | null;
    onClose: () => void;
    onConfirm: (payoutTxnRef: string) => Promise<boolean>;
};

/**
 * Finance closes the loop here: the money has already moved through the bank,
 * and this records the reference for it so the claim can be reconciled later.
 */
export function ProcessPayoutDialog({ payoutRef, onClose, onConfirm }: Props) {
    const [payoutTxnRef, setPayoutTxnRef] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const confirm = async () => {
        if (!payoutTxnRef.trim()) {
            toast.error("Enter the bank or UPI transaction reference.");
            return;
        }
        setSubmitting(true);
        const ok = await onConfirm(payoutTxnRef.trim());
        setSubmitting(false);
        if (ok) onClose();
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title="Mark processed"
            footer={
                <>
                    <SheetCancelButton onClick={onClose} disabled={submitting}>
                        Cancel
                    </SheetCancelButton>
                    <SheetSubmitButton onClick={confirm} disabled={submitting}>
                        {submitting ? "Saving…" : "Confirm payout"}
                    </SheetSubmitButton>
                </>
            }
        >
            <div className="space-y-3">
                <div className="rounded-lg bg-subtle p-3 text-sm">
                    <p className="mb-1 text-xs font-medium text-text-body">Paying</p>
                    <p className="break-all font-mono text-xs">{payoutRef ?? "—"}</p>
                </div>

                <label className="block text-sm font-medium" htmlFor="payoutTxnRef">
                    Transaction reference
                </label>
                <input
                    id="payoutTxnRef"
                    className="w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus"
                    placeholder="e.g. NEFT/2026/0042"
                    value={payoutTxnRef}
                    onChange={(e) => setPayoutTxnRef(e.target.value)}
                    autoFocus
                />
                <p className="text-xs text-text-body">
                    The bank or UPI reference for the transfer you just made.
                </p>
            </div>
        </Sheet>
    );
}

export default ProcessPayoutDialog;
