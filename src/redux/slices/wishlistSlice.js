import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getWishlistByUserId,
  createWishlistItem,
  deleteWishlistItem,
} from "../../services/wishlistService";

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
  items: [],
  loading: false,
  error: null,
  addingProductId: null,
  removingProductId: null,
};

/* =====================================================
   FETCH USER WISHLIST
===================================================== */

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",

  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error("User ID is required.");
      }

      return await getWishlistByUserId(userId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to load wishlist."
      );
    }
  }
);

/* =====================================================
   ADD TO WISHLIST
===================================================== */

export const addToWishlistThunk = createAsyncThunk(
  "wishlist/addToWishlist",

  async (
    {
      userId,
      product,
    },
    {
      rejectWithValue,
    }
  ) => {
    try {
      if (!userId) {
        throw new Error(
          "You must be logged in to use the wishlist."
        );
      }

      if (!product?.id) {
        throw new Error(
          "Product information is missing."
        );
      }

      /*
       * Check JSON Server first.
       *
       * This protects us from creating duplicate
       * wishlist records for the same user/product.
       */
      const currentWishlist =
        await getWishlistByUserId(userId);

      const existingItem =
        currentWishlist.find(
          (item) =>
            String(item.productId) ===
            String(product.id)
        );

      if (existingItem) {
        return existingItem;
      }

      const wishlistItem = {
        userId: String(userId),

        productId: String(
          product.id
        ),

        name: product.name,

        price: Number(
          product.price
        ),

        thumbnail:
          product.thumbnail || "",

        stock: Number(
          product.stock || 0
        ),

        category:
          product.category || "",

        brand:
          product.brand || "NEXORA",

        createdAt:
          new Date().toISOString(),
      };

      return await createWishlistItem(
        wishlistItem
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to add product to wishlist."
      );
    }
  }
);

/* =====================================================
   REMOVE FROM WISHLIST
===================================================== */

export const removeFromWishlistThunk =
  createAsyncThunk(
    "wishlist/removeFromWishlist",

    async (
      {
        userId,
        productId,
      },
      {
        rejectWithValue,
      }
    ) => {
      try {
        if (!userId) {
          throw new Error(
            "User ID is required."
          );
        }

        if (!productId) {
          throw new Error(
            "Product ID is required."
          );
        }

        /*
         * Find the JSON Server wishlist record.
         */

        const wishlist =
          await getWishlistByUserId(
            userId
          );

        const wishlistItem =
          wishlist.find(
            (item) =>
              String(
                item.productId
              ) ===
              String(
                productId
              )
          );

        /*
         * Already removed.
         *
         * Treat this as successful so Redux
         * can also clean up stale state.
         */

        if (!wishlistItem) {
          return {
            productId: String(
              productId
            ),
          };
        }

        await deleteWishlistItem(
          wishlistItem.id
        );

        return {
          productId: String(
            productId
          ),
        };
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to remove product from wishlist."
        );
      }
    }
  );

/* =====================================================
   SLICE
===================================================== */

const wishlistSlice =
  createSlice({
    name: "wishlist",

    initialState,

    reducers: {
      /* =============================================
         CLEAR WISHLIST FROM REDUX
      ============================================= */

      clearWishlist: (
        state
      ) => {
        state.items = [];
        state.loading = false;
        state.error = null;
        state.addingProductId =
          null;
        state.removingProductId =
          null;
      },

      /* =============================================
         CLEAR ERROR
      ============================================= */

      clearWishlistError: (
        state
      ) => {
        state.error = null;
      },
    },

    extraReducers: (
      builder
    ) => {
      builder

        /* ===========================================
           FETCH
        =========================================== */

        .addCase(
          fetchWishlist.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          fetchWishlist.fulfilled,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.items =
              Array.isArray(
                action.payload
              )
                ? action.payload
                : [];
          }
        )

        .addCase(
          fetchWishlist.rejected,
          (
            state,
            action
          ) => {
            state.loading = false;

            state.error =
              action.payload ||
              "Failed to load wishlist.";
          }
        )

        /* ===========================================
           ADD
        =========================================== */

        .addCase(
          addToWishlistThunk.pending,
          (
            state,
            action
          ) => {
            state.addingProductId =
              action.meta.arg
                .product?.id ??
              null;

            state.error = null;
          }
        )

        .addCase(
          addToWishlistThunk.fulfilled,
          (
            state,
            action
          ) => {
            state.addingProductId =
              null;

            const newItem =
              action.payload;

            const exists =
              state.items.some(
                (item) =>
                  String(
                    item.productId
                  ) ===
                  String(
                    newItem.productId
                  )
              );

            if (!exists) {
              state.items.push(
                newItem
              );
            }
          }
        )

        .addCase(
          addToWishlistThunk.rejected,
          (
            state,
            action
          ) => {
            state.addingProductId =
              null;

            state.error =
              action.payload ||
              "Failed to add product to wishlist.";
          }
        )

        /* ===========================================
           REMOVE
        =========================================== */

        .addCase(
          removeFromWishlistThunk.pending,
          (
            state,
            action
          ) => {
            state.removingProductId =
              action.meta.arg
                .productId ??
              null;

            state.error = null;
          }
        )

        .addCase(
          removeFromWishlistThunk.fulfilled,
          (
            state,
            action
          ) => {
            state.removingProductId =
              null;

            state.items =
              state.items.filter(
                (item) =>
                  String(
                    item.productId
                  ) !==
                  String(
                    action.payload
                      .productId
                  )
              );
          }
        )

        .addCase(
          removeFromWishlistThunk.rejected,
          (
            state,
            action
          ) => {
            state.removingProductId =
              null;

            state.error =
              action.payload ||
              "Failed to remove product from wishlist.";
          }
        );
    },
  });

/* =====================================================
   EXPORTS
===================================================== */

export const {
  clearWishlist,
  clearWishlistError,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;