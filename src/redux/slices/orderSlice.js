import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createOrder,
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
} from "../../services/orderService";

import {
  getProductById,
  updateProductStock,
  updateProductVariants,
} from "../../services/productService";

/* ================= INITIAL STATE ================= */

const initialState = {
  items: [],
  loading: false,
  error: null,

  // Admin order status update
  updatingOrderId: null,

  // Customer cancellation
  cancellingOrderId: null,

  // Admin payment status update
  updatingPaymentOrderId: null,
};

/* =====================================================
   CREATE ORDER
===================================================== */

export const createOrderThunk = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      /*
       * Stock is NOT changed here.
       *
       * Checkout handles:
       * 1. latest stock validation
       * 2. stock reduction
       * 3. order creation
       */

      const data = await createOrder(orderData);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create order"
      );
    }
  }
);

/* =====================================================
   FETCH USER ORDERS
===================================================== */

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (userId, { rejectWithValue }) => {
    try {
      const data = await getOrdersByUserId(userId);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch orders"
      );
    }
  }
);

/* =====================================================
   FETCH ALL ORDERS - ADMIN
===================================================== */

export const fetchAllOrders = createAsyncThunk(
  "orders/fetchAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllOrders();

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch orders"
      );
    }
  }
);

/* =====================================================
   UPDATE ORDER STATUS - ADMIN
===================================================== */

export const updateOrderStatusThunk = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      /* ================= VALIDATION ================= */

      if (!orderId) {
        throw new Error("Invalid order.");
      }

      const normalizedStatus = String(status || "")
        .trim()
        .toLowerCase();

      if (!normalizedStatus) {
        throw new Error("Order status is required.");
      }

      /* ================= DELIVERY TIMESTAMP ================= */

      /*
       * The delivery timestamp is created only when
       * the order reaches the delivered state.
       *
       * Return and replacement windows will use this
       * timestamp instead of the order creation date.
       */

      const deliveredAt =
        normalizedStatus === "delivered"
          ? new Date().toISOString()
          : undefined;

      /* ================= UPDATE ORDER ================= */

      const updatedOrder = await updateOrderStatus(
        orderId,
        normalizedStatus,
        deliveredAt
      );

      return updatedOrder;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update order status"
      );
    }
  }
);

/* =====================================================
   UPDATE PAYMENT STATUS - ADMIN
===================================================== */

export const updatePaymentStatusThunk = createAsyncThunk(
  "orders/updatePaymentStatus",
  async ({ orderId, paymentStatus }, { rejectWithValue }) => {
    try {
      if (!orderId) {
        throw new Error("Invalid order.");
      }

      const normalizedPaymentStatus = String(paymentStatus || "")
        .trim()
        .toLowerCase();

      if (!normalizedPaymentStatus) {
        throw new Error("Payment status is required.");
      }

      const updatedOrder = await updateOrderPaymentStatus(
        orderId,
        normalizedPaymentStatus
      );

      return updatedOrder;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update payment status"
      );
    }
  }
);

/* =====================================================
   CANCEL ORDER - CUSTOMER
===================================================== */

export const cancelOrderThunk = createAsyncThunk(
  "orders/cancelOrder",
  async (order, { rejectWithValue }) => {
    try {
      /* ================= VALIDATE ORDER ================= */

      if (!order?.id) {
        throw new Error("Invalid order.");
      }

      const currentStatus = String(order.status || "placed").toLowerCase();

      /* ================= VALIDATE STATUS ================= */

      const cancellableStatuses = ["placed", "processing"];

      if (!cancellableStatuses.includes(currentStatus)) {
        throw new Error("This order can no longer be cancelled.");
      }

      /* ================= ORDER ITEMS ================= */

      const orderItems = Array.isArray(order.items) ? order.items : [];

      if (orderItems.length === 0) {
        throw new Error("This order does not contain any products.");
      }

      /* =================================================
         RESTORE STOCK
      ================================================= */

      for (const item of orderItems) {
        /* ================= FETCH LATEST PRODUCT ================= */

        const product = await getProductById(item.id);

        if (!product) {
          throw new Error(
            `${item.name || "A product"} could not be found.`
          );
        }

        /* ================= ORDER QUANTITY ================= */

        const orderedQuantity = Number(item.quantity || 0);

        if (
          !Number.isFinite(orderedQuantity) ||
          orderedQuantity <= 0
        ) {
          throw new Error(
            `Invalid quantity for ${item.name || "product"}.`
          );
        }

        /* ================= PRODUCT TYPE ================= */

        const hasVariants =
          Array.isArray(product.variants) &&
          product.variants.length > 0;

        /* =================================================
           VARIANT PRODUCT
        ================================================= */

        if (hasVariants) {
          /*
           * The order item must contain the exact variant
           * that was purchased so that cancellation restores
           * stock to the correct configuration.
           */

          if (!item.variantId) {
            throw new Error(
              `Variant information is missing for ${item.name}.`
            );
          }

          /* ================= FIND VARIANT ================= */

          const variantIndex = product.variants.findIndex(
            (variant) =>
              String(variant.id) === String(item.variantId)
          );

          if (variantIndex === -1) {
            throw new Error(
              `The selected configuration for ${item.name} could not be found.`
            );
          }

          /* ================= CLONE VARIANTS ================= */

          const updatedVariants = product.variants.map((variant) => ({
            ...variant,
          }));

          /* ================= RESTORE VARIANT STOCK ================= */

          const currentVariantStock = Number(
            updatedVariants[variantIndex].stock || 0
          );

          updatedVariants[variantIndex] = {
            ...updatedVariants[variantIndex],
            stock: currentVariantStock + orderedQuantity,
          };

          /* ================= TOTAL PRODUCT STOCK ================= */

          const totalStock = updatedVariants.reduce(
            (total, variant) =>
              total + Number(variant.stock || 0),
            0
          );

          /* ================= SAVE VARIANT STOCK ================= */

          await updateProductVariants(
            product.id,
            updatedVariants,
            totalStock
          );

          /*
           * Variant stock has already been restored.
           * Do not also run simple-product restoration.
           */

          continue;
        }

        /* =================================================
           SIMPLE PRODUCT
        ================================================= */

        const currentStock = Number(product.stock || 0);

        const restoredStock =
          currentStock + orderedQuantity;

        await updateProductStock(
          product.id,
          restoredStock
        );
      }

      /* =================================================
         UPDATE ORDER STATUS
      ================================================= */

      /*
       * The order is marked as cancelled only after
       * all stock restoration operations succeed.
       */

      const updatedOrder = await updateOrderStatus(
        order.id,
        "cancelled"
      );

      return updatedOrder;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to cancel order."
      );
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const orderSlice = createSlice({
  name: "orders",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* =================================================
         CREATE ORDER
      ================================================= */

      .addCase(createOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items.push(action.payload);
      })

      .addCase(createOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message;
      })

      /* =================================================
         FETCH CUSTOMER ORDERS
      ================================================= */

      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = action.payload || [];
      })

      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message;
      })

      /* =================================================
         FETCH ALL ORDERS - ADMIN
      ================================================= */

      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = action.payload || [];
      })

      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message;
      })

      /* =================================================
         UPDATE ORDER STATUS - ADMIN
      ================================================= */

      .addCase(updateOrderStatusThunk.pending, (state, action) => {
        state.error = null;
        state.updatingOrderId = action.meta.arg.orderId;
      })

      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        state.updatingOrderId = null;
        state.error = null;

        const index = state.items.findIndex(
          (order) =>
            String(order.id) === String(action.payload.id)
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(updateOrderStatusThunk.rejected, (state, action) => {
        state.updatingOrderId = null;
        state.error =
          action.payload ||
          action.error.message;
      })

      /* =================================================
         UPDATE PAYMENT STATUS - ADMIN
      ================================================= */

      .addCase(updatePaymentStatusThunk.pending, (state, action) => {
        state.error = null;
        state.updatingPaymentOrderId =
          action.meta.arg.orderId;
      })

      .addCase(
        updatePaymentStatusThunk.fulfilled,
        (state, action) => {
          state.updatingPaymentOrderId = null;
          state.error = null;

          const index = state.items.findIndex(
            (order) =>
              String(order.id) === String(action.payload.id)
          );

          if (index !== -1) {
            state.items[index] = action.payload;
          }
        }
      )

      .addCase(
        updatePaymentStatusThunk.rejected,
        (state, action) => {
          state.updatingPaymentOrderId = null;
          state.error =
            action.payload ||
            action.error.message;
        }
      )

      /* =================================================
         CANCEL ORDER - CUSTOMER
      ================================================= */

      .addCase(cancelOrderThunk.pending, (state, action) => {
        state.error = null;
        state.cancellingOrderId =
          action.meta.arg?.id;
      })

      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.cancellingOrderId = null;
        state.error = null;

        const index = state.items.findIndex(
          (order) =>
            String(order.id) === String(action.payload.id)
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(cancelOrderThunk.rejected, (state, action) => {
        state.cancellingOrderId = null;
        state.error =
          action.payload ||
          action.error.message;
      });
  },
});

export default orderSlice.reducer;