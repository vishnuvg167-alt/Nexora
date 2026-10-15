import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getAllUsers,
  updateUserBlockStatus,
} from "../../services/adminUserService";

/* ================= INITIAL STATE ================= */

const initialState = {
  items: [],
  loading: false,
  error: null,
};

/* ================= FETCH USERS ================= */

export const fetchAdminUsers = createAsyncThunk(
  "adminUsers/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const users = await getAllUsers();

      // Only customers should appear
      // in admin user management.
      return users.filter(
        (user) => user.role !== "admin"
      );
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to fetch users"
      );
    }
  }
);

/* ================= BLOCK / UNBLOCK USER ================= */

export const toggleUserBlock = createAsyncThunk(
  "adminUsers/toggleBlock",
  async (
    { userId, isBlocked },
    { rejectWithValue }
  ) => {
    try {
      const updatedUser =
        await updateUserBlockStatus(
          userId,
          isBlocked
        );

      return updatedUser;
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to update user"
      );
    }
  }
);

/* ================= SLICE ================= */

const adminUserSlice = createSlice({
  name: "adminUsers",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* ---------- FETCH USERS ---------- */

      .addCase(
        fetchAdminUsers.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAdminUsers.fulfilled,
        (state, action) => {
          state.loading = false;
          state.items = action.payload;
        }
      )

      .addCase(
        fetchAdminUsers.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      /* ---------- BLOCK / UNBLOCK ---------- */

      .addCase(
        toggleUserBlock.pending,
        (state) => {
          state.error = null;
        }
      )

      .addCase(
        toggleUserBlock.fulfilled,
        (state, action) => {
          const index =
            state.items.findIndex(
              (user) =>
                user.id ===
                action.payload.id
            );

          if (index !== -1) {
            state.items[index] =
              action.payload;
          }
        }
      )

      .addCase(
        toggleUserBlock.rejected,
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export default adminUserSlice.reducer;