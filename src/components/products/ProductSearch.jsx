import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import productImages from "../../constants/productImages";

/* ================= CONSTANTS ================= */

const MAX_SUGGESTIONS = 5;

/* ================= COMPONENT ================= */

const ProductSearch = ({ search, setSearch, products = [] }) => {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  /* ================= SEARCH TERM ================= */

  const searchTerm = search.trim().toLowerCase();

  /* ================= SUGGESTIONS ================= */

  const suggestions = useMemo(() => {
    if (!searchTerm) {
      return [];
    }

    return products
      .filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const brand = product.brand?.toLowerCase() || "";
        const category = product.category?.toLowerCase() || "";

        return (
          name.includes(searchTerm) ||
          brand.includes(searchTerm) ||
          category.includes(searchTerm)
        );
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [products, searchTerm]);

  /* ================= PRODUCT IMAGE ================= */

  const getProductImage = (product) => {
    return (
      productImages[product.id] ||
      product.thumbnail ||
      product.images?.[0] ||
      ""
    );
  };

  /* ================= INPUT CHANGE ================= */

  const handleChange = (event) => {
    setSearch(event.target.value);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  /* ================= SELECT PRODUCT ================= */

  const handleSelectProduct = (product) => {
    setSearch(product.name);
    setIsOpen(false);
    setActiveIndex(-1);

    navigate(`/products/${product.id}`);
  };

  /* ================= CLEAR ================= */

  const handleClear = () => {
    setSearch("");
    setIsOpen(false);
    setActiveIndex(-1);
  };

  /* ================= KEYBOARD NAVIGATION ================= */

  const handleKeyDown = (event) => {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((currentIndex) =>
        currentIndex < suggestions.length - 1
          ? currentIndex + 1
          : 0
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((currentIndex) =>
        currentIndex > 0
          ? currentIndex - 1
          : suggestions.length - 1
      );
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();

      handleSelectProduct(suggestions[activeIndex]);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  /* ================= CLICK OUTSIDE ================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ================= RESET ACTIVE ITEM ================= */

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchTerm]);

  /* ================= RENDER ================= */

  return (
    <div ref={searchRef} className="relative z-30 w-full lg:max-w-md">
      {/* ================= INPUT ================= */}

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4 text-nexora-taupe"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </div>

        <input
          type="search"
          value={search}
          onChange={handleChange}
          onFocus={() => {
            if (searchTerm) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          aria-label="Search products"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          className="
            w-full
            rounded-xl
            border border-nexora-border
            bg-nexora-ivory
            py-2.5
            pl-11
            pr-10
            text-sm
            font-medium
            text-nexora-text
            outline-none
            transition
            placeholder:text-nexora-taupe
            hover:border-nexora-taupe
            focus:border-nexora-primary
            focus:bg-nexora-surface
            focus:ring-2
            focus:ring-nexora-primary/10
          "
        />

        {search && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute inset-y-0 right-3 flex items-center text-lg text-nexora-taupe transition hover:text-nexora-primary"
          >
            ×
          </button>
        )}
      </div>

      {/* ================= AUTOCOMPLETE ================= */}

      {isOpen && searchTerm && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-nexora-border bg-nexora-surface shadow-[0_20px_60px_rgba(18,63,50,0.14)]">
          {suggestions.length > 0 ? (
            <>
              {/* HEADER */}

              <div className="border-b border-nexora-border px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexora-taupe">
                  Suggestions
                </p>
              </div>

              {/* PRODUCTS */}

              <div>
                {suggestions.map((product, index) => {
                  const productImage = getProductImage(product);
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleSelectProduct(product)}
                      className={`
                        flex
                        w-full
                        items-center
                        gap-3
                        border-b
                        border-nexora-border
                        px-4
                        py-3
                        text-left
                        transition
                        last:border-b-0
                        ${
                          isActive
                            ? "bg-nexora-primary-soft"
                            : "bg-nexora-surface hover:bg-nexora-ivory"
                        }
                      `}
                    >
                      {/* IMAGE */}

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-nexora-border bg-nexora-ivory">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt=""
                            className="h-full w-full object-contain p-1.5"
                          />
                        ) : (
                          <span className="text-xs text-nexora-taupe">
                            N
                          </span>
                        )}
                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-nexora-text">
                          {product.name}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="truncate text-[11px] text-nexora-muted">
                            {product.category}
                          </span>

                          {Number(product.stock) <= 0 && (
                            <>
                              <span className="text-nexora-border">•</span>

                              <span className="text-[10px] font-bold uppercase tracking-wide text-red-500">
                                Out of stock
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* PRICE */}

                      <p className="shrink-0 text-sm font-black text-nexora-primary">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* SEARCH SUMMARY */}

              <div className="border-t border-nexora-border bg-nexora-ivory px-4 py-3">
                <p className="text-xs text-nexora-muted">
                  Showing matches for{" "}
                  <span className="font-bold text-nexora-primary">
                    “{search}”
                  </span>
                </p>
              </div>
            </>
          ) : (
            /* ================= NO SUGGESTIONS ================= */

            <div className="px-5 py-8 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-nexora-primary-soft text-nexora-primary">
                ⌕
              </div>

              <p className="mt-3 text-sm font-bold text-nexora-text">
                No matching products
              </p>

              <p className="mt-1 text-xs text-nexora-muted">
                Try a different product, brand or category.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;