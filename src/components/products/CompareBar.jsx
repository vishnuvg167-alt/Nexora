import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  clearComparison,
  removeFromComparison,
} from "../../redux/slices/comparisonSlice";

const CompareBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, error } = useSelector((state) => state.comparison);

  if (items.length === 0) return null;

  const canCompare = items.length >= 2;

  const handleCompare = () => {
    if (!canCompare) return;
    navigate("/compare");
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2">
      <div className="rounded-[1.5rem] border border-nexora-border bg-nexora-surface/95 p-4 shadow-[0_20px_60px_rgba(18,63,50,0.18)] backdrop-blur-xl">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* ================= LEFT ================= */}

          <div className="flex items-center justify-between gap-4 lg:min-w-[170px]">
            <div>
              <p className="text-sm font-black text-nexora-text">
                Compare Products
              </p>

              <p className="mt-1 text-xs text-nexora-muted">
                {items.length} / 3 selected
              </p>
            </div>

            <button
              type="button"
              onClick={() => dispatch(clearComparison())}
              className="text-xs font-bold text-nexora-muted transition hover:text-nexora-primary lg:hidden"
            >
              Clear all
            </button>
          </div>

          {/* ================= PRODUCTS ================= */}

          <div className="flex flex-1 gap-2 overflow-x-auto">
            {items.map((product) => (
              <div
                key={product.id}
                className="flex min-w-[190px] flex-1 items-center gap-3 rounded-2xl border border-nexora-border bg-nexora-ivory p-2.5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-nexora-muted">
                      —
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-nexora-text">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-nexora-primary">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    dispatch(removeFromComparison(product.id))
                  }
                  aria-label={`Remove ${product.name} from comparison`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-nexora-muted transition hover:bg-nexora-copper-soft hover:text-nexora-copper"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6l12 12M18 6 6 18"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* ================= ACTIONS ================= */}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => dispatch(clearComparison())}
              className="hidden text-xs font-bold text-nexora-muted transition hover:text-nexora-primary lg:block"
            >
              Clear all
            </button>

            <button
              type="button"
              onClick={handleCompare}
              disabled={!canCompare}
              className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-nexora-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:bg-nexora-primary-soft disabled:text-nexora-muted lg:flex-none"
            >
              Compare

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M13 6l6 6-6 6"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mt-3 rounded-xl bg-nexora-copper-soft px-4 py-2.5 text-xs font-semibold text-nexora-copper">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareBar;