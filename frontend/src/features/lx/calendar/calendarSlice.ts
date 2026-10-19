import { createSlice } from "@reduxjs/toolkit";
import { fetchCalendarThunk } from "./calendarThunks";
import type { CalendarEvent } from "./types";

type State = { events: CalendarEvent[]; loading: boolean; error: string | null };
const initialState: State = { events: [], loading: false, error: null };

const slice = createSlice({
    name: "lxCalendar",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCalendarThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCalendarThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.events = action.payload;
            })
            .addCase(fetchCalendarThunk.rejected, (state, action) => {
                if (action.meta.aborted) return;
                state.loading = false;
                state.error = (action.payload as string) || "Failed to load calendar";
            });
    },
});

export default slice.reducer;
