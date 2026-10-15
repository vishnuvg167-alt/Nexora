import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getInventoryAdjustments,
  createInventoryAdjustment,
} from "../../services/inventoryService";

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
  adjustments: [],
  loading: false,
  error: null,
  creating: false,
};

/* =====================================================
   FETCH INVENTORY ADJUSTMENTS
===================================================== */

export const fetchInventoryAdjustments =
  createAsyncThunk(
    "inventory/fetchInventoryAdjustments",
    async (_, { rejectWithValue }) => {
      try {
        const data =
          await getInventoryAdjustments();

        return data;
      } catch (error) {
        return rejectWithValue(
          error.message ||
            "Failed to fetch inventory adjustments"
        );
      }
    }
  );

/* =====================================================
   CREATE INVENTORY ADJUSTMENT
===================================================== */

export const createInventoryAdjustmentThunk =
  createAsyncThunk(
    "inventory/createInventoryAdjustment",
    async (
      adjustmentData,
      { rejectWithValue }
    ) => {
      try {
        const data =
          await createInventoryAdjustment(
            adjustmentData
          );

        return data;
      } catch (error) {
        return rejectWithValue(
          error.message ||
            "Failed to save inventory adjustment"
        );
      }
    }
  );

/* =====================================================
   INVENTORY SLICE
===================================================== */

const inventorySlice = createSlice({
  name: "inventory",

  initialState,

  reducers: {
    clearInventoryError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =================================================
         FETCH HISTORY
      ================================================= */

      .addCase(
        fetchInventoryAdjustments.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchInventoryAdjustments.fulfilled,
        (state, action) => {
          state.loading = false;

          state.adjustments =
            action.payload;
        }
      )

      .addCase(
        fetchInventoryAdjustments.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload;
        }
      )

      /* =================================================
         CREATE HISTORY
      ================================================= */

      .addCase(
        createInventoryAdjustmentThunk.pending,
        (state) => {
          state.creating = true;
          state.error = null;
        }
      )

      .addCase(
        createInventoryAdjustmentThunk.fulfilled,
        (state, action) => {
          state.creating = false;

          /*
            Put the newest adjustment first.

            This makes the UI immediately show
            the latest inventory activity.
          */

          state.adjustments.unshift(
            action.payload
          );
        }
      )

      .addCase(
        createInventoryAdjustmentThunk.rejected,
        (state, action) => {
          state.creating = false;

          state.error =
            action.payload;
        }
      );
  },
});

/* =====================================================
   ACTIONS
===================================================== */

export const {
  clearInventoryError,
} = inventorySlice.actions;

/* =====================================================
   REDUCER
===================================================== */

export default inventorySlice.reducer;