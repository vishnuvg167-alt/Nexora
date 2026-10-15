import api from "./api";

/* ================= GET ALL REVIEWS ================= */

export const getAllReviews = async () => {
  const response = await api.get("/reviews");

  return response.data;
};

/* ================= GET PRODUCT REVIEWS ================= */

export const getReviewsByProduct = async (productId) => {
  const response = await api.get("/reviews");

  return response.data.filter(
    (review) => String(review.productId) === String(productId)
  );
};

/* ================= CREATE REVIEW ================= */

export const createReview = async (reviewData) => {
  const response = await api.post("/reviews", reviewData);

  return response.data;
};

/* ================= DELETE REVIEW ================= */

export const deleteReview = async (reviewId) => {
  await api.delete(`/reviews/${reviewId}`);

  return reviewId;
};