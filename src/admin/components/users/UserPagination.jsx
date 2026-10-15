const UserPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      className="
        flex
        flex-col
        gap-4
        border-t
        border-nexora-border
        bg-nexora-ivory/40
        px-5
        py-4
        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:px-6
      "
    >
      {/* ================= PAGE INFO ================= */}

      <p className="text-sm text-nexora-muted">
        Page{" "}
        <span className="font-semibold text-nexora-text">
          {currentPage}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-nexora-text">
          {totalPages}
        </span>
      </p>

      {/* ================= CONTROLS ================= */}

      <div className="flex items-center gap-2">

        {/* PREVIOUS */}

        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-nexora-border
            bg-nexora-surface
            px-4
            py-2.5
            text-sm
            font-semibold
            text-nexora-text
            hover:border-nexora-primary
            hover:text-nexora-primary
            disabled:cursor-not-allowed
            disabled:bg-nexora-ivory
            disabled:text-nexora-muted
            disabled:opacity-50
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>

          Previous
        </button>

        {/* NEXT */}

        <button
          type="button"
          onClick={handleNext}
          disabled={
            currentPage === totalPages
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-nexora-border
            bg-nexora-surface
            px-4
            py-2.5
            text-sm
            font-semibold
            text-nexora-text
            hover:border-nexora-primary
            hover:text-nexora-primary
            disabled:cursor-not-allowed
            disabled:bg-nexora-ivory
            disabled:text-nexora-muted
            disabled:opacity-50
          "
        >
          Next

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UserPagination;