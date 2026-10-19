import { createAsyncThunk } from "@reduxjs/toolkit";
import { cabinApi } from "./cabinApi";
import type { CreateLxCabinBookingPayload, LxCabinBookingAction } from "./types";

// Axios errors carry the server's message; surfacing it is the whole point —
// "Cabin P1 is for groups of 3-6. You have 1." is far more useful than "failed".
const messageOf = (error: unknown, fallback: string) =>
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

export const fetchCabinBoardThunk = createAsyncThunk(
    "lxCabin/fetchBoard",
    async (_: void, { signal, rejectWithValue }) => {
        try {
            return await cabinApi.getBoard(signal);
        } catch (error) {
            return rejectWithValue(messageOf(error, "Could not reach the library service."));
        }
    },
);

export const bookCabinThunk = createAsyncThunk(
    "lxCabin/book",
    async (payload: CreateLxCabinBookingPayload, { rejectWithValue }) => {
        try {
            return await cabinApi.book(payload);
        } catch (error) {
            return rejectWithValue(messageOf(error, "Could not complete the booking."));
        }
    },
);

export const actOnCabinBookingThunk = createAsyncThunk(
    "lxCabin/act",
    async ({ id, action }: { id: string; action: LxCabinBookingAction }, { rejectWithValue }) => {
        try {
            return await cabinApi.act(id, action);
        } catch (error) {
            return rejectWithValue(messageOf(error, "That did not work."));
        }
    },
);

export const fetchDeskBoardThunk = createAsyncThunk(
    "lxCabin/fetchDeskBoard",
    async (_: void, { signal, rejectWithValue }) => {
        try {
            return await cabinApi.getDeskBoard(signal);
        } catch (error) {
            return rejectWithValue(messageOf(error, "Could not load the desk board."));
        }
    },
);

export const fetchCabinBlocksThunk = createAsyncThunk(
    "lxCabin/fetchBlocks",
    async (_: void, { signal, rejectWithValue }) => {
        try {
            return await cabinApi.listBlocks(signal);
        } catch (error) {
            return rejectWithValue(messageOf(error, "Could not load the block list."));
        }
    },
);

export const liftCabinBlockThunk = createAsyncThunk(
    "lxCabin/liftBlock",
    async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
        try {
            return await cabinApi.liftBlock(id, reason);
        } catch (error) {
            return rejectWithValue(messageOf(error, "Could not lift the block."));
        }
    },
);

export const updateCabinThunk = createAsyncThunk(
    "lxCabin/updateCabin",
    async (
        {
            id,
            payload,
        }: { id: string; payload: { isActive?: boolean; unavailableReason?: string | null } },
        { rejectWithValue },
    ) => {
        try {
            return await cabinApi.updateCabin(id, payload);
        } catch (error) {
            return rejectWithValue(messageOf(error, "Could not update the cabin."));
        }
    },
);
