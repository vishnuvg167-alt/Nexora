import api from "./api";

/* =====================================================
   GET ALL PRODUCTS
===================================================== */

export const getProducts = async () => {
  const response =
    await api.get(
      "/products"
    );

  return response.data;
};

/* =====================================================
   GET SINGLE PRODUCT
===================================================== */

export const getProductById =
  async (id) => {
    const response =
      await api.get(
        `/products/${id}`
      );

    return response.data;
  };

/* =====================================================
   CREATE PRODUCT
===================================================== */

export const createProduct =
  async (productData) => {
    const response =
      await api.post(
        "/products",
        productData
      );

    return response.data;
  };

/* =====================================================
   UPDATE PRODUCT
===================================================== */

export const updateProduct =
  async (
    id,
    productData
  ) => {
    const response =
      await api.patch(
        `/products/${id}`,
        productData
      );

    return response.data;
  };

/* =====================================================
   DELETE PRODUCT
===================================================== */

export const deleteProduct =
  async (id) => {
    await api.delete(
      `/products/${id}`
    );

    return id;
  };

/* =====================================================
   UPDATE SIMPLE PRODUCT STOCK
===================================================== */

/*
 * Used for products that do NOT have variants.
 *
 * Example:
 *
 * Mechanical Keyboard
 * stock: 24
 *
 * Purchase 2:
 * stock: 22
 */

export const updateProductStock =
  async (
    id,
    stock
  ) => {
    const response =
      await api.patch(
        `/products/${id}`,
        {
          stock:
            Number(stock),
        }
      );

    return response.data;
  };

/* =====================================================
   UPDATE PRODUCT VARIANTS + TOTAL STOCK
===================================================== */

/*
 * Used when a product has variants.
 *
 * Example:
 *
 * variants: [
 *   {
 *     id: "16gb-512gb",
 *     stock: 10
 *   },
 *   {
 *     id: "32gb-1tb",
 *     stock: 5
 *   }
 * ]
 *
 * Product-level stock should represent:
 *
 * 10 + 5 = 15
 *
 * Checkout changes the selected variant,
 * recalculates the total, then sends both
 * values here.
 */

export const updateProductVariants =
  async (
    id,
    variants,
    stock
  ) => {
    const response =
      await api.patch(
        `/products/${id}`,
        {
          variants,
          stock:
            Number(stock),
        }
      );

    return response.data;
  };