import type { RootState } from "@/store";

export const selectActorUsers = (state: RootState) => state.lxActor.users;
export const selectCurrentActor = (state: RootState) => state.lxActor.current;
export const selectActorLoading = (state: RootState) => state.lxActor.meStatus === "loading";
export const selectActorRole = (state: RootState) => state.lxActor.current?.role ?? null;
