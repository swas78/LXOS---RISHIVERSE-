import { createSlice } from "@reduxjs/toolkit";
import { fetchMeThunk, fetchUsersThunk } from "./actorThunks";
import type { LxActor, LxMember } from "./types";

type ActorState = {
    users: LxMember[];
    current: LxActor | null;
    meStatus: "idle" | "loading" | "succeeded" | "failed";
    meError: string | null;
};

const initialState: ActorState = {
    users: [],
    current: null,
    meStatus: "idle",
    meError: null,
};

const slice = createSlice({
    name: "lxActor",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchUsersThunk
            .addCase(fetchUsersThunk.pending, (state) => {
                // Not tracking loading globally anymore, users list can load in background
            })
            .addCase(fetchUsersThunk.fulfilled, (state, action) => {
                state.users = action.payload.data;
            })
            .addCase(fetchUsersThunk.rejected, (state) => {
                // error handling for users list if needed
            })
            // fetchMeThunk
            .addCase(fetchMeThunk.pending, (state) => {
                state.meStatus = "loading";
                state.meError = null;
            })
            .addCase(fetchMeThunk.fulfilled, (state, action) => {
                state.meStatus = "succeeded";
                state.current = action.payload.data;
            })
            .addCase(fetchMeThunk.rejected, (state, action) => {
                state.meStatus = "failed";
                state.meError = action.error.message || "Failed to fetch permissions";
            });
    },
});

export default slice.reducer;
