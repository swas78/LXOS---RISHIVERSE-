import { createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";
import {
    actOnCabinBookingThunk,
    bookCabinThunk,
    fetchCabinBlocksThunk,
    fetchCabinBoardThunk,
    fetchDeskBoardThunk,
    liftCabinBlockThunk,
    updateCabinThunk,
} from "./cabinThunks";
import type { LxCabinBlock, LxCabinBoard, LxDeskBoard } from "./types";

type State = {
    board: LxCabinBoard | null;
    deskBoard: LxDeskBoard | null;
    blocks: LxCabinBlock[];
    loading: boolean;
    deskLoading: boolean;
    acting: boolean;
    error: string | null;
};

const initialState: State = {
    board: null,
    deskBoard: null,
    blocks: [],
    loading: false,
    deskLoading: false,
    acting: false,
    error: null,
};

const cabinSlice = createSlice({
    name: "lxCabin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // ---- Student / faculty board ---------------------------------------
            .addCase(fetchCabinBoardThunk.pending, (state) => {
                // The board polls itself every 30s. Only the FIRST load shows a
                // spinner — flashing one every half minute would make a calm screen
                // look broken.
                if (!state.board) state.loading = true;
                state.error = null;
            })
            .addCase(fetchCabinBoardThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.board = action.payload.data;
            })
            .addCase(fetchCabinBoardThunk.rejected, (state, action) => {
                if (action.meta.aborted) return; // superseded by a newer poll
                state.loading = false;
                state.error = action.payload as string;
            })

            // ---- Booking --------------------------------------------------------
            .addCase(bookCabinThunk.pending, (state) => {
                state.acting = true;
            })
            .addCase(bookCabinThunk.fulfilled, (state) => {
                state.acting = false;
                toast.success("Cabin booked — check in at the desk when your slot starts.");
            })
            .addCase(bookCabinThunk.rejected, (state, action) => {
                state.acting = false;
                // Shown inline in the dialog as well; the toast catches the case where
                // the dialog has already closed.
                toast.error(action.payload as string);
            })

            // ---- Desk actions ---------------------------------------------------
            .addCase(actOnCabinBookingThunk.pending, (state) => {
                state.acting = true;
            })
            .addCase(actOnCabinBookingThunk.fulfilled, (state, action) => {
                state.acting = false;
                toast.success(action.payload.message);
            })
            .addCase(actOnCabinBookingThunk.rejected, (state, action) => {
                state.acting = false;
                toast.error(action.payload as string);
            })

            // ---- Librarian desk board -------------------------------------------
            .addCase(fetchDeskBoardThunk.pending, (state) => {
                if (!state.deskBoard) state.deskLoading = true;
            })
            .addCase(fetchDeskBoardThunk.fulfilled, (state, action) => {
                state.deskLoading = false;
                state.deskBoard = action.payload.data;
            })
            .addCase(fetchDeskBoardThunk.rejected, (state, action) => {
                if (action.meta.aborted) return;
                state.deskLoading = false;
                state.error = action.payload as string;
            })

            // ---- Blocks ----------------------------------------------------------
            .addCase(fetchCabinBlocksThunk.fulfilled, (state, action) => {
                state.blocks = action.payload.data;
            })
            .addCase(liftCabinBlockThunk.fulfilled, (state, action) => {
                state.blocks = state.blocks.filter((b) => b.id !== action.payload.data.id);
                toast.success("Block lifted");
            })
            .addCase(liftCabinBlockThunk.rejected, (_state, action) => {
                toast.error(action.payload as string);
            })

            // ---- Cabin service state ---------------------------------------------
            .addCase(updateCabinThunk.fulfilled, (state, action) => {
                const updated = action.payload.data;
                if (state.deskBoard) {
                    state.deskBoard.cabins = state.deskBoard.cabins.map((c) =>
                        c.id === updated.id ? updated : c,
                    );
                }
                toast.success(
                    updated.isActive ? "Cabin back in service" : "Cabin taken out of service",
                );
            })
            .addCase(updateCabinThunk.rejected, (_state, action) => {
                toast.error(action.payload as string);
            });
    },
});

export default cabinSlice.reducer;
