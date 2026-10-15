import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  updateProductVariants,
} from "../../services/productService";

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
  items: [],
  loading: false,
  error: null,
};

/* =====================================================
   FETCH PRODUCTS
===================================================== */

export const fetchProducts =
  createAsyncThunk(
    "products/fetchProducts",

    async (
      _,
      { rejectWithValue }
    ) => {
      try {
        const data =
          await getProducts();

        return data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to fetch products"
        );
      }
    }
  );

/* =====================================================
   ADD PRODUCT
===================================================== */

export const addProductThunk =
  createAsyncThunk(
    "products/addProduct",

    async (
      productData,
      { rejectWithValue }
    ) => {
      try {
        const data =
          await createProduct(
            productData
          );

        return data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to add product"
        );
      }
    }
  );

/* =====================================================
   UPDATE PRODUCT
===================================================== */

export const updateProductThunk =
  createAsyncThunk(
    "products/updateProduct",

    async (
      {
        id,
        productData,
      },
      { rejectWithValue }
    ) => {
      try {
        const data =
          await updateProduct(
            id,
            productData
          );

        return data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to update product"
        );
      }
    }
  );

/* =====================================================
   DELETE PRODUCT
===================================================== */

export const deleteProductThunk =
  createAsyncThunk(
    "products/deleteProduct",

    async (
      id,
      { rejectWithValue }
    ) => {
      try {
        await deleteProduct(
          id
        );

        return id;
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to delete product"
        );
      }
    }
  );

/* =====================================================
   UPDATE SIMPLE PRODUCT STOCK

   Used when the product does NOT have variants.

   Example:

   Mouse
   stock: 10 → 15
===================================================== */

export const updateProductStockThunk =
  createAsyncThunk(
    "products/updateProductStock",

    async (
      {
        id,
        stock,
      },
      { rejectWithValue }
    ) => {
      try {
        const numericStock =
          Number(stock);

        if (
          !Number.isInteger(
            numericStock
          ) ||
          numericStock < 0
        ) {
          throw new Error(
            "Product stock must be a non-negative whole number."
          );
        }

        const data =
          await updateProductStock(
            id,
            numericStock
          );

        return data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to update product stock"
        );
      }
    }
  );

/* =====================================================
   UPDATE VARIANT PRODUCT STOCK

   Used when the product HAS variants.

   The caller supplies the complete updated variants
   array and the recalculated parent stock.

   Example:

   16GB / 512GB → 10
   16GB / 1TB   → 10
   32GB / 1TB   → 5 → 8

   Parent:
   25 → 28
===================================================== */

export const updateProductVariantsThunk =
  createAsyncThunk(
    "products/updateProductVariants",

    async (
      {
        id,
        variants,
        stock,
      },
      { rejectWithValue }
    ) => {
      try {
        /* =============================================
           VALIDATE PRODUCT ID
        ============================================= */

        if (
          id === undefined ||
          id === null ||
          id === ""
        ) {
          throw new Error(
            "Product ID is required."
          );
        }

        /* =============================================
           VALIDATE VARIANTS
        ============================================= */

        if (
          !Array.isArray(
            variants
          ) ||
          variants.length === 0
        ) {
          throw new Error(
            "Variant data is required."
          );
        }

        const normalizedVariants =
          variants.map(
            (variant) => {
              if (
                variant?.id ===
                  undefined ||
                variant?.id ===
                  null ||
                variant?.id === ""
              ) {
                throw new Error(
                  "Every product variant must have an ID."
                );
              }

              const variantStock =
                Number(
                  variant.stock
                );

              if (
                !Number.isInteger(
                  variantStock
                ) ||
                variantStock < 0
              ) {
                throw new Error(
                  `Invalid stock for ${
                    variant.label ||
                    "product variant"
                  }.`
                );
              }

              return {
                ...variant,

                stock:
                  variantStock,
              };
            }
          );

        /* =============================================
           CALCULATE EXPECTED PARENT STOCK

           Do not blindly trust the supplied parent stock.
        ============================================= */

        const calculatedStock =
          normalizedVariants.reduce(
            (
              total,
              variant
            ) =>
              total +
              variant.stock,
            0
          );

        const suppliedStock =
          Number(stock);

        if (
          !Number.isInteger(
            suppliedStock
          ) ||
          suppliedStock < 0
        ) {
          throw new Error(
            "Parent product stock is invalid."
          );
        }

        if (
          suppliedStock !==
          calculatedStock
        ) {
          throw new Error(
            `Inventory mismatch. Variant stock totals ${calculatedStock}, but parent stock was ${suppliedStock}.`
          );
        }

        /* =============================================
           UPDATE PRODUCT

           Both values are patched together:

           variants
           stock
        ============================================= */

        const data =
          await updateProductVariants(
            id,
            normalizedVariants,
            calculatedStock
          );

        return data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to update product variant stock"
        );
      }
    }
  );

/* =====================================================
   PRODUCT SLICE
===================================================== */

const productSlice =
  createSlice({
    name: "products",

    initialState,

    reducers: {},

    extraReducers: (
      builder
    ) => {
      builder

        /* =================================================
           FETCH
        ================================================= */

        .addCase(
          fetchProducts.pending,

          (state) => {
            state.loading =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          fetchProducts.fulfilled,

          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              null;

            state.items =
              Array.isArray(
                action.payload
              )
                ? action.payload
                : [];
          }
        )

        .addCase(
          fetchProducts.rejected,

          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              action.payload ||
              "Failed to fetch products";
          }
        )

        /* =================================================
           ADD
        ================================================= */

        .addCase(
          addProductThunk.pending,

          (state) => {
            state.error =
              null;
          }
        )

        .addCase(
          addProductThunk.fulfilled,

          (
            state,
            action
          ) => {
            state.error =
              null;

            state.items.push(
              action.payload
            );
          }
        )

        .addCase(
          addProductThunk.rejected,

          (
            state,
            action
          ) => {
            state.error =
              action.payload ||
              "Failed to add product";
          }
        )

        /* =================================================
           UPDATE PRODUCT
        ================================================= */

        .addCase(
          updateProductThunk.pending,

          (state) => {
            state.error =
              null;
          }
        )

        .addCase(
          updateProductThunk.fulfilled,

          (
            state,
            action
          ) => {
            state.error =
              null;

            const index =
              state.items.findIndex(
                (product) =>
                  String(
                    product.id
                  ) ===
                  String(
                    action.payload
                      ?.id
                  )
              );

            if (
              index !== -1
            ) {
              state.items[
                index
              ] =
                action.payload;
            }
          }
        )

        .addCase(
          updateProductThunk.rejected,

          (
            state,
            action
          ) => {
            state.error =
              action.payload ||
              "Failed to update product";
          }
        )

        /* =================================================
           UPDATE SIMPLE STOCK
        ================================================= */

        .addCase(
          updateProductStockThunk.pending,

          (state) => {
            state.error =
              null;
          }
        )

        .addCase(
          updateProductStockThunk.fulfilled,

          (
            state,
            action
          ) => {
            state.error =
              null;

            const index =
              state.items.findIndex(
                (product) =>
                  String(
                    product.id
                  ) ===
                  String(
                    action.payload
                      ?.id
                  )
              );

            if (
              index !== -1
            ) {
              state.items[
                index
              ] =
                action.payload;
            }
          }
        )

        .addCase(
          updateProductStockThunk.rejected,

          (
            state,
            action
          ) => {
            state.error =
              action.payload ||
              "Failed to update product stock";
          }
        )

        /* =================================================
           UPDATE VARIANT STOCK
        ================================================= */

        .addCase(
          updateProductVariantsThunk.pending,

          (state) => {
            state.error =
              null;
          }
        )

        .addCase(
          updateProductVariantsThunk.fulfilled,

          (
            state,
            action
          ) => {
            state.error =
              null;

            const index =
              state.items.findIndex(
                (product) =>
                  String(
                    product.id
                  ) ===
                  String(
                    action.payload
                      ?.id
                  )
              );

            if (
              index !== -1
            ) {
              state.items[
                index
              ] =
                action.payload;
            }
          }
        )

        .addCase(
          updateProductVariantsThunk.rejected,

          (
            state,
            action
          ) => {
            state.error =
              action.payload ||
              "Failed to update product variant stock";
          }
        )

        /* =================================================
           DELETE
        ================================================= */

        .addCase(
          deleteProductThunk.pending,

          (state) => {
            state.error =
              null;
          }
        )

        .addCase(
          deleteProductThunk.fulfilled,

          (
            state,
            action
          ) => {
            state.error =
              null;

            state.items =
              state.items.filter(
                (product) =>
                  String(
                    product.id
                  ) !==
                  String(
                    action.payload
                  )
              );
          }
        )

        .addCase(
          deleteProductThunk.rejected,

          (
            state,
            action
          ) => {
            state.error =
              action.payload ||
              "Failed to delete product";
          }
        );
    },
  });

export default productSlice.reducer;