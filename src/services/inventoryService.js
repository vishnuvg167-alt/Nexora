import api from "./api";

/* =====================================================
   GET ALL INVENTORY ADJUSTMENTS
===================================================== */

export const getInventoryAdjustments =
  async () => {
    const response = await api.get(
      "/inventoryAdjustments"
    );

    return response.data;
  };

/* =====================================================
   GET ADJUSTMENTS BY PRODUCT
===================================================== */

export const getInventoryAdjustmentsByProduct =
  async (productId) => {
    const response = await api.get(
      "/inventoryAdjustments",
      {
        params: {
          productId: String(productId),
        },
      }
    );

    return response.data;
  };

/* =====================================================
   CREATE INVENTORY ADJUSTMENT
===================================================== */

export const createInventoryAdjustment =
  async (adjustmentData) => {
    const response = await api.post(
      "/inventoryAdjustments",
      adjustmentData
    );

    return response.data;
  };