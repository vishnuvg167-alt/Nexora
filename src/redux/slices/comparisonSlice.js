import { createSlice } from "@reduxjs/toolkit";

const MAX_COMPARE_ITEMS = 3;
const STORAGE_KEY = "nexoraComparison";

/* ================= STORAGE ================= */

const loadComparison = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE_ITEMS) : [];
  } catch (error) {
    console.error("Failed to load comparison:", error);
    return [];
  }
};

const saveComparison = (items) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save comparison:", error);
  }
};

/* ================= INITIAL STATE ================= */

const initialState = {
  items: loadComparison(),
  error: "",
};

/* ================= SLICE ================= */

const comparisonSlice = createSlice({
  name: "comparison",
  initialState,

  reducers: {
    addToComparison: (state, action) => {
      const product = action.payload;
      state.error = "";

      if (!product?.id) {
        state.error = "Invalid product.";
        return;
      }

      const alreadyExists = state.items.some(
        (item) => String(item.id) === String(product.id)
      );

      if (alreadyExists) return;

      if (state.items.length >= MAX_COMPARE_ITEMS) {
        state.error = "You can compare up to 3 products.";
        return;
      }

      if (state.items.length > 0) {
        const comparisonCategory = state.items[0]?.category;

        if (comparisonCategory !== product.category) {
          state.error = "Compare products from the same category.";
          return;
        }
      }

      state.items.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: Number(product.price),
        stock: Number(product.stock),

        thumbnail:
          product.compareImage ||
          product.thumbnail ||
          product.images?.[0] ||
          "",

        rating: Number(product.rating || 0),
        reviewCount: Number(product.reviewCount || 0),

        specifications: product.specifications || {},
        hasVariants: Boolean(product.hasVariants),
        variants: Array.isArray(product.variants) ? product.variants : [],
      });

      saveComparison(state.items);
    },

    removeFromComparison: (state, action) => {
      const productId = action.payload;

      state.items = state.items.filter(
        (item) => String(item.id) !== String(productId)
      );

      state.error = "";
      saveComparison(state.items);
    },

    clearComparison: (state) => {
      state.items = [];
      state.error = "";

      sessionStorage.removeItem(STORAGE_KEY);
    },

    clearComparisonError: (state) => {
      state.error = "";
    },
  },
});

/* ================= EXPORTS ================= */

export const {
  addToComparison,
  removeFromComparison,
  clearComparison,
  clearComparisonError,
} = comparisonSlice.actions;

export default comparisonSlice.reducer;