const ProductFilter = ({ category, setCategory }) => {
  const categories = [
    "all",
    "Laptops",
    "Graphics Cards",
    "Processors",
    "Monitors",
    "Keyboards",
    "Mice",
    "Headsets",
    "SSDs",
  ];

  return (
    <div>

      <div className="mb-4 flex items-center justify-between">

        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexora-taupe">
          Browse categories
        </p>

        {category !== "all" && (
          <button
            type="button"
            onClick={() => setCategory("all")}
            className="text-xs font-semibold text-nexora-muted transition hover:text-nexora-primary"
          >
            Clear
          </button>
        )}

      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">

        {categories.map((item) => {
          const isActive =
            category === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() =>
                setCategory(item)
              }
              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition duration-200 ${
                isActive
                  ? "border-nexora-primary bg-nexora-primary text-white shadow-sm"
                  : "border-nexora-border bg-nexora-surface text-nexora-muted hover:border-nexora-primary hover:text-nexora-primary"
              }`}
            >
              {item === "all"
                ? "All Products"
                : item}
            </button>
          );
        })}

      </div>
    </div>
  );
};

export default ProductFilter;