import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getNotificationsByUserId,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/notificationService";

/* =====================================================
   FETCH USER NOTIFICATIONS
===================================================== */

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (userId, { rejectWithValue }) => {
    try {
      return await getNotificationsByUserId(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to load notifications."
      );
    }
  }
);

/* =====================================================
   CREATE NOTIFICATION
===================================================== */

export const createNotificationThunk = createAsyncThunk(
  "notifications/createNotification",
  async (notificationData, { rejectWithValue }) => {
    try {
      return await createNotification(notificationData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create notification."
      );
    }
  }
);

/* =====================================================
   MARK ONE AS READ
===================================================== */

export const markNotificationAsReadThunk = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      return await markNotificationAsRead(notificationId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update notification."
      );
    }
  }
);

/* =====================================================
   MARK ALL AS READ
===================================================== */

export const markAllNotificationsAsReadThunk = createAsyncThunk(
  "notifications/markAllAsRead",
  async (notifications, { rejectWithValue }) => {
    try {
      return await markAllNotificationsAsRead(notifications);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update notifications."
      );
    }
  }
);

/* =====================================================
   DELETE NOTIFICATION
===================================================== */

export const deleteNotificationThunk = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      return await deleteNotification(notificationId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete notification."
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
  error: "",
  markingAll: false,
  updatingNotificationId: null,
  deletingNotificationId: null,
};

/* =====================================================
   SLICE
===================================================== */

const notificationSlice = createSlice({
  name: "notifications",

  initialState,

  reducers: {
    clearNotifications: (state) => {
      state.items = [];
      state.error = "";
      state.updatingNotificationId = null;
      state.deletingNotificationId = null;
    },

    clearNotificationError: (state) => {
      state.error = "";
    },
  },

  extraReducers: (builder) => {
    builder
      /* ================= FETCH ================= */

      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = "";
      })

      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;

        state.items = [...action.payload].sort((a, b) => {
          const dateA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;

          const dateB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;

          return dateB - dateA;
        });
      })

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to load notifications.";
      })

      /* ================= CREATE ================= */

      .addCase(createNotificationThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      /* ================= MARK ONE READ ================= */

      .addCase(markNotificationAsReadThunk.pending, (state, action) => {
        state.updatingNotificationId = action.meta.arg;
      })

      .addCase(markNotificationAsReadThunk.fulfilled, (state, action) => {
        state.updatingNotificationId = null;

        const index = state.items.findIndex(
          (notification) =>
            String(notification.id) === String(action.payload.id)
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(markNotificationAsReadThunk.rejected, (state, action) => {
        state.updatingNotificationId = null;
        state.error =
          action.payload || "Failed to update notification.";
      })

      /* ================= MARK ALL READ ================= */

      .addCase(markAllNotificationsAsReadThunk.pending, (state) => {
        state.markingAll = true;
      })

      .addCase(
        markAllNotificationsAsReadThunk.fulfilled,
        (state, action) => {
          state.markingAll = false;

          const updatedNotifications = action.payload;

          state.items = state.items.map((notification) => {
            const updatedNotification = updatedNotifications.find(
              (updated) =>
                String(updated.id) === String(notification.id)
            );

            return updatedNotification || notification;
          });
        }
      )

      .addCase(markAllNotificationsAsReadThunk.rejected, (state, action) => {
        state.markingAll = false;
        state.error =
          action.payload || "Failed to update notifications.";
      })

      /* ================= DELETE ================= */

      .addCase(deleteNotificationThunk.pending, (state, action) => {
        state.deletingNotificationId = action.meta.arg;
      })

      .addCase(deleteNotificationThunk.fulfilled, (state, action) => {
        state.deletingNotificationId = null;

        state.items = state.items.filter(
          (notification) =>
            String(notification.id) !== String(action.payload)
        );
      })

      .addCase(deleteNotificationThunk.rejected, (state, action) => {
        state.deletingNotificationId = null;
        state.error =
          action.payload || "Failed to delete notification.";
      });
  },
});

export const {
  clearNotifications,
  clearNotificationError,
} = notificationSlice.actions;

export default notificationSlice.reducer;