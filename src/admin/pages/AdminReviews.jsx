import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAllReviews,
  deleteReviewThunk,
} from "../../redux/slices/reviewSlice";

import { fetchProducts } from "../../redux/slices/productSlice";

import ReviewTable from "../components/reviews/ReviewTable";
import ReviewPagination from "../components/reviews/ReviewPagination";
import ReviewDetailsDrawer from "../components/reviews/ReviewDetailsDrawer";
import DeleteReviewModal from "../components/reviews/DeleteReviewModal";

/* ================= CONSTANTS ================= */

const REVIEWS_PER_PAGE = 8;

/* ================= COMPONENT ================= */

const AdminReviews = () => {
  const dispatch = useDispatch();

  /* ================= REDUX ================= */

  const {
    allItems: reviews,
    loading,
    error,
    deletingReviewId,
  } = useSelector((state) => state.reviews);

  const products = useSelector(
    (state) => state.products.items
  );

  /* ================= LOCAL STATE ================= */

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    dispatch(fetchAllReviews());
    dispatch(fetchProducts());
  }, [dispatch]);

  /* ================= ENRICH REVIEWS ================= */

  const enrichedReviews = useMemo(() => {
    return reviews.map((review) => {
      const product = products.find(
        (product) =>
          String(product.id) === String(review.productId)
      );

      return {
        ...review,
        productName: product?.name || "Unknown Product",
        productBrand: product?.brand || "",
        productCategory: product?.category || "",
      };
    });
  }, [reviews, products]);

  /* ================= REVIEW STATISTICS ================= */

  const totalReviews = enrichedReviews.length;

  const averageRating =
    totalReviews > 0
      ? enrichedReviews.reduce(
          (total, review) =>
            total + Number(review.rating || 0),
          0
        ) / totalReviews
      : 0;

  const fiveStarReviews = enrichedReviews.filter(
    (review) => Number(review.rating) === 5
  ).length;

  const lowRatingReviews = enrichedReviews.filter(
    (review) => Number(review.rating) <= 2
  ).length;

  /* ================= FILTER REVIEWS ================= */

  const filteredReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return enrichedReviews.filter((review) => {
      const searchableText = [
        review.id,
        review.productId,
        review.productName,
        review.productBrand,
        review.productCategory,
        review.userId,
        review.userName,
        review.title,
        review.comment,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      const matchesRating =
        ratingFilter === "all" ||
        Number(review.rating) === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [enrichedReviews, search, ratingFilter]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(
    filteredReviews.length / REVIEWS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * REVIEWS_PER_PAGE;

  const paginatedReviews = filteredReviews.slice(
    startIndex,
    startIndex + REVIEWS_PER_PAGE
  );

  /* ================= RESET PAGE ================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [search, ratingFilter]);

  /* ================= KEEP PAGE VALID ================= */

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* ================= DELETE REVIEW ================= */

  const handleDeleteReview = async () => {
    if (!reviewToDelete) {
      return;
    }

    try {
      await dispatch(
        deleteReviewThunk(reviewToDelete.id)
      ).unwrap();

      if (
        selectedReview &&
        String(selectedReview.id) ===
          String(reviewToDelete.id)
      ) {
        setSelectedReview(null);
      }

      setReviewToDelete(null);
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-nexora-taupe">
            Customer Feedback
          </p>

          <h1 className="text-3xl font-bold tracking-[-0.04em] text-nexora-text sm:text-4xl">
            Reviews
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-nexora-muted">
            Monitor customer feedback, inspect product reviews
            and remove inappropriate content.
          </p>
        </div>
      </section>

      {/* ================= STATS ================= */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Reviews"
          value={totalReviews}
          type="total"
        />

        <StatCard
          label="Average Rating"
          value={
            totalReviews > 0
              ? `${averageRating.toFixed(1)} / 5`
              : "—"
          }
          type="average"
        />

        <StatCard
          label="5-Star Reviews"
          value={fiveStarReviews}
          type="positive"
        />

        <StatCard
          label="Low Ratings"
          value={lowRatingReviews}
          type="low"
        />
      </section>

      {/* ================= REVIEWS PANEL ================= */}

      <section className="overflow-hidden rounded-[1.75rem] border border-nexora-border bg-nexora-surface shadow-sm">
        {/* ================= TOOLBAR ================= */}

        <div className="flex flex-col gap-4 border-b border-nexora-border p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-nexora-text">
              Review Directory
            </h2>

            <p className="mt-1 text-sm text-nexora-muted">
              {filteredReviews.length}{" "}
              {filteredReviews.length === 1
                ? "review"
                : "reviews"}{" "}
              found
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            {/* ================= SEARCH ================= */}

            <div className="relative w-full sm:w-72">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-nexora-taupe"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search reviews..."
                className="h-11 w-full rounded-xl border border-nexora-border bg-nexora-ivory pl-11 pr-4 text-sm text-nexora-text outline-none placeholder:text-nexora-muted focus:border-nexora-primary focus:ring-2 focus:ring-nexora-primary/10"
              />
            </div>

            {/* ================= RATING FILTER ================= */}

            <select
              value={ratingFilter}
              onChange={(event) =>
                setRatingFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-nexora-border bg-nexora-ivory px-4 text-sm font-medium text-nexora-text outline-none focus:border-nexora-primary focus:ring-2 focus:ring-nexora-primary/10"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* ================= CONTENT ================= */}

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            error={error}
            onRetry={() => dispatch(fetchAllReviews())}
          />
        ) : filteredReviews.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search) ||
              ratingFilter !== "all"
            }
          />
        ) : (
          <>
            <ReviewTable
              reviews={paginatedReviews}
              deletingReviewId={deletingReviewId}
              onView={setSelectedReview}
              onDelete={setReviewToDelete}
            />

            <ReviewPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>

      {/* ================= DETAILS DRAWER ================= */}

      <ReviewDetailsDrawer
        review={selectedReview}
        isOpen={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        onDelete={(review) => setReviewToDelete(review)}
      />

      {/* ================= DELETE MODAL ================= */}

      <DeleteReviewModal
        review={reviewToDelete}
        isOpen={Boolean(reviewToDelete)}
        deleting={
          reviewToDelete
            ? String(deletingReviewId) ===
              String(reviewToDelete.id)
            : false
        }
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleDeleteReview}
      />
    </div>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({ label, value, type }) => {
  const styles = {
    total: {
      wrapper: "bg-nexora-primary-soft",
      value: "text-nexora-primary",
    },

    average: {
      wrapper: "bg-amber-50",
      value: "text-amber-700",
    },

    positive: {
      wrapper: "bg-emerald-50",
      value: "text-emerald-700",
    },

    low: {
      wrapper: "bg-red-50",
      value: "text-red-700",
    },
  };

  const currentStyle = styles[type] || styles.total;

  return (
    <article className="rounded-2xl border border-nexora-border bg-nexora-surface p-5 shadow-sm">
      <div
        className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${currentStyle.wrapper}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
          className={`h-5 w-5 ${currentStyle.value}`}
        >
          <path d="m12 2.5 2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.32l-5.8 3.05 1.11-6.47-4.7-4.58 6.49-.94L12 2.5Z" />
        </svg>
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-nexora-taupe">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold tracking-[-0.04em] ${currentStyle.value}`}
      >
        {value}
      </p>
    </article>
  );
};

/* =====================================================
   LOADING STATE
===================================================== */

const LoadingState = () => {
  return (
    <div className="flex min-h-64 items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexora-primary-soft border-t-nexora-primary" />

        <p className="text-sm text-nexora-muted">
          Loading reviews...
        </p>
      </div>
    </div>
  );
};

/* =====================================================
   ERROR STATE
===================================================== */

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="flex min-h-64 items-center justify-center p-6">
      <div className="text-center">
        <p className="font-semibold text-red-700">
          Unable to load reviews
        </p>

        <p className="mt-2 text-sm text-nexora-muted">
          {typeof error === "string"
            ? error
            : "Something went wrong while loading reviews."}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-nexora-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-nexora-primary-hover"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

/* =====================================================
   EMPTY STATE
===================================================== */

const EmptyState = ({ hasFilters }) => {
  return (
    <div className="flex min-h-64 items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-nexora-primary-soft text-nexora-primary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
          </svg>
        </div>

        <h3 className="mt-4 font-semibold text-nexora-text">
          {hasFilters
            ? "No reviews found"
            : "No reviews yet"}
        </h3>

        <p className="mt-1 text-sm text-nexora-muted">
          {hasFilters
            ? "Try changing your search or rating filter."
            : "Customer reviews will appear here."}
        </p>
      </div>
    </div>
  );
};

export default AdminReviews;