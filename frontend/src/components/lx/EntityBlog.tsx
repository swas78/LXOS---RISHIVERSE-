"use client";

import { useCallback, useEffect, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button, SheetCancelButton, SheetSubmitButton } from "@/components/ui/button";
import { FileUploader } from "@/components/lx/FileUploader";
import { s3PathToUrl, type LxAttachment } from "@/features/upload/uploadApi";
import { achievementApi } from "@/features/lx/achievement/achievementApi";

// A club/clan blog. Posts are stored as achievements with kind=UPDATE, linked
// to the club/clan. They start PENDING; once an admin approves, they show to
// everyone here AND on the Activity Feed. Leaders/admins also see their own
// pending/rejected posts; everyone else sees only approved posts.
type BlogPost = {
    id: string;
    title: string;
    description: string;
    images: string[];
    createdByName: string;
    achievedDate: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason: string | null;
};

const fmtDate = (v: string) =>
    new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(v),
    );

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
    PENDING: { bg: "var(--warning-subtle)", fg: "var(--warning-subtle-foreground)" },
    APPROVED: { bg: "var(--success-subtle)", fg: "var(--success-subtle-foreground)" },
    REJECTED: { bg: "var(--error-subtle)", fg: "var(--error-subtle-foreground)" },
};

export function EntityBlog({
    kind,
    id,
    name,
    canPost,
}: {
    kind: "club" | "clan";
    id: string;
    name: string;
    canPost: boolean;
}) {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // The fetch is async all the way down, so no setState runs synchronously
    // inside the effect body — which is what made React warn about cascading
    // renders. It also goes through achievementApi rather than raw axios.
    const load = useCallback(async () => {
        const params: Record<string, unknown> = { kind: "UPDATE", limit: 50 };
        if (kind === "club") params.clubId = id;
        else params.clanId = id;
        // Non-managers see only approved posts.
        if (!canPost) params.status = "APPROVED";
        try {
            const res = await achievementApi.getAll(params as never);
            setPosts(res.data as BlogPost[]);
        } catch {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [kind, id, canPost]);

    useEffect(() => {
        // `load` is async and every setState in it runs after an await, so nothing
        // here is synchronous. The rule cannot see through the async boundary and
        // flags the call site regardless.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    return (
        <div className="rounded-2xl border border-border-subtle bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Megaphone className="h-4 w-4" /> Blog & Updates
                </h2>
                {canPost && (
                    <Button
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => setOpen(true)}
                    >
                        <Plus className="h-3.5 w-3.5" /> New post
                    </Button>
                )}
            </div>

            {canPost && (
                <p className="mt-1 text-xs text-text-body">
                    Posts appear here and on the campus Activity Feed once an admin approves them.
                </p>
            )}

            <div className="mt-3 space-y-3">
                {loading ? (
                    <p className="text-sm text-text-body">Loading posts…</p>
                ) : posts.length === 0 ? (
                    <p className="text-sm text-text-body">No posts yet.</p>
                ) : (
                    posts.map((p) => {
                        const st = STATUS_STYLE[p.status] ?? STATUS_STYLE.PENDING;
                        return (
                            <div key={p.id} className="rounded-lg border border-border p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-medium">{p.title}</p>
                                    {p.status !== "APPROVED" && (
                                        <span
                                            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                            style={{ background: st.bg, color: st.fg }}
                                        >
                                            {p.status}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-text-body">{p.description}</p>
                                {p.images?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {/* Stored values are core S3 pointers, not URLs — they
                        must be resolved before they can be rendered. */}
                                        {p.images.slice(0, 3).map((src) => (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                key={src}
                                                src={s3PathToUrl(src) ?? src}
                                                alt=""
                                                className="h-20 w-28 rounded-card object-cover"
                                            />
                                        ))}
                                    </div>
                                )}
                                <p className="mt-2 text-xs text-text-body">
                                    {p.createdByName} · {fmtDate(p.achievedDate)}
                                </p>
                                {p.status === "REJECTED" && p.rejectionReason && (
                                    <p className="mt-1 rounded bg-error-subtle px-2 py-1 text-[11px] text-error">
                                        Rejected: {p.rejectionReason}
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {open && (
                <NewPostModal
                    kind={kind}
                    id={id}
                    name={name}
                    onClose={() => setOpen(false)}
                    onPosted={load}
                />
            )}
        </div>
    );
}

function NewPostModal({
    kind,
    id,
    name,
    onClose,
    onPosted,
}: {
    kind: "club" | "clan";
    id: string;
    name: string;
    onClose: () => void;
    onPosted: () => void;
}) {
    const [form, setForm] = useState({ title: "", description: "" });
    // Real uploads rather than a pasted URL: a link to somebody else's host
    // rots, and nothing stops it pointing at a page the club does not control.
    const [images, setImages] = useState<LxAttachment[]>([]);
    const [busy, setBusy] = useState(false);
    const field =
        "w-full rounded-input border border-input bg-card px-3 py-2 text-sm text-text-heading outline-none transition-colors placeholder:text-text-placeholder focus:border-border-focus";

    const submit = async () => {
        if (!form.title.trim() || !form.description.trim()) {
            toast.error("Title and content are required.");
            return;
        }
        setBusy(true);
        try {
            await achievementApi.create({
                title: form.title.trim(),
                description: form.description.trim(),
                kind: "UPDATE",
                category: "SOCIAL",
                images: images.map((a) => a.s3Path),
                ...(kind === "club"
                    ? { clubId: id, clubName: name }
                    : { clanId: id, clanName: name }),
            });
            toast.success("Post submitted — it will show once an admin approves it.");
            onClose();
            onPosted();
        } catch {
            toast.error("Failed to submit post.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Sheet
            open
            onClose={onClose}
            title={<>New {name} post</>}
            footer={
                <>
                    <SheetCancelButton onClick={onClose}>Cancel</SheetCancelButton>
                    <SheetSubmitButton onClick={submit} disabled={busy}>
                        {busy ? "Posting…" : "Submit for approval"}
                    </SheetSubmitButton>
                </>
            }
        >
            <div className="space-y-3">
                <input
                    className={field}
                    placeholder="Post title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
                <textarea
                    className={field}
                    rows={4}
                    placeholder="What's the update?"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
                <FileUploader
                    label="Photos (optional)"
                    hint="Shown on the post once an admin approves it."
                    accept="image/*"
                    maxFiles={4}
                    variant="grid"
                    value={images}
                    onChange={setImages}
                />
            </div>
        </Sheet>
    );
}
