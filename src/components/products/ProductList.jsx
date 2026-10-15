import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ProductSearch from "./ProductSearch";
import ProductFilter from "./ProductFilter";
import ProductSort from "./ProductSort";
import ProductGrid from "./ProductGrid";

import { fetchProducts } from "../../redux/slices/productSlice";
import { fetchAllReviews } from "../../redux/slices/reviewSlice";

/* ================= CONSTANTS ================= */

const PRODUCTS_PER_LOAD = 8;

/* ================= COMPONENT ================= */

const ProductList = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ================= FILTER STATE ================= */

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );

  const [sort, setSort] = useState("default");

  /* ================= INFINITE SCROLL STATE ================= */

  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD);
  const loadMoreRef = useRef(null);

  /* ================= REDUX ================= */

  const { items, loading, error } = useSelector(
    (state) => state.products
  );

  const reviews = useSelector(
    (state) => state.reviews.allItems
  );

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchAllReviews());
  }, [dispatch]);

  /* ================= READ CATEGORY FROM URL ================= */

  useEffect(() => {
    const urlCategory = searchParams.get("category");

    if (urlCategory) {
      setCategory(urlCategory);
    } else {
      setCategory("all");
    }
  }, [searchParams]);

  /* ================= CATEGORY CHANGE ================= */

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);

    const params = new URLSearchParams(searchParams);

    if (newCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", newCategory);
    }

    setSearchParams(params);
  };

  /* ================= PRODUCT REVIEW STATS ================= */

  const productsWithReviewStats = items.map((product) => {
    const productReviews = reviews.filter(
      (review) =>
        String(review.productId) === String(product.id)
    );

    const reviewCount = productReviews.length;

    const averageRating =
      reviewCount > 0
        ? productReviews.reduce(
            (total, review) => total + Number(review.rating),
            0
          ) / reviewCount
        : 0;

    return {
      ...product,
      rating: averageRating,
      reviewCount,
    };
  });

  /* ================= FILTER ================= */

  const filteredProducts = productsWithReviewStats.filter(
    (product) => {
      const searchTerm = search.trim().toLowerCase();

      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm);

      const matchesCategory =
        category === "all" ||
        product.category === category;

      const isInStock = Number(product.stock) > 0;

      /*
        NORMAL LISTING:
        Only show products that are in stock.

        SEARCH:
        Matching products can appear
        even when their stock is 0.
      */

      const shouldShowProduct = searchTerm
        ? matchesSearch
        : isInStock;

      return shouldShowProduct && matchesCategory;
    }
  );

  /* ================= SORT ================= */

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "low-high") {
      return Number(a.price) - Number(b.price);
    }

    if (sort === "high-low") {
      return Number(b.price) - Number(a.price);
    }

    return 0;
  });

  /* ================= VISIBLE PRODUCTS ================= */

  const visibleProducts = sortedProducts.slice(
    0,
    visibleCount
  );

  const hasMoreProducts =
    visibleCount < sortedProducts.length;

  /* ================= RESET INFINITE SCROLL ================= */

  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_LOAD);
  }, [search, category, sort]);

  /* ================= INFINITE SCROLL OBSERVER ================= */

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMoreProducts) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          setVisibleCount((currentCount) =>
            Math.min(
              currentCount + PRODUCTS_PER_LOAD,
              sortedProducts.length
            )
          );
        }
      },
      {
        root: null,
        rootMargin: "200px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreProducts, sortedProducts.length]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-nexora-ivory px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          {/* HEADER SKELETON */}

          <div className="mb-12">
            <div className="h-3 w-36 animate-pulse rounded-full bg-nexora-primary-soft" />

            <div className="mt-6 h-14 w-72 max-w-full animate-pulse rounded-xl bg-nexora-primary-soft" />

            <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-lg bg-nexora-primary-soft" />
          </div>

          {/* FILTER SKELETON */}

          <div className="mb-10 h-32 animate-pulse rounded-[2rem] border border-nexora-border bg-nexora-surface" />

          {/* PRODUCT SKELETONS */}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.75rem] border border-nexora-border bg-nexora-surface"
              >
                <div className="h-72 animate-pulse bg-nexora-primary-soft" />

                <div className="space-y-4 p-6">
                  <div className="h-3 w-20 animate-pulse rounded bg-nexora-primary-soft" />

                  <div className="h-6 w-3/4 animate-pulse rounded bg-nexora-primary-soft" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-nexora-primary-soft" />

                  <div className="h-7 w-28 animate-pulse rounded bg-nexora-primary-soft" />

                  <div className="h-12 animate-pulse rounded-full bg-nexora-primary-soft" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  /* ================= ERROR ================= */

  if (error) {
    return (
      <main className="min-h-screen bg-nexora-ivory px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-red-100 bg-nexora-surface px-6 py-24 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-red-500">
              !
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              Connection Error
            </p>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-nexora-text sm:text-4xl">
              Unable to load products.
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-nexora-muted">
              We couldn't retrieve the NEXORA collection.
              Check your connection and try again.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ================= PAGE ================= */

  return (
    <main className="min-h-screen bg-nexora-ivory">
      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden bg-nexora-primary text-white">
        {/* Decorative background */}

        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-nexora-taupe/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            {/* HERO CONTENT */}

            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-nexora-taupe" />

                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-nexora-taupe-soft">
                  NEXORA / SHOP
                </p>
              </div>

              <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                Explore hardware

                <span className="block text-nexora-taupe-soft">
                  built to perform.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
                Performance-focused technology for gaming,
                development, creativity and everything in
                between.
              </p>
            </div>

            {/* PRODUCT COUNT */}

            <div className="flex items-end gap-3 lg:block lg:text-right">
              <p className="text-5xl font-black tracking-[-0.04em] text-white">
                {sortedProducts.length}
              </p>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-nexora-taupe-soft">
                  Products
                </p>

                <p className="mt-1 text-xs text-white/45">
                  Ready to explore
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STORE ================= */}

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* ================= CONTROLS ================= */}

        <div className="rounded-[2rem] border border-nexora-border bg-nexora-surface p-4 shadow-[0_8px_30px_rgba(18,63,50,0.04)] sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <ProductSearch
              search={search}
              setSearch={setSearch}
              products={productsWithReviewStats}
            />

            <ProductSort
              sort={sort}
              setSort={setSort}
            />
          </div>

          <div className="my-5 border-t border-nexora-border" />

          <ProductFilter
            category={category}
            setCategory={handleCategoryChange}
          />
        </div>

        {/* ================= RESULTS HEADER ================= */}

        <div
          id="product-grid"
          className="mb-7 mt-10 scroll-mt-28 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-nexora-taupe">
              {category === "all"
                ? "The collection"
                : "Selected collection"}
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-nexora-text">
              {category === "all"
                ? "All Products"
                : category}
            </h2>

            <p className="mt-2 text-sm text-nexora-muted">
              {sortedProducts.length === 0
                ? "No products found"
                : `Showing ${visibleProducts.length} of ${sortedProducts.length} products`}
            </p>
          </div>

          {/* SEARCH TERM */}

          {search && (
            <div className="rounded-full border border-nexora-border bg-nexora-surface px-4 py-2 text-xs text-nexora-muted">
              Results for{" "}

              <span className="font-bold text-nexora-primary">
                “{search}”
              </span>
            </div>
          )}
        </div>

        {/* ================= PRODUCTS ================= */}

        {visibleProducts.length === 0 ? (
          /* EMPTY STATE */

          <div className="rounded-[2rem] border border-nexora-border bg-nexora-surface px-6 py-24 text-center sm:py-28">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-nexora-primary-soft text-2xl text-nexora-primary">
              ⌕
            </div>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              No results
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-nexora-text">
              Nothing matched your search.
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-nexora-muted">
              Try another search term or explore a different
              product category.
            </p>

            {(search || category !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  handleCategoryChange("all");
                  setSort("default");
                }}
                className="mt-7 rounded-full bg-nexora-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-nexora-primary-hover"
              >
                View all products
              </button>
            )}
          </div>
        ) : (
          <ProductGrid products={visibleProducts} />
        )}

        {/* ================= INFINITE SCROLL ================= */}

        {hasMoreProducts && (
          <div
            ref={loadMoreRef}
            className="flex justify-center py-12"
          >
            <div className="flex items-center gap-3 text-sm text-nexora-muted">
              <span
                className="
                  h-5
                  w-5
                  animate-spin
                  rounded-full
                  border-2
                  border-nexora-primary-soft
                  border-t-nexora-primary
                "
              />

              <span>Loading more products...</span>
            </div>
          </div>
        )}

        {/* ================= END OF PRODUCTS ================= */}

        {!hasMoreProducts && sortedProducts.length > 0 && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-px w-12 bg-nexora-border" />

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nexora-taupe">
              You've reached the end
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default ProductList;