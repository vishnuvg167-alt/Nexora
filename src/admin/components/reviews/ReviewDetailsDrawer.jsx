import { useEffect } from "react";

/* ================= COMPONENT ================= */

const ReviewDetailsDrawer = ({
  review,
  isOpen,
  onClose,
  onDelete,
}) => {
  /* ================= ESCAPE ================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !review) {
    return null;
  }

  /* ================= DATE ================= */

  const formattedDate = review.createdAt
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(review.createdAt))
    : "—";

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50">
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close review details"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
      />

      {/* DRAWER */}

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col border-l border-nexora-border bg-nexora-surface shadow-2xl">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-nexora-border p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
              Review Details
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-nexora-text">
              Customer Feedback
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-nexora-border text-lg text-nexora-muted hover:border-nexora-primary hover:text-nexora-primary"
          >
            ×
          </button>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto p-6">
          {/* RATING */}

          <section className="rounded-2xl bg-nexora-ivory p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nexora-taupe">
              Rating
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex text-xl text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={
                      index < Number(review.rating)
                        ? "text-amber-500"
                        : "text-nexora-border"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <span className="text-sm font-bold text-nexora-text">
                {Number(review.rating).toFixed(1)} / 5
              </span>
            </div>
          </section>

          {/* REVIEW */}

          <section className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nexora-taupe">
              Review
            </p>

            <h3 className="mt-3 text-xl font-bold text-nexora-text">
              {review.title || "Untitled Review"}
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-nexora-muted">
              {review.comment || "No review comment."}
            </p>
          </section>

          {/* CUSTOMER */}

          <section className="mt-8 border-t border-nexora-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nexora-taupe">
              Customer
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Name"
                value={review.userName || "Unknown"}
              />

              <DetailItem
                label="Customer ID"
                value={review.userId || "—"}
              />
            </div>
          </section>

          {/* PRODUCT */}

          <section className="mt-8 border-t border-nexora-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nexora-taupe">
              Product
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Product"
                value={review.productName || "Unknown Product"}
              />

              <DetailItem
                label="Product ID"
                value={review.productId || "—"}
              />
            </div>
          </section>

          {/* METADATA */}

          <section className="mt-8 border-t border-nexora-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nexora-taupe">
              Information
            </p>

            <div className="mt-4 space-y-4">
              <DetailItem
                label="Review ID"
                value={review.id}
              />

              <DetailItem
                label="Submitted"
                value={formattedDate}
              />
            </div>
          </section>
        </div>

        {/* FOOTER */}

        <div className="flex gap-3 border-t border-nexora-border p-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-nexora-border px-4 py-3 text-sm font-semibold text-nexora-text hover:border-nexora-primary"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => onDelete(review)}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete Review
          </button>
        </div>
      </aside>
    </div>
  );
};

/* ================= DETAIL ITEM ================= */

const DetailItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-nexora-taupe">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-nexora-text">
        {value || "—"}
      </p>
    </div>
  );
};

export default ReviewDetailsDrawer;