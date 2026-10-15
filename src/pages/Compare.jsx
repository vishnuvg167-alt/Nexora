import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  clearComparison,
  removeFromComparison,
} from "../redux/slices/comparisonSlice";

/* ================= HELPERS ================= */

const formatValue = (value) => {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return Object.values(value).join(", ");

  return String(value);
};

const formatSpecificationLabel = (key) => {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/* ================= COMPONENT ================= */

const Compare = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.comparison);

  /* ================= SPECIFICATION KEYS ================= */

  const specificationKeys = [
    ...new Set(
      items.flatMap((product) => Object.keys(product.specifications || {}))
    ),
  ];

  /* ================= EMPTY STATE ================= */

  if (items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-nexora-primary-soft text-nexora-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7h11m0 0-3-3m3 3-3 3M16 17H5m0 0 3 3m-3-3 3-3"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-[-0.04em] text-nexora-text">
            Nothing to compare yet
          </h1>

          <p className="mt-3 text-sm leading-6 text-nexora-muted">
            Select two or more products from the same category to compare
            their prices, specifications and availability.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-nexora-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-nexora-primary-hover"
          >
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-5 border-b border-nexora-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-nexora-taupe">
            Product Comparison
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-nexora-text sm:text-4xl">
            Compare your picks
          </h1>

          <p className="mt-3 text-sm text-nexora-muted">
            {items.length} product{items.length !== 1 ? "s" : ""} selected
            {items[0]?.category ? ` · ${items[0].category}` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(clearComparison())}
          className="self-start text-sm font-bold text-nexora-muted transition hover:text-nexora-copper sm:self-auto"
        >
          Clear comparison
        </button>
      </div>

      {/* ================= MOBILE HINT ================= */}

      <p className="mt-5 text-xs text-nexora-muted md:hidden">
        Swipe horizontally to compare products →
      </p>

      {/* ================= TABLE ================= */}

      <div className="mt-8 overflow-x-auto">
        <div
          className="grid min-w-[700px] overflow-hidden rounded-[1.75rem] border border-nexora-border bg-nexora-surface"
          style={{
            gridTemplateColumns: `180px repeat(${items.length}, minmax(220px, 1fr))`,
          }}
        >

          {/* ================= PRODUCT HEADER ================= */}

          <div className="border-b border-r border-nexora-border bg-nexora-ivory p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-nexora-muted">
              Product
            </p>
          </div>

          {items.map((product) => (
            <div
              key={product.id}
              className="relative border-b border-r border-nexora-border p-5 last:border-r-0"
            >
              {/* REMOVE */}

              <button
                type="button"
                onClick={() => dispatch(removeFromComparison(product.id))}
                aria-label={`Remove ${product.name} from comparison`}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-nexora-border bg-nexora-surface text-nexora-muted transition hover:border-nexora-copper hover:bg-nexora-copper-soft hover:text-nexora-copper"
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

              {/* IMAGE */}

              <div className="flex h-40 items-center justify-center rounded-2xl bg-[#f3efe7] p-5">
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-nexora-muted">
                    No image
                  </span>
                )}
              </div>

              {/* BRAND */}

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexora-taupe">
                {product.brand}
              </p>

              {/* NAME */}

              <Link to={`/products/${product.id}`}>
                <h2 className="mt-2 text-lg font-black leading-snug text-nexora-text transition hover:text-nexora-primary">
                  {product.name}
                </h2>
              </Link>
            </div>
          ))}

          {/* ================= PRICE ================= */}

          <ComparisonLabel>Price</ComparisonLabel>

          {items.map((product) => (
            <ComparisonCell key={`price-${product.id}`}>
              <span className="text-xl font-black text-nexora-text">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
            </ComparisonCell>
          ))}

          {/* ================= RATING ================= */}

          <ComparisonLabel>Rating</ComparisonLabel>

          {items.map((product) => (
            <ComparisonCell key={`rating-${product.id}`}>
              {Number(product.reviewCount) > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-nexora-primary-soft px-2.5 py-1">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-3.5 w-3.5 text-nexora-primary"
                      aria-hidden="true"
                    >
                      <path d="m12 2.5 2.88 5.84 6.45.94-4.67 4.55 1.1 6.42L12 17.22l-5.76 3.03 1.1-6.42-4.67-4.55 6.45-.94L12 2.5Z" />
                    </svg>

                    <span className="text-xs font-bold text-nexora-primary">
                      {Number(product.rating).toFixed(1)}
                    </span>
                  </div>

                  <span className="text-xs text-nexora-muted">
                    {product.reviewCount}{" "}
                    {Number(product.reviewCount) === 1 ? "review" : "reviews"}
                  </span>
                </div>
              ) : (
                <span className="text-nexora-muted">No reviews yet</span>
              )}
            </ComparisonCell>
          ))}

          {/* ================= AVAILABILITY ================= */}

          <ComparisonLabel>Availability</ComparisonLabel>

          {items.map((product) => (
            <ComparisonCell key={`stock-${product.id}`}>
              {Number(product.stock) > 0 ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-nexora-primary" />

                    <span className="font-bold text-nexora-primary">
                      In stock
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-nexora-muted">
                    {product.stock} available
                  </p>
                </div>
              ) : (
                <span className="font-bold text-nexora-copper">
                  Out of stock
                </span>
              )}
            </ComparisonCell>
          ))}

          {/* ================= VARIANTS ================= */}

          {items.some((product) => product.hasVariants) && (
            <>
              <ComparisonLabel>Variants</ComparisonLabel>

              {items.map((product) => (
                <ComparisonCell key={`variants-${product.id}`}>
                  {product.hasVariants && product.variants?.length > 0 ? (
                    <div className="space-y-1.5">
                      {product.variants.map((variant) => (
                        <p
                          key={variant.id}
                          className="text-sm text-nexora-text"
                        >
                          {variant.label}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <span className="text-nexora-muted">—</span>
                  )}
                </ComparisonCell>
              ))}
            </>
          )}

          {/* ================= SPECIFICATIONS HEADER ================= */}

          {specificationKeys.length > 0 && (
            <div
              className="border-b border-nexora-border bg-nexora-primary-soft px-5 py-4"
              style={{
                gridColumn: `1 / span ${items.length + 1}`,
              }}
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-nexora-primary">
                Specifications
              </p>
            </div>
          )}

          {/* ================= SPECIFICATIONS ================= */}

          {specificationKeys.map((key) => (
            <div key={key} style={{ display: "contents" }}>
              <ComparisonLabel>
                {formatSpecificationLabel(key)}
              </ComparisonLabel>

              {items.map((product) => (
                <ComparisonCell key={`${product.id}-${key}`}>
                  {formatValue(product.specifications?.[key])}
                </ComparisonCell>
              ))}
            </div>
          ))}

          {/* ================= DETAILS ================= */}

          <ComparisonLabel>Details</ComparisonLabel>

          {items.map((product) => (
            <ComparisonCell key={`details-${product.id}`}>
              <Link
                to={`/products/${product.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-nexora-primary px-5 py-2.5 text-xs font-bold text-white transition hover:bg-nexora-primary-hover"
              >
                View Product

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
              </Link>
            </ComparisonCell>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================= ROW COMPONENTS ================= */

const ComparisonLabel = ({ children }) => {
  return (
    <div className="border-b border-r border-nexora-border bg-nexora-ivory p-5">
      <p className="text-xs font-bold text-nexora-muted">
        {children}
      </p>
    </div>
  );
};

const ComparisonCell = ({ children }) => {
  return (
    <div className="border-b border-r border-nexora-border p-5 text-sm text-nexora-text last:border-r-0">
      {children}
    </div>
  );
};

export default Compare;