const ProductSort = ({
  sort,
  setSort,
}) => {
  return (
    <div className="relative w-full lg:max-w-56">

      <select
        value={sort}
        onChange={(e) =>
          setSort(e.target.value)
        }
        aria-label="Sort products"
        className="
          w-full
          appearance-none
          rounded-xl
          border border-nexora-border
          bg-nexora-ivory
          py-2.5
          pl-4
          pr-10
          text-sm
          font-medium
          text-nexora-text
          outline-none
          transition
          hover:border-nexora-taupe
          focus:border-nexora-primary
          focus:bg-nexora-surface
          focus:ring-2
          focus:ring-nexora-primary/10
        "
      >
        <option value="default">
          Featured
        </option>

        <option value="low-high">
          Price: Low to High
        </option>

        <option value="high-low">
          Price: High to Low
        </option>
      </select>

      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-4 w-4 text-nexora-primary"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>

      </div>
    </div>
  );
};

export default ProductSort;