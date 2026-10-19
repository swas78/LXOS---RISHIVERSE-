"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { can, PERMISSIONS, type Permission } from "@/lib/permissions";
import { fetchMeThunk } from "@/features/lx/actor/actorThunks";

/**
 * Returns a `can(permission)` predicate for the currently-acting user, plus the
 * actor and role. Used to gate UI (nav items, action buttons). The backend is
 * the real enforcement point — this is UX only.
 */
export function useCan() {
    const dispatch = useAppDispatch();
    const actor = useAppSelector((s) => s.lxActor.current);
    const meStatus = useAppSelector((s) => s.lxActor.meStatus);
    const meError = useAppSelector((s) => s.lxActor.meError);
    const permissions = actor?.permissions;

    useEffect(() => {
        if (meStatus === "idle") {
            void dispatch(fetchMeThunk());
        }
    }, [dispatch, meStatus]);

    return {
        actor,
        role: actor?.role ?? null,
        status: meStatus,
        error: meError,
        refetch: () => void dispatch(fetchMeThunk()),
        can: (permission: Permission) => can(permissions, permission),
    };
}

export default useCan;

/**
 * Whether budgets should exist in this person's mental model of the product
 * at all.
 *
 * There are three states, not two, and conflating the last two is a leak:
 *   - can read a figure            → show it
 *   - knows budgets exist, but not this one → show a lock note
 *   - has no budget role at all    → show NOTHING
 *
 * A general student has no budget of their own and no business knowing clubs
 * are funded. Showing them "budget visible to this club's head" tells them
 * exactly what is being withheld, which is worse than silence. Heads and the
 * finance roles already know budgets exist — for them the lock note is honest.
 */
export function useBudgetAwareness() {
    const { can, role } = useCan();
    return can(PERMISSIONS.VIEW_ALL_BUDGETS) || role === "CLUB_HEAD" || role === "CLAN_HEAD";
}
