// Split from the slice: types -> Api -> Thunks -> Slice.
//
// A slice that calls axios is a reducer that can fail over the network — the
// HTTP surface disappears into state management, and nothing can call the
// endpoint without going through Redux. Production requires the same four-file
// shape the full-stack entities already use, so these modules now match.
import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { feedApi } from "./feedApi";

export const fetchFeedThunk = createAsyncThunk(
    "lxFeed/fetch",
    async (params: { kind?: string } | undefined, { signal, rejectWithValue }) => {
        try {
            return await feedApi.getAll(params, signal);
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load feed"));
        }
    },
);
