const ProductPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className="
        flex
        flex-col
        gap-3
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      {/* ================= PAGE INFO ================= */}

      <p
        className="
          text-xs
          font-medium
          text-nexora-muted
        "
      >
        Page{" "}
        <span className="font-bold text-nexora-text">
          {currentPage}
        </span>{" "}
        of{" "}
        <span className="font-bold text-nexora-text">
          {totalPages}
        </span>
      </p>

      {/* ================= CONTROLS ================= */}

      <div className="flex items-center gap-2">

        {/* PREVIOUS */}

        <button
          type="button"
          disabled={
            currentPage === 1
          }
          onClick={() =>
            onPageChange(
              currentPage - 1
            )
          }
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-nexora-border
            bg-nexora-surface
            px-4
            py-2.5
            text-xs
            font-semibold
            text-nexora-muted
            transition
            hover:border-nexora-primary/30
            hover:bg-nexora-primary-soft
            hover:text-nexora-primary
            disabled:cursor-not-allowed
            disabled:bg-nexora-ivory
            disabled:text-nexora-muted/50
            disabled:opacity-60
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>

          Previous
        </button>

        {/* NEXT */}

        <button
          type="button"
          disabled={
            currentPage ===
            totalPages
          }
          onClick={() =>
            onPageChange(
              currentPage + 1
            )
          }
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-nexora-border
            bg-nexora-surface
            px-4
            py-2.5
            text-xs
            font-semibold
            text-nexora-muted
            transition
            hover:border-nexora-primary/30
            hover:bg-nexora-primary-soft
            hover:text-nexora-primary
            disabled:cursor-not-allowed
            disabled:bg-nexora-ivory
            disabled:text-nexora-muted/50
            disabled:opacity-60
          "
        >
          Next

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

      </div>
    </div>
  );
};

export default ProductPagination;