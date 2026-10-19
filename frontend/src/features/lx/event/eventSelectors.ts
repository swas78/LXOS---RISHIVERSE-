import type { RootState } from "@/store";

export const selectEvents = (state: RootState) => state.lxEvent.events;
export const selectSelectedEvent = (state: RootState) => state.lxEvent.selected;
export const selectEventsLoading = (state: RootState) => state.lxEvent.loading;
export const selectEventDetailLoading = (state: RootState) => state.lxEvent.detailLoading;
export const selectEventsError = (state: RootState) => state.lxEvent.error;
export const selectEventsPagination = (state: RootState) => state.lxEvent.pagination;
