import api from "./api";

/* ================= GET USER CART ================= */

export const getCartByUserId = async (userId) => {
  const response = await api.get(
    "/carts",
    {
      params: {
        userId,
      },
    }
  );

  return response.data[0] || null;
};

/* ================= CREATE CART ================= */

export const createCart = async (
  userId,
  items
) => {
  const response = await api.post(
    "/carts",
    {
      userId,
      items,
    }
  );

  return response.data;
};

/* ================= UPDATE CART ================= */

export const updateCart = async (
  cartId,
  items
) => {
  const response = await api.patch(
    `/carts/${cartId}`,
    {
      items,
    }
  );

  return response.data;
};

/* ================= CLEAR CART ================= */

export const clearCartById = async (
  cartId
) => {
  const response = await api.patch(
    `/carts/${cartId}`,
    {
      items: [],
    }
  );

  return response.data;
};