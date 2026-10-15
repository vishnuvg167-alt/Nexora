import api from "./api";

/* =====================================================
   GET ALL COUPONS
===================================================== */

export const getAllCoupons =
  async () => {
    const response =
      await api.get(
        "/coupons"
      );

    return response.data;
  };

/* =====================================================
   GET COUPON BY CODE
===================================================== */

export const getCouponByCode =
  async (code) => {
    const normalizedCode =
      code
        .trim()
        .toUpperCase();

    const response =
      await api.get(
        "/coupons",
        {
          params: {
            code:
              normalizedCode,
          },
        }
      );

    return (
      response.data?.[0] ||
      null
    );
  };

/* =====================================================
   CREATE COUPON
===================================================== */

export const createCoupon =
  async (couponData) => {
    const response =
      await api.post(
        "/coupons",
        couponData
      );

    return response.data;
  };

/* =====================================================
   UPDATE COUPON
===================================================== */

export const updateCoupon =
  async (
    couponId,
    couponData
  ) => {
    const response =
      await api.patch(
        `/coupons/${couponId}`,
        couponData
      );

    return response.data;
  };

/* =====================================================
   DELETE COUPON
===================================================== */

export const deleteCoupon =
  async (couponId) => {
    await api.delete(
      `/coupons/${couponId}`
    );

    return couponId;
  };