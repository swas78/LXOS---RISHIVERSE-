import type { RootState } from "@/store";

export const selectRooms = (state: RootState) => state.lxRoom.rooms;
export const selectRoomsLoading = (state: RootState) => state.lxRoom.loading;
export const selectRoomsError = (state: RootState) => state.lxRoom.error;
export const selectRoomsPagination = (state: RootState) => state.lxRoom.pagination;
