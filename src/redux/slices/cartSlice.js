import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getCartByUserId,
  createCart,
  updateCart as updateCartApi,
  clearCartById,
} from "../../services/cartService";

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
  items: [],
  cartId: null,
  loading: false,
  error: null,
};

/* =====================================================
   CART ITEM IDENTITY
===================================================== */

/*
  Normal product:
    id = "4"
    variantId = null

  Variant product:
    id = "1"
    variantId = "1-16-512"

  Two cart items are the same only when BOTH
  product ID and variant ID match.
*/

const isSameCartItem = (
  item,
  productId,
  variantId = null
) => {
  const sameProduct =
    String(item.id) ===
    String(productId);

  const itemVariant =
    item.variantId == null
      ? null
      : String(item.variantId);

  const targetVariant =
    variantId == null
      ? null
      : String(variantId);

  return (
    sameProduct &&
    itemVariant === targetVariant
  );
};

/* =====================================================
   FETCH USER CART
===================================================== */

export const fetchCart =
  createAsyncThunk(
    "cart/fetchCart",
    async (
      userId,
      { rejectWithValue }
    ) => {
      try {
        const cart =
          await getCartByUserId(
            userId
          );

        return cart;
      } catch (error) {
        return rejectWithValue(
          error.message ||
            "Failed to fetch cart"
        );
      }
    }
  );

/* =====================================================
   SAVE USER CART
===================================================== */

export const saveCart =
  createAsyncThunk(
    "cart/saveCart",
    async (
      {
        userId,
        cartId,
        items,
      },
      { rejectWithValue }
    ) => {
      try {
        if (cartId) {
          const updatedCart =
            await updateCartApi(
              cartId,
              items
            );

          return updatedCart;
        }

        const newCart =
          await createCart(
            userId,
            items
          );

        return newCart;
      } catch (error) {
        return rejectWithValue(
          error.message ||
            "Failed to save cart"
        );
      }
    }
  );

/* =====================================================
   CLEAR USER CART
===================================================== */

export const clearCartThunk =
  createAsyncThunk(
    "cart/clearCartFromServer",
    async (
      cartId,
      { rejectWithValue }
    ) => {
      try {
        if (!cartId) {
          return null;
        }

        const updatedCart =
          await clearCartById(
            cartId
          );

        return updatedCart;
      } catch (error) {
        return rejectWithValue(
          error.message ||
            "Failed to clear cart"
        );
      }
    }
  );

/* =====================================================
   SLICE
===================================================== */

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    /* =================================================
       LOAD CART
    ================================================= */

    loadCart: (
      state,
      action
    ) => {
      state.items =
        action.payload || [];
    },

    /* =================================================
       ADD TO CART
    ================================================= */

    addToCart: (
      state,
      action
    ) => {
      const product =
        action.payload;

      const productStock =
        Math.max(
          Number(
            product.stock
          ) || 0,
          0
        );

      const requestedQuantity =
        Math.max(
          Number(
            product.quantity
          ) || 1,
          1
        );

      /*
        IMPORTANT:

        Variant products must be matched using:

        product.id + variantId

        Normal products have variantId = null.
      */

      const existingItem =
        state.items.find(
          (item) =>
            isSameCartItem(
              item,
              product.id,
              product.variantId
            )
        );

      if (existingItem) {
        /*
          Keep the latest product/variant
          information.

          This is useful if the user revisits
          Product Details before adding again.
        */

        existingItem.name =
          product.name;

        existingItem.price =
          product.price;

        existingItem.thumbnail =
          product.thumbnail;

        existingItem.stock =
          productStock;

        existingItem.variantId =
          product.variantId ??
          null;

        existingItem.variantLabel =
          product.variantLabel ??
          null;

        existingItem.variantAttributes =
          product.variantAttributes ??
          null;

        existingItem.quantity =
          Math.min(
            existingItem.quantity +
              requestedQuantity,
            productStock
          );

        return;
      }

      /*
        Do not create a cart line for
        an unavailable product/variant.
      */

      if (
        productStock <= 0
      ) {
        return;
      }

      state.items.push({
        ...product,

        stock:
          productStock,

        variantId:
          product.variantId ??
          null,

        variantLabel:
          product.variantLabel ??
          null,

        variantAttributes:
          product.variantAttributes ??
          null,

        quantity:
          Math.min(
            requestedQuantity,
            productStock
          ),
      });
    },

    /* =================================================
       REMOVE CART ITEM
    ================================================= */

    removeCart: (
      state,
      action
    ) => {
      /*
        New preferred payload:

        {
          id: "1",
          variantId: "1-32-1tb"
        }

        Backward compatibility:

        removeCart("4")

        still works for normal products.
      */

      const payload =
        action.payload;

      if (
        payload !== null &&
        typeof payload ===
          "object"
      ) {
        const {
          id,
          variantId = null,
        } = payload;

        state.items =
          state.items.filter(
            (item) =>
              !isSameCartItem(
                item,
                id,
                variantId
              )
          );

        return;
      }

      /*
        Legacy/simple product removal.

        Only remove the normal cart line.

        This prevents removeCart("1")
        from accidentally deleting every
        variant of product 1.
      */

      state.items =
        state.items.filter(
          (item) =>
            !isSameCartItem(
              item,
              payload,
              null
            )
        );
    },

    /* =================================================
       UPDATE QUANTITY
    ================================================= */

    updateCart: (
      state,
      action
    ) => {
      const {
        id,
        variantId = null,
        quantity,
      } = action.payload;

      const item =
        state.items.find(
          (item) =>
            isSameCartItem(
              item,
              id,
              variantId
            )
        );

      if (!item) {
        return;
      }

      const availableStock =
        Math.max(
          Number(
            item.stock
          ) || 0,
          0
        );

      if (
        availableStock <= 0
      ) {
        return;
      }

      item.quantity =
        Math.max(
          1,
          Math.min(
            Number(
              quantity
            ) || 1,
            availableStock
          )
        );
    },

    /* =================================================
       CLEAR CART
    ================================================= */

    clearCart: (
      state
    ) => {
      state.items = [];
      state.cartId = null;
    },
  },

  /* =====================================================
     ASYNC REDUCERS
  ===================================================== */

  extraReducers: (
    builder
  ) => {
    builder

      /* ================= FETCH CART ================= */

      .addCase(
        fetchCart.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchCart.fulfilled,
        (
          state,
          action
        ) => {
          state.loading = false;

          const cart =
            action.payload;

          if (cart) {
            state.cartId =
              cart.id;

            state.items =
              (
                cart.items ||
                []
              ).map(
                (item) => ({
                  ...item,

                  /*
                    Existing carts created before
                    variants won't have these fields.

                    Normalize them here.
                  */

                  variantId:
                    item.variantId ??
                    null,

                  variantLabel:
                    item.variantLabel ??
                    null,

                  variantAttributes:
                    item.variantAttributes ??
                    null,
                })
              );
          } else {
            state.cartId =
              null;

            state.items = [];
          }
        }
      )

      .addCase(
        fetchCart.rejected,
        (
          state,
          action
        ) => {
          state.loading = false;

          state.error =
            action.payload;
        }
      )

      /* ================= SAVE CART ================= */

      .addCase(
        saveCart.pending,
        (state) => {
          state.error = null;
        }
      )

      .addCase(
        saveCart.fulfilled,
        (
          state,
          action
        ) => {
          state.cartId =
            action.payload.id;

          state.items =
            action.payload
              .items || [];
        }
      )

      .addCase(
        saveCart.rejected,
        (
          state,
          action
        ) => {
          state.error =
            action.payload;
        }
      )

      /* ================= CLEAR SERVER CART ================= */

      .addCase(
        clearCartThunk.pending,
        (state) => {
          state.error = null;
        }
      )

      .addCase(
        clearCartThunk.fulfilled,
        (
          state,
          action
        ) => {
          state.items = [];

          /*
            Keep the cart ID because the
            JSON Server cart record still exists.
          */

          if (
            action.payload?.id
          ) {
            state.cartId =
              action.payload.id;
          }
        }
      )

      .addCase(
        clearCartThunk.rejected,
        (
          state,
          action
        ) => {
          state.error =
            action.payload;
        }
      );
  },
});

/* =====================================================
   EXPORT ACTIONS
===================================================== */

export const {
  loadCart,
  addToCart,
  removeCart,
  clearCart,
  updateCart,
} = cartSlice.actions;

export default cartSlice.reducer;