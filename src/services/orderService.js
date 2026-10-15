import api from "./api";

/* =====================================================
   CREATE ORDER
===================================================== */

export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);

  return response.data;
};

/* =====================================================
   GET CUSTOMER ORDERS
===================================================== */

export const getOrdersByUserId = async (userId) => {
  const response = await api.get("/orders", {
    params: {
      userId,
    },
  });

  return response.data;
};

/* =====================================================
   GET ALL ORDERS - ADMIN
===================================================== */

export const getAllOrders = async () => {
  const response = await api.get("/orders");

  return response.data;
};

/* =====================================================
   UPDATE ORDER STATUS - ADMIN
===================================================== */

export const updateOrderStatus = async (
  orderId,
  status,
  deliveredAt
) => {
  const updateData = {
    status,
  };

  /*
   * deliveredAt is stored only when the order
   * reaches the delivered state.
   *
   * This timestamp becomes the source of truth
   * for return and replacement policy windows.
   */
  if (deliveredAt) {
    updateData.deliveredAt = deliveredAt;
  }

  const response = await api.patch(
    `/orders/${orderId}`,
    updateData
  );

  return response.data;
};

/* =====================================================
   UPDATE PAYMENT STATUS - ADMIN
===================================================== */

export const updateOrderPaymentStatus = async (
  orderId,
  paymentStatus
) => {
  const response = await api.patch(
    `/orders/${orderId}`,
    {
      paymentStatus,
    }
  );

  return response.data;
};