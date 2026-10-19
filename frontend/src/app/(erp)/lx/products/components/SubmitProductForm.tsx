"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "sonner";
import { SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { FileUploader } from "@/components/lx/FileUploader";
import type { LxAttachment } from "@/features/upload/uploadApi";
import type { CreateLxProductPayload, LxProductCategory } from "@/features/lx/product/types";

const CATEGORIES: { value: LxProductCategory; label: string }[] = [
    { value: "WEBSITE", label: "Website" },
    { value: "WEB_APP", label: "Web App" },
    { value: "MOBILE_APP", label: "Mobile App" },
    { value: "HARDWARE", label: "Hardware" },
    { value: "DESIGN", label: "Design" },
    { value: "RESEARCH", label: "Research" },
    { value: "GAME", label: "Game" },
    { value: "OTHER", label: "Other" },
];

type Props = {
    onClose: () => void;
    onSubmit: (payload: CreateLxProductPayload) => Promise<boolean>;
};

export function SubmitProductForm({ onClose, onSubmit }: Props) {
    const [form, setForm] = useState({
        title: "",
        tagline: "",
        description: "",
        url: "",
        repoUrl: "",
        category: "WEBSITE" as LxProductCategory,
        techStack: "",
        teamMembers: "",
        tags: "",
    });
    // Held as full attachments so the uploader can show thumbnails; only the
    // pointers are sent, in the order the learner arranged them.
    const [images, setImages] = useState<LxAttachment[]>([]);
    const [busy, setBusy] = useState(false);
    const field =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";
    const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
        setForm((f) => ({ ...f, [k]: v }));

    const submit = async () => {
        if (!form.title.trim() || !form.description.trim()) {
            toast.error("Title and description are required.");
            return;
        }
        setBusy(true);
        const csv = (s: string) =>
            s
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean);
        const ok = await onSubmit({
            title: form.title.trim(),
            tagline: form.tagline.trim(),
            description: form.description.trim(),
            url: form.url.trim() || null,
            repoUrl: form.repoUrl.trim() || null,
            images: images.map((a) => a.s3Path),
            category: form.category,
            techStack: csv(form.techStack),
            teamMembers: csv(form.teamMembers),
            tags: csv(form.tags),
        });
        setBusy(false);
        if (ok) onClose();
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title="Submit a Product"
            footer={
                <>
                    <SheetCancelButton onClick={onClose}>Cancel</SheetCancelButton>
                    <SheetSubmitButton onClick={submit} disabled={busy}>
                        {busy ? "Submitting…" : "Submit for review"}
                    </SheetSubmitButton>
                </>
            }
        >
            <p className="mb-4 text-xs text-text-body">
                It goes live in the showcase once an admin approves it.
            </p>
            <div className="space-y-3">
                <input
                    className={field}
                    placeholder="Product name"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                />
                <input
                    className={field}
                    placeholder="One-line tagline"
                    value={form.tagline}
                    onChange={(e) => set("tagline", e.target.value)}
                />
                <textarea
                    className={field}
                    rows={3}
                    placeholder="What does it do?"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                        className={field}
                        placeholder="Live URL (https://…)"
                        value={form.url}
                        onChange={(e) => set("url", e.target.value)}
                    />
                    <input
                        className={field}
                        placeholder="Repo URL (optional)"
                        value={form.repoUrl}
                        onChange={(e) => set("repoUrl", e.target.value)}
                    />
                </div>
                <select
                    className={field}
                    value={form.category}
                    onChange={(e) => set("category", e.target.value as LxProductCategory)}
                >
                    {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>
                <input
                    className={field}
                    placeholder="Tech stack (comma-separated)"
                    value={form.techStack}
                    onChange={(e) => set("techStack", e.target.value)}
                />
                <input
                    className={field}
                    placeholder="Team members (comma-separated)"
                    value={form.teamMembers}
                    onChange={(e) => set("teamMembers", e.target.value)}
                />
                <FileUploader
                    value={images}
                    onChange={setImages}
                    variant="grid"
                    label="Screenshots & mockups"
                    accept="image/*"
                    maxFiles={8}
                    hint="First image is the cover. Add mockups to show the design."
                />
            </div>
        </Sheet>
    );
}
