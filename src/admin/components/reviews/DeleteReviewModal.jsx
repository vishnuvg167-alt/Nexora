import { useEffect } from "react";

/* ================= COMPONENT ================= */

const DeleteReviewModal = ({
  review,
  isOpen,
  deleting,
  onClose,
  onConfirm,
}) => {
  /* ================= ESCAPE ================= */

  useEffect(() => {
    if (!isOpen || deleting) {
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
  }, [isOpen, deleting, onClose]);

  if (!isOpen || !review) {
    return null;
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* BACKDROP */}

      <button
        type="button"
        disabled={deleting}
        aria-label="Close delete confirmation"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      {/* MODAL */}

      <div className="relative w-full max-w-md rounded-[1.75rem] border border-nexora-border bg-nexora-surface p-6 shadow-2xl sm:p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v5" />
            <path d="M14 11v5" />
          </svg>
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
          Delete Review
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-nexora-text">
          Remove this review?
        </h2>

        <p className="mt-3 text-sm leading-6 text-nexora-muted">
          The review from{" "}
          <span className="font-semibold text-nexora-text">
            {review.userName || "this customer"}
          </span>{" "}
          will be permanently removed.
        </p>

        <div className="mt-5 rounded-xl border border-nexora-border bg-nexora-ivory p-4">
          <p className="text-sm font-semibold text-nexora-text">
            {review.title || "Untitled Review"}
          </p>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-nexora-muted">
            {review.comment || "No review comment."}
          </p>
        </div>

        <p className="mt-4 text-xs leading-5 text-nexora-muted">
          This action cannot be undone. Product ratings and review
          counts will reflect the remaining reviews.
        </p>

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="flex-1 rounded-xl border border-nexora-border px-4 py-3 text-sm font-semibold text-nexora-text hover:border-nexora-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteReviewModal;