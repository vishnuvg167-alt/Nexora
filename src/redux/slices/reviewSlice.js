import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getAllReviews,
  getReviewsByProduct,
  createReview,
  deleteReview,
} from "../../services/reviewService";

/* ================= FETCH REVIEWS FOR ONE PRODUCT ================= */

export const fetchReviews = createAsyncThunk(
  "reviews/fetchReviews",

  async (productId, { rejectWithValue }) => {
    try {
      const reviews = await getReviewsByProduct(productId);

      return reviews;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch reviews"
      );
    }
  }
);

/* ================= FETCH ALL REVIEWS ================= */

export const fetchAllReviews = createAsyncThunk(
  "reviews/fetchAllReviews",

  async (_, { rejectWithValue }) => {
    try {
      const reviews = await getAllReviews();

      return reviews;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch all reviews"
      );
    }
  }
);

/* ================= ADD REVIEW ================= */

export const addReview = createAsyncThunk(
  "reviews/addReview",

  async (reviewData, { rejectWithValue }) => {
    try {
      const review = await createReview(reviewData);

      return review;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to submit review"
      );
    }
  }
);

/* ================= DELETE REVIEW ================= */

export const deleteReviewThunk = createAsyncThunk(
  "reviews/deleteReview",

  async (reviewId, { rejectWithValue }) => {
    try {
      await deleteReview(reviewId);

      return reviewId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete review"
      );
    }
  }
);

/* ================= INITIAL STATE ================= */

const initialState = {
  items: [],
  allItems: [],
  loading: false,
  submitting: false,
  deletingReviewId: null,
  error: null,
};

/* ================= SLICE ================= */

const reviewSlice = createSlice({
  name: "reviews",

  initialState,

  reducers: {
    clearReviews: (state) => {
      state.items = [];
      state.error = null;
    },

    clearReviewError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- FETCH REVIEWS FOR ONE PRODUCT ---------- */

      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })

      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch reviews";
      })

      /* ---------- FETCH ALL REVIEWS ---------- */

      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload;
      })

      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch all reviews";
      })

      /* ---------- ADD REVIEW ---------- */

      .addCase(addReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })

      .addCase(addReview.fulfilled, (state, action) => {
        state.submitting = false;

        state.items.unshift(action.payload);
        state.allItems.unshift(action.payload);
      })

      .addCase(addReview.rejected, (state, action) => {
        state.submitting = false;
        state.error =
          action.payload || "Failed to submit review";
      })

      /* ---------- DELETE REVIEW ---------- */

      .addCase(deleteReviewThunk.pending, (state, action) => {
        state.deletingReviewId = action.meta.arg;
        state.error = null;
      })

      .addCase(deleteReviewThunk.fulfilled, (state, action) => {
        state.deletingReviewId = null;

        state.items = state.items.filter(
          (review) =>
            String(review.id) !== String(action.payload)
        );

        state.allItems = state.allItems.filter(
          (review) =>
            String(review.id) !== String(action.payload)
        );
      })

      .addCase(deleteReviewThunk.rejected, (state, action) => {
        state.deletingReviewId = null;

        state.error =
          action.payload || "Failed to delete review";
      });
  },
});

export const {
  clearReviews,
  clearReviewError,
} = reviewSlice.actions;

export default reviewSlice.reducer;