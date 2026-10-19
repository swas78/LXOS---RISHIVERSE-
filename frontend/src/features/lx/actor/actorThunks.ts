import { createAsyncThunk } from "@reduxjs/toolkit";
import { extractApiErrorMessage } from "@/utility/errorHelper";
import { actorApi } from "./actorApi";

export const fetchUsersThunk = createAsyncThunk(
    "lxActor/fetchUsers",
    async (_: void, { rejectWithValue }) => {
        try {
            return await actorApi.getUsers();
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load users"));
        }
    },
);

export const fetchMeThunk = createAsyncThunk(
    "lxActor/fetchMe",
    async (_: void, { rejectWithValue }) => {
        try {
            return await actorApi.getMe();
        } catch (err) {
            return rejectWithValue(extractApiErrorMessage(err, "Failed to load current user"));
        }
    },
);
