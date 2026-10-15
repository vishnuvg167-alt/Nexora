import api from "./api";

/* =====================================================
   CREATE REPLACEMENT REQUEST
===================================================== */

export const createReplacementRequest = async (
  replacementData
) => {
  const response = await api.post(
    "/replacements",
    replacementData
  );

  return response.data;
};

/* =====================================================
   GET CUSTOMER REPLACEMENTS
===================================================== */

export const getReplacementsByUserId = async (
  userId
) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const response = await api.get(
    "/replacements",
    {
      params: {
        userId,
      },
    }
  );

  return response.data;
};

/* =====================================================
   GET ALL REPLACEMENTS - ADMIN
===================================================== */

export const getAllReplacements = async () => {
  const response = await api.get(
    "/replacements"
  );

  return response.data;
};

/* =====================================================
   GET REPLACEMENT BY ID
===================================================== */

export const getReplacementById = async (
  replacementId
) => {
  if (!replacementId) {
    throw new Error(
      "Replacement ID is required."
    );
  }

  const response = await api.get(
    `/replacements/${replacementId}`
  );

  return response.data;
};

/* =====================================================
   UPDATE REPLACEMENT
===================================================== */

export const updateReplacement = async (
  replacementId,
  updateData
) => {
  if (!replacementId) {
    throw new Error(
      "Replacement ID is required."
    );
  }

  const response = await api.patch(
    `/replacements/${replacementId}`,
    updateData
  );

  return response.data;
};

/* =====================================================
   DELETE REPLACEMENT
===================================================== */

export const deleteReplacement = async (
  replacementId
) => {
  if (!replacementId) {
    throw new Error(
      "Replacement ID is required."
    );
  }

  await api.delete(
    `/replacements/${replacementId}`
  );

  return replacementId;
};