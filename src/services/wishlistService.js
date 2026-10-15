import api from "./api";

/* =====================================================
   GET USER WISHLIST
===================================================== */

export const getWishlistByUserId = async (userId) => {
  const response = await api.get("/wishlists", {
    params: {
      userId: String(userId),
    },
  });

  return response.data;
};

/* =====================================================
   ADD WISHLIST ITEM
===================================================== */

export const createWishlistItem = async (wishlistItem) => {
  const response = await api.post(
    "/wishlists",
    wishlistItem
  );

  return response.data;
};

/* =====================================================
   REMOVE WISHLIST ITEM
===================================================== */

export const deleteWishlistItem = async (wishlistRecordId) => {
  await api.delete(
    `/wishlists/${wishlistRecordId}`
  );

  return wishlistRecordId;
};