import type { RootState } from "@/store";

export const selectCabinBoard = (s: RootState) => s.lxCabin.board;
export const selectCabinLoading = (s: RootState) => s.lxCabin.loading;
export const selectCabinActing = (s: RootState) => s.lxCabin.acting;
export const selectDeskBoard = (s: RootState) => s.lxCabin.deskBoard;
export const selectDeskLoading = (s: RootState) => s.lxCabin.deskLoading;
export const selectCabinBlocks = (s: RootState) => s.lxCabin.blocks;

/// The bookings a student should see pinned at the top — the ones still live.
export const selectMyLiveBookings = (s: RootState) =>
    (s.lxCabin.board?.myBookings ?? []).filter(
        (b) => b.status === "BOOKED" || b.status === "CHECKED_IN",
    );
