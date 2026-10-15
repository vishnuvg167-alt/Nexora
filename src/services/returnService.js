import api from "./api";

/* =====================================================
   CREATE RETURN REQUEST
===================================================== */

export const createReturnRequest =
  async (returnData) => {
    const response =
      await api.post(
        "/returns",
        returnData
      );

    return response.data;
  };

/* =====================================================
   GET RETURNS FOR CUSTOMER
===================================================== */

export const getReturnsByUserId =
  async (userId) => {
    const response =
      await api.get(
        "/returns",
        {
          params: {
            userId,
          },
        }
      );

    return response.data;
  };

/* =====================================================
   GET RETURN BY ORDER
===================================================== */

export const getReturnByOrderId =
  async (orderId) => {
    const response =
      await api.get(
        "/returns",
        {
          params: {
            orderId,
          },
        }
      );

    return (
      response.data?.[0] ||
      null
    );
  };

/* =====================================================
   GET ALL RETURNS - ADMIN
===================================================== */

export const getAllReturns =
  async () => {
    const response =
      await api.get(
        "/returns"
      );

    return response.data;
  };

/* =====================================================
   UPDATE RETURN STATUS
===================================================== */

export const updateReturnStatus =
  async (
    returnId,
    status
  ) => {
    const response =
      await api.patch(
        `/returns/${returnId}`,
        {
          status,
        }
      );

    return response.data;
  };

/* =====================================================
   UPDATE REFUND STATUS
===================================================== */

export const updateRefundStatus =
  async (
    returnId,
    refundStatus
  ) => {
    const response =
      await api.patch(
        `/returns/${returnId}`,
        {
          refundStatus,
        }
      );

    return response.data;
  };

/* =====================================================
   UPDATE RETURN REQUEST
===================================================== */

export const updateReturnRequest =
  async (
    returnId,
    returnData
  ) => {
    const response =
      await api.patch(
        `/returns/${returnId}`,
        returnData
      );

    return response.data;
  };