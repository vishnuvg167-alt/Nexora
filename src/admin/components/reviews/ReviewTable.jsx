const ReviewTable = ({
  reviews,
  deletingReviewId,
  onView,
  onDelete,
}) => {
  /* ================= DATE FORMAT ================= */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  /* ================= UI ================= */

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px]">
        <thead>
          <tr className="border-b border-nexora-border bg-nexora-ivory">
            <TableHeading>Customer</TableHeading>
            <TableHeading>Product</TableHeading>
            <TableHeading>Rating</TableHeading>
            <TableHeading>Review</TableHeading>
            <TableHeading>Date</TableHeading>
            <TableHeading align="right">Actions</TableHeading>
          </tr>
        </thead>

        <tbody>
          {reviews.map((review) => {
            const isDeleting =
              String(deletingReviewId) === String(review.id);

            return (
              <tr
                key={review.id}
                className="border-b border-nexora-border last:border-b-0 hover:bg-nexora-ivory/60"
              >
                {/* CUSTOMER */}

                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nexora-primary-soft text-sm font-bold uppercase text-nexora-primary">
                      {review.userName?.charAt(0) || "?"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-nexora-text">
                        {review.userName || "Unknown Customer"}
                      </p>

                      <p className="mt-1 max-w-[150px] truncate text-xs text-nexora-muted">
                        {review.userId || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* PRODUCT */}

                <td className="px-6 py-5">
                  <div className="max-w-[190px]">
                    <p className="truncate text-sm font-semibold text-nexora-text">
                      {review.productName || "Unknown Product"}
                    </p>

                    <p className="mt-1 text-xs text-nexora-muted">
                      Product #{review.productId}
                    </p>
                  </div>
                </td>

                {/* RATING */}

                <td className="px-6 py-5">
                  <RatingStars rating={review.rating} />
                </td>

                {/* REVIEW */}

                <td className="px-6 py-5">
                  <div className="max-w-[280px]">
                    <p className="truncate text-sm font-semibold text-nexora-text">
                      {review.title || "Untitled Review"}
                    </p>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-nexora-muted">
                      {review.comment || "No review comment."}
                    </p>
                  </div>
                </td>

                {/* DATE */}

                <td className="whitespace-nowrap px-6 py-5 text-sm text-nexora-muted">
                  {formatDate(review.createdAt)}
                </td>

                {/* ACTIONS */}

                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView(review)}
                      className="rounded-lg border border-nexora-border bg-nexora-surface px-3 py-2 text-xs font-semibold text-nexora-text hover:border-nexora-primary hover:text-nexora-primary"
                    >
                      View
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => onDelete(review)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ================= TABLE HEADING ================= */

const TableHeading = ({ children, align = "left" }) => {
  return (
    <th
      className={`px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
};

/* ================= RATING ================= */

const RatingStars = ({ rating }) => {
  const numericRating = Number(rating || 0);

  return (
    <div>
      <div
        className="flex gap-0.5 text-amber-500"
        aria-label={`${numericRating} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={
              index < numericRating
                ? "text-amber-500"
                : "text-nexora-border"
            }
          >
            ★
          </span>
        ))}
      </div>

      <p className="mt-1 text-xs font-semibold text-nexora-muted">
        {numericRating.toFixed(1)} / 5
      </p>
    </div>
  );
};

export default ReviewTable;
