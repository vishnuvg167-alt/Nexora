import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createReplacementRequest,
  getReplacementsByUserId,
  getAllReplacements,
  updateReplacement,
} from "../../services/replacementService";

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
  creating: false,
  createError: null,
  updatingReplacementId: null,
  updateError: null,
  inspectingReplacementId: null,
  editingInspectionId: null,
  shippingReplacementId: null,
};

/* ================= HELPERS ================= */

const getReplacementItemKey = (item) =>
  `${String(item?.id)}::${String(item?.variantId || "simple")}`;

const normalizeCondition = (condition) =>
  String(condition || "").trim().toLowerCase();

const normalizeStatus = (status) =>
  String(status || "").trim().toLowerCase();

const getSafeItems = (items) => (Array.isArray(items) ? items : []);

/* ================= CREATE REPLACEMENT ================= */

export const createReplacementRequestThunk = createAsyncThunk(
  "replacements/createReplacementRequest",
  async (replacementData, { rejectWithValue }) => {
    try {
      if (!replacementData?.userId) {
        throw new Error("User ID is required.");
      }

      if (!replacementData?.orderId) {
        throw new Error("Order ID is required.");
      }

      const items = getSafeItems(replacementData.items);

      if (items.length === 0) {
        throw new Error("At least one replacement item is required.");
      }

      const seenItemKeys = new Set();

      for (const item of items) {
        if (!item?.id) {
          throw new Error("Replacement product ID is required.");
        }

        const quantity = Number(item.quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new Error(
            `Invalid replacement quantity for ${item.name || "product"}.`
          );
        }

        const itemKey = getReplacementItemKey(item);

        if (seenItemKeys.has(itemKey)) {
          throw new Error(
            `${item.name || "Product"} appears more than once in this replacement request.`
          );
        }

        seenItemKeys.add(itemKey);
      }

      const reason = String(replacementData.reason || "")
        .trim()
        .toLowerCase();

      const allowedReasons = [
        "defective",
        "damaged",
        "wrong_item",
        "not_working",
        "missing_parts",
        "other",
      ];

      if (!allowedReasons.includes(reason)) {
        throw new Error("Invalid replacement reason.");
      }

      const details = String(replacementData.details || "").trim();

      if (reason === "other" && details.length < 10) {
        throw new Error(
          "Please provide at least 10 characters explaining the replacement."
        );
      }

      const now = new Date().toISOString();

      const payload = {
        userId: replacementData.userId,
        orderId: replacementData.orderId,
        items,
        reason,
        details,

        status: "requested",

        inspectionResult: null,
        inspectionNote: "",

        stockRestored: false,
        replacementStockDeducted: false,

        requestedAt: now,
        approvedAt: null,
        receivedAt: null,
        inspectedAt: null,
        shippedAt: null,
        deliveredAt: null,
        createdAt: now,
        updatedAt: now,
      };

      return await createReplacementRequest(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create replacement request."
      );
    }
  }
);

/* ================= FETCH USER REPLACEMENTS ================= */

export const fetchUserReplacements = createAsyncThunk(
  "replacements/fetchUserReplacements",
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error("User ID is required.");
      }

      const data = await getReplacementsByUserId(userId);

      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch replacement requests."
      );
    }
  }
);

/* ================= FETCH ALL REPLACEMENTS ================= */

export const fetchAllReplacements = createAsyncThunk(
  "replacements/fetchAllReplacements",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllReplacements();

      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch replacements."
      );
    }
  }
);

/* ================= GENERIC UPDATE ================= */

export const updateReplacementThunk = createAsyncThunk(
  "replacements/updateReplacement",
  async ({ replacementId, updateData }, { rejectWithValue }) => {
    try {
      if (!replacementId) {
        throw new Error("Replacement ID is required.");
      }

      if (
        !updateData ||
        typeof updateData !== "object" ||
        Array.isArray(updateData)
      ) {
        throw new Error("Replacement update data is required.");
      }

      return await updateReplacement(replacementId, {
        ...updateData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update replacement."
      );
    }
  }
);

/* ================= UPDATE STATUS ================= */

export const updateReplacementStatusThunk = createAsyncThunk(
  "replacements/updateStatus",
  async ({ replacementRequest, status }, { rejectWithValue }) => {
    try {
      if (!replacementRequest?.id) {
        throw new Error("Replacement request is missing.");
      }

      const currentStatus = normalizeStatus(
        replacementRequest.status || "requested"
      );

      const nextStatus = normalizeStatus(status);

      const allowedTransitions = {
        requested: ["approved", "rejected"],
        approved: ["received"],
        received: [],
        inspected: [],
        shipped: [],
        delivered: [],
        rejected: [],
      };

      const allowedNextStatuses =
        allowedTransitions[currentStatus] || [];

      if (!allowedNextStatuses.includes(nextStatus)) {
        throw new Error(
          `Replacement cannot move from ${currentStatus} to ${nextStatus}.`
        );
      }

      const now = new Date().toISOString();

      const updateData = {
        status: nextStatus,
        updatedAt: now,
      };

      if (nextStatus === "approved") {
        updateData.approvedAt = now;
      }

      if (nextStatus === "received") {
        updateData.receivedAt = now;
      }

      if (nextStatus === "rejected") {
        updateData.rejectedAt = now;
      }

      return await updateReplacement(
        replacementRequest.id,
        updateData
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update replacement status."
      );
    }
  }
);

/* ================= PREPARE INVENTORY ================= */

/*
  Groups replacement items by product.

  This is important when one replacement request contains
  multiple variants belonging to the same product.

  add    = returned original goes back into stock
  remove = outgoing replacement leaves stock
*/

const prepareReplacementStockUpdates = async (items, direction) => {
  if (!["add", "remove"].includes(direction)) {
    throw new Error("Invalid inventory direction.");
  }

  const safeItems = getSafeItems(items);

  if (safeItems.length === 0) {
    throw new Error("No replacement items were found.");
  }

  const groupedItems = new Map();

  for (const item of safeItems) {
    if (!item?.id) {
      throw new Error("Replacement product ID is missing.");
    }

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(
        `Invalid replacement quantity for ${item.name || "product"}.`
      );
    }

    const productKey = String(item.id);

    if (!groupedItems.has(productKey)) {
      groupedItems.set(productKey, []);
    }

    groupedItems.get(productKey).push(item);
  }

  const preparedUpdates = [];

  for (const productItems of groupedItems.values()) {
    const firstItem = productItems[0];
    const product = await getProductById(firstItem.id);

    if (!product) {
      throw new Error(`${firstItem.name || "Product"} no longer exists.`);
    }

    const hasVariants =
      Array.isArray(product.variants) && product.variants.length > 0;

    /* ================= VARIANT PRODUCT ================= */

    if (hasVariants) {
      const updatedVariants = product.variants.map((variant) => {
        const stock = Number(variant.stock);

        if (!Number.isInteger(stock) || stock < 0) {
          throw new Error(
            `Invalid stock for ${variant.label || "product variant"}.`
          );
        }

        return {
          ...variant,
          stock,
        };
      });

      for (const item of productItems) {
        if (!item.variantId) {
          throw new Error(
            `Variant information is missing for ${item.name || "product"}.`
          );
        }

        const variantIndex = updatedVariants.findIndex(
          (variant) =>
            String(variant.id) === String(item.variantId)
        );

        if (variantIndex === -1) {
          throw new Error(
            `The purchased configuration for ${
              item.name || "product"
            } no longer exists.`
          );
        }

        const quantity = Number(item.quantity);
        const currentStock = Number(updatedVariants[variantIndex].stock);

        const newStock =
          direction === "add"
            ? currentStock + quantity
            : currentStock - quantity;

        if (newStock < 0) {
          throw new Error(
            `Not enough stock is available for ${
              item.name || "product"
            }${item.variantLabel ? ` (${item.variantLabel})` : ""}.`
          );
        }

        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          stock: newStock,
        };
      }

      const totalStock = updatedVariants.reduce(
        (total, variant) => total + Number(variant.stock),
        0
      );

      preparedUpdates.push({
        type: "variant",
        productId: product.id,
        variants: updatedVariants,
        stock: totalStock,
      });

      continue;
    }

    /* ================= SIMPLE PRODUCT ================= */

    const currentStock = Number(product.stock);

    if (!Number.isInteger(currentStock) || currentStock < 0) {
      throw new Error(
        `Invalid stock for ${firstItem.name || "product"}.`
      );
    }

    const totalQuantity = productItems.reduce(
      (total, item) => total + Number(item.quantity),
      0
    );

    const newStock =
      direction === "add"
        ? currentStock + totalQuantity
        : currentStock - totalQuantity;

    if (newStock < 0) {
      throw new Error(
        `Not enough stock is available for ${
          firstItem.name || "product"
        }.`
      );
    }

    preparedUpdates.push({
      type: "simple",
      productId: product.id,
      stock: newStock,
    });
  }

  return preparedUpdates;
};

/* ================= APPLY INVENTORY ================= */

const applyReplacementStockUpdate = async (update) => {
  if (update.type === "variant") {
    await updateProductVariants(
      update.productId,
      update.variants,
      update.stock
    );

    return;
  }

  if (update.type === "simple") {
    await updateProductStock(
      update.productId,
      update.stock
    );

    return;
  }

  throw new Error("Invalid replacement inventory update.");
};

const applyReplacementStockUpdates = async (updates) => {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error("No inventory updates were prepared.");
  }

  for (const update of updates) {
    await applyReplacementStockUpdate(update);
  }
};

/* ================= COMPLETE INSPECTION ================= */

export const completeReplacementInspectionThunk = createAsyncThunk(
  "replacements/completeInspection",
  async (
    { replacementRequest, condition, note },
    { rejectWithValue }
  ) => {
    try {
      if (!replacementRequest?.id) {
        throw new Error("Replacement request is missing.");
      }

      const status = normalizeStatus(replacementRequest.status);

      if (status !== "received") {
        throw new Error(
          "Only received replacement items can be inspected."
        );
      }

      const normalizedCondition = normalizeCondition(condition);

      if (
        !["resellable", "defective"].includes(normalizedCondition)
      ) {
        throw new Error("Invalid inspection result.");
      }

      const inspectionNote = String(note || "").trim();

      if (inspectionNote.length < 10) {
        throw new Error(
          "Inspection note must contain at least 10 characters."
        );
      }

      const items = getSafeItems(replacementRequest.items);

      if (items.length === 0) {
        throw new Error("No replacement items were found.");
      }

      let stockRestored = Boolean(
        replacementRequest.stockRestored
      );

      /* ================= RESELLABLE ================= */

      if (normalizedCondition === "resellable") {
        if (stockRestored) {
          throw new Error(
            "Original item stock has already been restored."
          );
        }

        const stockUpdates =
          await prepareReplacementStockUpdates(items, "add");

        await applyReplacementStockUpdates(stockUpdates);

        stockRestored = true;
      }

      /* ================= DEFECTIVE ================= */

      if (normalizedCondition === "defective") {
        stockRestored = false;
      }

      const now = new Date().toISOString();

      return await updateReplacement(replacementRequest.id, {
        status: "inspected",
        inspectionResult: normalizedCondition,
        inspectionNote,
        inspectedAt: now,
        stockRestored,
        updatedAt: now,
      });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to complete replacement inspection."
      );
    }
  }
);

/* ================= EDIT INSPECTION ================= */

export const editReplacementInspectionThunk = createAsyncThunk(
  "replacements/editInspection",
  async (
    {
      replacementRequest,
      condition,
      note,
      editReason,
    },
    { rejectWithValue }
  ) => {
    try {
      if (!replacementRequest?.id) {
        throw new Error("Replacement request is missing.");
      }

      const status = normalizeStatus(replacementRequest.status);

      if (status !== "inspected") {
        throw new Error(
          "Only inspected replacements can have their inspection corrected."
        );
      }

      if (replacementRequest.replacementStockDeducted) {
        throw new Error(
          "Inspection cannot be changed after replacement stock has been deducted."
        );
      }

      const normalizedCondition = normalizeCondition(condition);

      if (
        !["resellable", "defective"].includes(normalizedCondition)
      ) {
        throw new Error("Invalid inspection result.");
      }

      const inspectionNote = String(note || "").trim();

      if (inspectionNote.length < 10) {
        throw new Error(
          "Inspection note must contain at least 10 characters."
        );
      }

      const correctionReason = String(editReason || "").trim();

      if (correctionReason.length < 10) {
        throw new Error(
          "Please explain why the inspection is being corrected."
        );
      }

      const previousCondition = normalizeCondition(
        replacementRequest.inspectionResult
      );

      if (
        !["resellable", "defective"].includes(previousCondition)
      ) {
        throw new Error(
          "The existing inspection result is invalid."
        );
      }

      const items = getSafeItems(replacementRequest.items);

      if (items.length === 0) {
        throw new Error("No replacement items were found.");
      }

      let stockRestored = Boolean(
        replacementRequest.stockRestored
      );

      /* ================= DEFECTIVE → RESELLABLE ================= */

      if (
        previousCondition === "defective" &&
        normalizedCondition === "resellable"
      ) {
        if (stockRestored) {
          throw new Error(
            "Inventory state is inconsistent. Stock is already marked as restored."
          );
        }

        const stockUpdates =
          await prepareReplacementStockUpdates(items, "add");

        await applyReplacementStockUpdates(stockUpdates);

        stockRestored = true;
      }

      /* ================= RESELLABLE → DEFECTIVE ================= */

      if (
        previousCondition === "resellable" &&
        normalizedCondition === "defective"
      ) {
        if (!stockRestored) {
          throw new Error(
            "Inventory state is inconsistent. Restored stock was not recorded."
          );
        }

        const stockUpdates =
          await prepareReplacementStockUpdates(items, "remove");

        await applyReplacementStockUpdates(stockUpdates);

        stockRestored = false;
      }

      const now = new Date().toISOString();

      return await updateReplacement(replacementRequest.id, {
        status: "inspected",
        inspectionResult: normalizedCondition,
        inspectionNote,
        stockRestored,
        inspectionUpdatedAt: now,
        inspectionUpdatedReason: correctionReason,
        updatedAt: now,
      });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to edit replacement inspection."
      );
    }
  }
);

/* ================= SHIP REPLACEMENT ================= */

export const shipReplacementThunk = createAsyncThunk(
  "replacements/shipReplacement",
  async ({ replacementRequest }, { rejectWithValue }) => {
    try {
      if (!replacementRequest?.id) {
        throw new Error("Replacement request is missing.");
      }

      const status = normalizeStatus(replacementRequest.status);

      if (status !== "inspected") {
        throw new Error(
          "Replacement can only be shipped after inspection."
        );
      }

      const inspectionResult = normalizeCondition(
        replacementRequest.inspectionResult
      );

      if (!["resellable", "defective"].includes(inspectionResult)) {
        throw new Error(
          "Replacement inspection has not been completed."
        );
      }

      if (replacementRequest.replacementStockDeducted) {
        throw new Error(
          "Replacement stock has already been deducted."
        );
      }

      const items = getSafeItems(replacementRequest.items);

      if (items.length === 0) {
        throw new Error("No replacement products were found.");
      }

      /*
       * Group all requested items by product before changing
       * inventory. This prevents multiple variants of the
       * same product from overwriting each other's stock.
       */

      const stockUpdates =
        await prepareReplacementStockUpdates(items, "remove");

      await applyReplacementStockUpdates(stockUpdates);

      const now = new Date().toISOString();

      return await updateReplacement(replacementRequest.id, {
        status: "shipped",
        replacementStockDeducted: true,
        shippedAt: now,
        updatedAt: now,
      });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to ship replacement."
      );
    }
  }
);

/* ================= MARK DELIVERED ================= */

export const markReplacementDeliveredThunk = createAsyncThunk(
  "replacements/markDelivered",
  async ({ replacementRequest }, { rejectWithValue }) => {
    try {
      if (!replacementRequest?.id) {
        throw new Error("Replacement request is missing.");
      }

      const status = normalizeStatus(replacementRequest.status);

      if (status !== "shipped") {
        throw new Error(
          "Only shipped replacements can be marked as delivered."
        );
      }

      if (!replacementRequest.replacementStockDeducted) {
        throw new Error(
          "Replacement inventory has not been deducted."
        );
      }

      const now = new Date().toISOString();

      return await updateReplacement(replacementRequest.id, {
        status: "delivered",
        deliveredAt: now,
        updatedAt: now,
      });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to mark replacement as delivered."
      );
    }
  }
);

/* ================= STATE HELPER ================= */

const replaceReplacement = (state, updatedReplacement) => {
  if (!updatedReplacement?.id) return;

  const index = state.items.findIndex(
    (item) =>
      String(item.id) === String(updatedReplacement.id)
  );

  if (index !== -1) {
    state.items[index] = updatedReplacement;
  } else {
    state.items.push(updatedReplacement);
  }
};

/* ================= SLICE ================= */

const replacementSlice = createSlice({
  name: "replacements",
  initialState,

  reducers: {
    clearReplacements: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.creating = false;
      state.createError = null;
      state.updatingReplacementId = null;
      state.updateError = null;
      state.inspectingReplacementId = null;
      state.editingInspectionId = null;
      state.shippingReplacementId = null;
    },

    clearReplacementError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
    },

    clearReplacementCreateError: (state) => {
      state.createError = null;
    },

    clearReplacementUpdateError: (state) => {
      state.updateError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= CREATE ================= */

      .addCase(createReplacementRequestThunk.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })

      .addCase(
        createReplacementRequestThunk.fulfilled,
        (state, action) => {
          state.creating = false;
          state.createError = null;

          replaceReplacement(state, action.payload);
        }
      )

      .addCase(
        createReplacementRequestThunk.rejected,
        (state, action) => {
          state.creating = false;
          state.createError =
            action.payload ||
            action.error.message ||
            "Failed to create replacement request.";
        }
      )

      /* ================= FETCH USER ================= */

      .addCase(fetchUserReplacements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUserReplacements.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : [];
      })

      .addCase(fetchUserReplacements.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "Failed to fetch replacement requests.";
      })

      /* ================= FETCH ALL ================= */

      .addCase(fetchAllReplacements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllReplacements.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : [];
      })

      .addCase(fetchAllReplacements.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error.message ||
          "Failed to fetch replacements.";
      })

      /* ================= GENERIC UPDATE ================= */

      .addCase(updateReplacementThunk.pending, (state, action) => {
        state.updatingReplacementId =
          action.meta.arg?.replacementId || null;

        state.updateError = null;
      })

      .addCase(updateReplacementThunk.fulfilled, (state, action) => {
        state.updatingReplacementId = null;
        state.updateError = null;

        replaceReplacement(state, action.payload);
      })

      .addCase(updateReplacementThunk.rejected, (state, action) => {
        state.updatingReplacementId = null;

        state.updateError =
          action.payload ||
          action.error.message ||
          "Failed to update replacement.";
      })

      /* ================= STATUS ================= */

      .addCase(
        updateReplacementStatusThunk.pending,
        (state, action) => {
          state.updatingReplacementId =
            action.meta.arg?.replacementRequest?.id || null;

          state.updateError = null;
        }
      )

      .addCase(
        updateReplacementStatusThunk.fulfilled,
        (state, action) => {
          state.updatingReplacementId = null;
          state.updateError = null;

          replaceReplacement(state, action.payload);
        }
      )

      .addCase(
        updateReplacementStatusThunk.rejected,
        (state, action) => {
          state.updatingReplacementId = null;

          state.updateError =
            action.payload ||
            action.error.message ||
            "Failed to update replacement status.";
        }
      )

      /* ================= COMPLETE INSPECTION ================= */

      .addCase(
        completeReplacementInspectionThunk.pending,
        (state, action) => {
          state.inspectingReplacementId =
            action.meta.arg?.replacementRequest?.id || null;

          state.updateError = null;
        }
      )

      .addCase(
        completeReplacementInspectionThunk.fulfilled,
        (state, action) => {
          state.inspectingReplacementId = null;
          state.updateError = null;

          replaceReplacement(state, action.payload);
        }
      )

      .addCase(
        completeReplacementInspectionThunk.rejected,
        (state, action) => {
          state.inspectingReplacementId = null;

          state.updateError =
            action.payload ||
            action.error.message ||
            "Failed to complete replacement inspection.";
        }
      )

      /* ================= EDIT INSPECTION ================= */

      .addCase(
        editReplacementInspectionThunk.pending,
        (state, action) => {
          state.editingInspectionId =
            action.meta.arg?.replacementRequest?.id || null;

          state.updateError = null;
        }
      )

      .addCase(
        editReplacementInspectionThunk.fulfilled,
        (state, action) => {
          state.editingInspectionId = null;
          state.updateError = null;

          replaceReplacement(state, action.payload);
        }
      )

      .addCase(
        editReplacementInspectionThunk.rejected,
        (state, action) => {
          state.editingInspectionId = null;

          state.updateError =
            action.payload ||
            action.error.message ||
            "Failed to edit replacement inspection.";
        }
      )

      /* ================= SHIP ================= */

      .addCase(shipReplacementThunk.pending, (state, action) => {
        state.shippingReplacementId =
          action.meta.arg?.replacementRequest?.id || null;

        state.updateError = null;
      })

      .addCase(shipReplacementThunk.fulfilled, (state, action) => {
        state.shippingReplacementId = null;
        state.updateError = null;

        replaceReplacement(state, action.payload);
      })

      .addCase(shipReplacementThunk.rejected, (state, action) => {
        state.shippingReplacementId = null;

        state.updateError =
          action.payload ||
          action.error.message ||
          "Failed to ship replacement.";
      })

      /* ================= DELIVERED ================= */

      .addCase(
        markReplacementDeliveredThunk.pending,
        (state, action) => {
          state.updatingReplacementId =
            action.meta.arg?.replacementRequest?.id || null;

          state.updateError = null;
        }
      )

      .addCase(
        markReplacementDeliveredThunk.fulfilled,
        (state, action) => {
          state.updatingReplacementId = null;
          state.updateError = null;

          replaceReplacement(state, action.payload);
        }
      )

      .addCase(
        markReplacementDeliveredThunk.rejected,
        (state, action) => {
          state.updatingReplacementId = null;

          state.updateError =
            action.payload ||
            action.error.message ||
            "Failed to mark replacement as delivered.";
        }
      );
  },
});

/* ================= ACTIONS ================= */

export const {
  clearReplacements,
  clearReplacementError,
  clearReplacementCreateError,
  clearReplacementUpdateError,
} = replacementSlice.actions;

/* ================= REDUCER ================= */

export default replacementSlice.reducer;