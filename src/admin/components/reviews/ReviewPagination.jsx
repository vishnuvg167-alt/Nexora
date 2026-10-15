const ReviewPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <div className="flex flex-col gap-4 border-t border-nexora-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-nexora-muted">
        Page{" "}
        <span className="font-semibold text-nexora-text">
          {currentPage}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-nexora-text">
          {totalPages}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg border border-nexora-border bg-nexora-surface px-3 py-2 text-xs font-semibold text-nexora-text hover:border-nexora-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold ${
                currentPage === page
                  ? "bg-nexora-primary text-white"
                  : "border border-nexora-border bg-nexora-surface text-nexora-text hover:border-nexora-primary"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-nexora-border bg-nexora-surface px-3 py-2 text-xs font-semibold text-nexora-text hover:border-nexora-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ReviewPagination;