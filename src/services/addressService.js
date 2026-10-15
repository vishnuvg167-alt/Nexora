import api from "./api";

/* ================= GET USER ADDRESSES ================= */

export const getAddressesByUserId = async (
  userId
) => {
  const response = await api.get(
    "/addresses",
    {
      params: {
        userId,
      },
    }
  );

  return response.data;
};

/* ================= CREATE ADDRESS ================= */

export const createAddress = async (
  addressData
) => {
  const response = await api.post(
    "/addresses",
    addressData
  );

  return response.data;
};

/* ================= UPDATE ADDRESS ================= */

export const updateAddress = async (
  id,
  addressData
) => {
  const response = await api.patch(
    `/addresses/${id}`,
    addressData
  );

  return response.data;
};

/* ================= DELETE ADDRESS ================= */

export const deleteAddress = async (
  id
) => {
  await api.delete(
    `/addresses/${id}`
  );

  return id;
};