import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import { fetchProducts } from "../redux/slices/productSlice";
import { fetchAllReviews } from "../redux/slices/reviewSlice";

import ProductCard from "../components/products/ProductCard";
import productImages from "../constants/productImages";

/* =====================================================
   DATA
===================================================== */

const categories = [
  "Laptops",
  "Graphics Cards",
  "Processors",
  "Monitors",
  "Keyboards",
  "Mice",
  "Headsets",
  "SSDs",
];

const features = [
  {
    title: "Performance",
    description:
      "Hardware selected to deliver the performance your setup demands.",
  },
  {
    title: "Quality",
    description:
      "Reliable components designed for long-term performance and durability.",
  },
  {
    title: "Curated Hardware",
    description:
      "A focused selection of gaming, productivity, and creator hardware.",
  },
  {
    title: "Future Ready",
    description:
      "Technology built to keep your setup powerful for what comes next.",
  },
];

const categoryImages = {
  Laptops:
    productImages["9"] ||
    productImages["1"],

  "Graphics Cards":
    productImages["13"] ||
    productImages["2"],

  Processors:
    productImages["15"] ||
    productImages["3"],

  Monitors:
    productImages["16"] ||
    productImages["4"],

  Keyboards:
    productImages["5"],

  Mice:
    productImages["6"],

  Headsets:
    productImages["7"],

  SSDs:
    productImages["8"],
};

/* =====================================================
   COMPONENT
===================================================== */

const Home = () => {
  const dispatch = useDispatch();

  /* ================= PRODUCTS ================= */

  const {
    items,
    loading,
    error,
  } = useSelector(
    (state) => state.products
  );

  /* ================= REVIEWS ================= */

  const {
    allItems: allReviews,
  } = useSelector(
    (state) => state.reviews
  );

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchProducts());
    }

    if (allReviews.length === 0) {
      dispatch(fetchAllReviews());
    }
  }, [
    dispatch,
    items.length,
    allReviews.length,
  ]);

  /* ================= REVIEW STATS ================= */

  const getReviewStats = (
    productId
  ) => {
    const productReviews =
      allReviews.filter(
        (review) =>
          String(
            review.productId
          ) ===
          String(productId)
      );

    const reviewCount =
      productReviews.length;

    if (reviewCount === 0) {
      return {
        rating: 0,
        reviewCount: 0,
      };
    }

    const totalRating =
      productReviews.reduce(
        (total, review) =>
          total +
          Number(review.rating),
        0
      );

    return {
      rating:
        totalRating /
        reviewCount,
      reviewCount,
    };
  };

  /* ================= FEATURED PRODUCTS ================= */

  const featuredProducts =
    items.slice(0, 4);

  const heroImage =
    productImages["9"] ||
    productImages["1"];

  const performanceImage =
    productImages["13"] ||
    productImages["2"];

  return (
    <main className="min-h-screen bg-nexora-ivory text-nexora-text">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-nexora-primary text-white">

        {/* ================= ATMOSPHERE ================= */}

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-nexora-copper/10 blur-[140px]" />

          <div className="absolute -bottom-60 left-1/4 h-[500px] w-[500px] rounded-full bg-white/5 blur-[140px]" />

          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-nexora-primary-hover/50" />

        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">

          <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">

            {/* ================= HERO CONTENT ================= */}

            <div className="relative z-10">

              <div className="mb-7 flex items-center gap-3">

                <span className="h-px w-10 bg-nexora-taupe" />

                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-nexora-taupe-soft">
                  NEXORA
                </p>

              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-[0.9] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-8xl">
                Power your
                <br />

                <span className="text-nexora-taupe-soft">
                  next level.
                </span>
              </h1>

              <p className="mt-8 max-w-lg text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
                Premium hardware engineered
                for gaming, development,
                creativity, and everything
                your next setup demands.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/products"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-nexora-ivory px-8 py-4 text-sm font-bold text-nexora-primary transition duration-300 hover:-translate-y-0.5 hover:bg-white"
                >
                  Shop Products

                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  to="/products?category=Graphics%20Cards"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
                >
                  Explore Gaming
                </Link>

              </div>

              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-7">

                <div>
                  <p className="text-sm font-bold text-white">
                    Premium
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-nexora-taupe">
                    Hardware
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Curated
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-nexora-taupe">
                    Selection
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Future
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-nexora-taupe">
                    Ready
                  </p>
                </div>

              </div>

            </div>

            {/* ================= HERO PRODUCT ================= */}

            <div className="relative">

              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexora-copper/10 blur-[100px]" />

              <div className="group relative mx-auto aspect-[4/3] w-full max-w-[680px] overflow-hidden rounded-[2rem] border border-white/10 bg-nexora-primary-hover shadow-[0_30px_80px_rgba(0,0,0,0.25)]">

                {heroImage ? (

                  <img
                    src={heroImage}
                    alt="NEXORA premium gaming hardware"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />

                ) : (

                  <div className="flex h-full items-center justify-center bg-nexora-primary-hover">

                    <p className="text-5xl font-black tracking-[-0.05em] text-white">
                      NEXORA
                    </p>

                  </div>

                )}

                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-nexora-primary-hover/90 via-transparent to-black/10" />

                <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-nexora-primary-hover/60 px-4 py-2 backdrop-blur-xl">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-nexora-taupe-soft">
                    Performance Series
                  </p>

                </div>

                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">

                  <div className="flex items-end justify-between gap-5 rounded-2xl border border-white/10 bg-nexora-primary-hover/70 px-5 py-4 backdrop-blur-xl sm:px-6 sm:py-5">

                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-nexora-taupe">
                        NEXORA
                      </p>

                      <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                        Built for what comes next.
                      </p>

                    </div>

                    <Link
                      to="/products?category=Laptops"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-nexora-ivory font-bold text-nexora-primary transition duration-300 hover:scale-105 hover:bg-white"
                      aria-label="Explore NEXORA laptops"
                    >
                      →
                    </Link>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CATEGORY SECTION
      ===================================================== */}

      <section className="bg-nexora-ivory px-6 py-24 sm:py-28">

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>

              <div className="flex items-center gap-3">

                <span className="h-px w-10 bg-nexora-taupe" />

                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                  Explore NEXORA
                </p>

              </div>

              <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] text-nexora-text sm:text-5xl">
                Shop by Category
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-nexora-muted">
                Find the right hardware
                for every part of your
                setup.
              </p>

            </div>

            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-nexora-muted transition hover:text-nexora-primary"
            >
              View all products

              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {categories.map(
              (category, index) => {
                const image =
                  categoryImages[
                    category
                  ];

                return (
                  <Link
                    key={category}
                    to={`/products?category=${encodeURIComponent(
                      category
                    )}`}
                    className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-nexora-primary-hover"
                  >

                    {image ? (

                      <img
                        src={image}
                        alt={category}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />

                    ) : (

                      <div className="h-full w-full bg-nexora-primary" />

                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-nexora-primary-hover via-nexora-primary-hover/20 to-black/5 transition duration-300 group-hover:from-nexora-primary-hover" />

                    <span className="absolute left-5 top-5 text-[10px] font-semibold tracking-[0.2em] text-white/60">
                      0{index + 1}
                    </span>

                    <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-nexora-primary-hover/20 text-sm text-white backdrop-blur transition duration-300 group-hover:border-nexora-ivory group-hover:bg-nexora-ivory group-hover:text-nexora-primary">
                      ↗
                    </span>

                    <div className="absolute bottom-0 left-0 right-0 p-6">

                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-nexora-taupe-soft">
                        NEXORA
                      </p>

                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
                        {category}
                      </h3>

                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-white/60 transition group-hover:text-white">

                        Explore category

                        <span className="transition duration-300 group-hover:translate-x-1">
                          →
                        </span>

                      </div>

                    </div>

                  </Link>
                );
              }
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          FEATURED PRODUCTS
      ===================================================== */}

      <section className="border-y border-nexora-border bg-[#F3EFE7] px-6 py-24 sm:py-28">

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>

              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                Selected for you
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-nexora-text sm:text-5xl">
                Top Picks
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-nexora-muted">
                A curated selection of
                NEXORA hardware built
                for serious setups.
              </p>

            </div>

            <Link
              to="/products"
              className="hidden rounded-full border border-nexora-border bg-nexora-surface px-6 py-3 text-sm font-semibold text-nexora-primary transition duration-300 hover:-translate-y-0.5 hover:border-nexora-primary hover:bg-nexora-primary hover:text-white sm:inline-block"
            >
              View all products →
            </Link>

          </div>

          {/* ================= LOADING ================= */}

          {loading && (

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {[1, 2, 3, 4].map(
                (item) => (

                  <div
                    key={item}
                    className="overflow-hidden rounded-3xl border border-nexora-border bg-nexora-surface"
                  >

                    <div className="aspect-square animate-pulse bg-nexora-taupe-soft" />

                    <div className="space-y-3 p-6">

                      <div className="h-3 w-20 animate-pulse rounded bg-nexora-taupe-soft" />

                      <div className="h-5 w-3/4 animate-pulse rounded bg-nexora-primary-soft" />

                      <div className="h-5 w-24 animate-pulse rounded bg-nexora-primary-soft" />

                    </div>

                  </div>

                )
              )}

            </div>

          )}

          {/* ================= ERROR ================= */}

          {error && (

            <div className="flex min-h-64 items-center justify-center rounded-3xl border border-red-200 bg-nexora-surface px-6">

              <div className="text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">

                  <span className="font-black text-red-500">
                    !
                  </span>

                </div>

                <p className="mt-4 text-sm font-semibold text-red-600">
                  Failed to load products.
                </p>

                <p className="mt-2 text-xs text-nexora-muted">
                  Please try again later.
                </p>

              </div>

            </div>

          )}

          {/* ================= PRODUCTS ================= */}

          {!loading &&
            !error &&
            featuredProducts.length >
              0 && (

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {featuredProducts.map(
                  (product) => {
                    const {
                      rating,
                      reviewCount,
                    } =
                      getReviewStats(
                        product.id
                      );

                    return (
                      <ProductCard
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                        rating={
                          rating
                        }
                        reviewCount={
                          reviewCount
                        }
                      />
                    );
                  }
                )}

              </div>

            )}

          {/* ================= EMPTY ================= */}

          {!loading &&
            !error &&
            featuredProducts.length ===
              0 && (

              <div className="flex min-h-64 items-center justify-center rounded-3xl border border-nexora-border bg-nexora-surface">

                <p className="text-sm font-medium text-nexora-muted">
                  No featured products
                  available.
                </p>

              </div>

            )}

          <Link
            to="/products"
            className="mt-8 block rounded-full border border-nexora-primary bg-nexora-surface px-6 py-3 text-center text-sm font-semibold text-nexora-primary transition duration-300 hover:bg-nexora-primary hover:text-white sm:hidden"
          >
            View all products →
          </Link>

        </div>

      </section>

      {/* =====================================================
          PERFORMANCE BANNER
      ===================================================== */}

      <section className="relative overflow-hidden bg-nexora-primary-hover px-6 py-24 text-white sm:py-28">

        <div className="pointer-events-none absolute -left-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-nexora-copper/10 blur-[140px]" />

        <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-white/5 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl">

          <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">

            <div>

              <div className="flex items-center gap-3">

                <span className="h-px w-10 bg-nexora-taupe" />

                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-nexora-taupe-soft">
                  Built for performance
                </p>

              </div>

              <h2 className="mt-6 max-w-2xl text-5xl font-black leading-[0.92] tracking-[-0.05em] sm:text-6xl">
                Don't just
                <br />
                run it.
                <br />

                <span className="text-nexora-taupe">
                  Push it further.
                </span>
              </h2>

              <p className="mt-8 max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
                From high-performance
                graphics to powerful
                productivity hardware,
                build a system without
                compromise.
              </p>

              <Link
                to="/products"
                className="group mt-10 inline-flex items-center gap-3 rounded-full bg-nexora-ivory px-7 py-4 text-sm font-bold text-nexora-primary transition duration-300 hover:-translate-y-0.5 hover:bg-white"
              >
                Explore Performance

                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>

            </div>

            <div className="relative">

              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexora-copper/10 blur-[100px]" />

              <div className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10 bg-nexora-primary shadow-[0_30px_80px_rgba(0,0,0,0.25)]">

                {performanceImage ? (

                  <img
                    src={
                      performanceImage
                    }
                    alt="NEXORA high performance graphics hardware"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />

                ) : (

                  <div className="flex h-full items-center justify-center bg-nexora-primary">

                    <p className="text-5xl font-black tracking-[-0.05em]">
                      NEXORA
                    </p>

                  </div>

                )}

                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-nexora-primary-hover/90 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5">

                  <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-nexora-primary-hover/70 px-5 py-4 backdrop-blur-xl">

                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-nexora-taupe">
                        NEXORA Performance
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        Power without compromise.
                      </p>

                    </div>

                    <span className="text-xl text-nexora-taupe-soft">
                      →
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          WHY NEXORA
      ===================================================== */}

      <section className="bg-nexora-ivory px-6 py-24 sm:py-28">

        <div className="mx-auto max-w-7xl">

          <div className="max-w-3xl">

            <div className="flex items-center gap-3">

              <span className="h-px w-10 bg-nexora-taupe" />

              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-nexora-taupe">
                Why NEXORA
              </p>

            </div>

            <h2 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.045em] text-nexora-text sm:text-6xl">
              Built around
              <br />

              <span className="text-nexora-taupe">
                what matters.
              </span>
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-nexora-muted sm:text-lg sm:leading-8">
              Hardware, performance,
              and design brought
              together to create a
              better setup.
            </p>

          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {features.map(
              (feature, index) => (

                <div
                  key={feature.title}
                  className="group relative flex min-h-[320px] flex-col overflow-hidden rounded-3xl border border-nexora-border bg-nexora-surface p-8 transition duration-300 hover:-translate-y-1 hover:border-nexora-primary hover:bg-nexora-primary hover:text-white hover:shadow-[0_25px_60px_rgba(18,63,50,0.15)]"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-semibold tracking-[0.2em] text-nexora-taupe transition group-hover:text-nexora-taupe-soft">
                      0{index + 1}
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-nexora-border text-lg text-nexora-taupe transition duration-300 group-hover:rotate-45 group-hover:border-white/20 group-hover:text-white">
                      +
                    </span>

                  </div>

                  <div className="mt-auto pt-16">

                    <h3 className="text-2xl font-bold tracking-tight text-nexora-text transition group-hover:text-white">
                      {feature.title}
                    </h3>

                    <p className="mt-4 text-sm leading-6 text-nexora-muted transition group-hover:text-white/65">
                      {
                        feature.description
                      }
                    </p>

                    <div className="mt-8 h-px bg-nexora-border transition group-hover:bg-white/10" />

                    <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-nexora-taupe transition group-hover:text-nexora-taupe-soft">
                      NEXORA Standard
                    </p>

                  </div>

                  <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-nexora-primary-soft/70 blur-3xl transition duration-500 group-hover:bg-nexora-copper/10" />

                </div>

              )
            )}

          </div>

        </div>

      </section>

    </main>
  );
};

export default Home;