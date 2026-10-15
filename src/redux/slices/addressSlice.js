import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getAddressesByUserId,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../../services/addressService";

/* =====================================================
   FETCH USER ADDRESSES
===================================================== */

export const fetchAddresses = createAsyncThunk(
  "addresses/fetchAddresses",
  async (userId, { rejectWithValue }) => {
    try {
      const addresses =
        await getAddressesByUserId(userId);

      return addresses;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to load addresses."
      );
    }
  }
);

/* =====================================================
   ADD ADDRESS
===================================================== */

export const addAddressThunk = createAsyncThunk(
  "addresses/addAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const address =
        await createAddress(addressData);

      return address;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to add address."
      );
    }
  }
);

/* =====================================================
   UPDATE ADDRESS
===================================================== */

export const updateAddressThunk = createAsyncThunk(
  "addresses/updateAddress",
  async (
    {
      id,
      addressData,
    },
    { rejectWithValue }
  ) => {
    try {
      const address =
        await updateAddress(
          id,
          addressData
        );

      return address;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update address."
      );
    }
  }
);

/* =====================================================
   DELETE ADDRESS
===================================================== */

export const deleteAddressThunk = createAsyncThunk(
  "addresses/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAddress(id);

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete address."
      );
    }
  }
);

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
  items: [],
  loading: false,
  error: null,
  saving: false,
  deletingId: null,
};

/* =====================================================
   SLICE
===================================================== */

const addressSlice = createSlice({
  name: "addresses",

  initialState,

  reducers: {
    clearAddresses: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.saving = false;
      state.deletingId = null;
    },

    clearAddressError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===============================================
         FETCH
      =============================================== */

      .addCase(
        fetchAddresses.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAddresses.fulfilled,
        (state, action) => {
          state.loading = false;
          state.items =
            action.payload || [];
        }
      )

      .addCase(
        fetchAddresses.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            "Failed to load addresses.";
        }
      )

      /* ===============================================
         ADD
      =============================================== */

      .addCase(
        addAddressThunk.pending,
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )

      .addCase(
        addAddressThunk.fulfilled,
        (state, action) => {
          state.saving = false;

          state.items.push(
            action.payload
          );
        }
      )

      .addCase(
        addAddressThunk.rejected,
        (state, action) => {
          state.saving = false;
          state.error =
            action.payload ||
            "Failed to add address.";
        }
      )

      /* ===============================================
         UPDATE
      =============================================== */

      .addCase(
        updateAddressThunk.pending,
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )

      .addCase(
        updateAddressThunk.fulfilled,
        (state, action) => {
          state.saving = false;

          const index =
            state.items.findIndex(
              (address) =>
                String(address.id) ===
                String(
                  action.payload.id
                )
            );

          if (index !== -1) {
            state.items[index] =
              action.payload;
          }
        }
      )

      .addCase(
        updateAddressThunk.rejected,
        (state, action) => {
          state.saving = false;
          state.error =
            action.payload ||
            "Failed to update address.";
        }
      )

      /* ===============================================
         DELETE
      =============================================== */

      .addCase(
        deleteAddressThunk.pending,
        (state, action) => {
          state.deletingId =
            action.meta.arg;

          state.error = null;
        }
      )

      .addCase(
        deleteAddressThunk.fulfilled,
        (state, action) => {
          state.deletingId = null;

          state.items =
            state.items.filter(
              (address) =>
                String(address.id) !==
                String(action.payload)
            );
        }
      )

      .addCase(
        deleteAddressThunk.rejected,
        (state, action) => {
          state.deletingId = null;

          state.error =
            action.payload ||
            "Failed to delete address.";
        }
      );
  },
});

/* =====================================================
   EXPORTS
===================================================== */

export const {
  clearAddresses,
  clearAddressError,
} = addressSlice.actions;

export default addressSlice.reducer;