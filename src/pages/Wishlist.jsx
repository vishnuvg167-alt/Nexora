import {
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Link,
} from "react-router-dom";

import {
  fetchWishlist,
  removeFromWishlistThunk,
} from "../redux/slices/wishlistSlice";

import {
  addToCart,
} from "../redux/slices/cartSlice";

const Wishlist = () => {
  const dispatch =
    useDispatch();

  /* ================= AUTH ================= */

  const user = useSelector(
    (state) =>
      state.auth.user
  );

  /* ================= WISHLIST ================= */

  const {
    items: wishlistItems,
    loading,
    error,
    removingProductId,
  } = useSelector(
    (state) =>
      state.wishlist
  );

  /* ================= CART FEEDBACK ================= */

  const [
    addedProductId,
    setAddedProductId,
  ] = useState(null);

  /* =====================================================
     REMOVE FROM WISHLIST
  ===================================================== */

  const handleRemove =
    async (
      productId
    ) => {
      if (!user?.id) {
        return;
      }

      try {
        await dispatch(
          removeFromWishlistThunk({
            userId:
              user.id,

            productId,
          })
        ).unwrap();
      } catch (error) {
        console.error(
          "Failed to remove wishlist item:",
          error
        );
      }
    };

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart =
    (product) => {
      if (!product) {
        return;
      }

      const stock =
        Number(
          product.stock
        );

      if (stock <= 0) {
        return;
      }

      dispatch(
        addToCart({
          /*
           * product.id is the wishlist
           * database record ID.
           *
           * product.productId is the
           * actual product ID.
           */

          id:
            product.productId,

          name:
            product.name,

          price:
            product.price,

          thumbnail:
            product.thumbnail,

          stock:
            product.stock,

          quantity: 1,
        })
      );

      setAddedProductId(
        product.productId
      );

      setTimeout(() => {
        setAddedProductId(
          null
        );
      }, 2000);
    };

  /* =====================================================
     RETRY FETCH
  ===================================================== */

  const handleRetry =
    () => {
      if (!user?.id) {
        return;
      }

      dispatch(
        fetchWishlist(
          user.id
        )
      );
    };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-nexora-ivory px-4 py-12 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-[1440px]">

          <div className="mb-10">

            <div className="h-3 w-32 animate-pulse rounded-full bg-nexora-primary-soft" />

            <div className="mt-5 h-12 w-64 animate-pulse rounded-xl bg-nexora-primary-soft" />

          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {Array.from({
              length: 4,
            }).map(
              (
                _,
                index
              ) => (

                <div
                  key={
                    index
                  }
                  className="overflow-hidden rounded-[1.75rem] border border-nexora-border bg-nexora-surface"
                >

                  <div className="aspect-[4/3] animate-pulse bg-nexora-primary-soft" />

                  <div className="space-y-4 p-6">

                    <div className="h-3 w-24 animate-pulse rounded-full bg-nexora-primary-soft" />

                    <div className="h-6 w-3/4 animate-pulse rounded-lg bg-nexora-primary-soft" />

                    <div className="h-8 w-32 animate-pulse rounded-lg bg-nexora-primary-soft" />

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <main className="min-h-screen bg-nexora-ivory px-4 py-16 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-100 bg-nexora-surface px-6 py-16 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 font-bold text-red-500">
            !
          </div>

          <h1 className="mt-6 text-3xl font-black text-nexora-text">
            Unable to load wishlist
          </h1>

          <p className="mt-3 text-sm text-nexora-muted">
            {typeof error ===
            "string"
              ? error
              : "Something went wrong while loading your wishlist."}
          </p>

          <button
            type="button"
            onClick={
              handleRetry
            }
            className="mt-7 rounded-full bg-nexora-primary px-6 py-3 text-sm font-bold text-white hover:bg-nexora-primary-hover"
          >
            Try Again
          </button>

        </div>

      </main>
    );
  }

  /* =====================================================
     EMPTY
  ===================================================== */

  if (
    wishlistItems.length ===
    0
  ) {
    return (
      <main className="min-h-screen bg-nexora-ivory px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

        <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center">

          <div className="w-full rounded-[2rem] border border-nexora-border bg-nexora-surface px-6 py-16 text-center sm:px-10 sm:py-20">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-nexora-primary-soft">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-6 w-6 text-nexora-primary"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                />
              </svg>

            </div>

            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              NEXORA / WISHLIST
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-nexora-text sm:text-5xl">
              Nothing saved yet.
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-nexora-muted">
              Save the hardware that catches your eye and keep your next setup in one place.
            </p>

            <Link
              to="/products"
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-nexora-primary px-7 py-3.5 text-sm font-bold text-white hover:bg-nexora-primary-hover"
            >
              Explore Products

              <span>
                →
              </span>
            </Link>

          </div>

        </div>

      </main>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-nexora-ivory">

      {/* ================= HEADER ================= */}

      <section className="border-b border-nexora-border bg-nexora-surface">

        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">

            <div>

              <div className="flex items-center gap-3">

                <span className="h-px w-10 bg-nexora-taupe" />

                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                  NEXORA / WISHLIST
                </p>

              </div>

              <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-[-0.045em] text-nexora-text sm:text-6xl">
                Saved

                <span className="block text-nexora-taupe">
                  for later.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-6 text-nexora-muted sm:text-base">

                {wishlistItems.length}{" "}

                {wishlistItems.length ===
                1
                  ? "product"
                  : "products"}{" "}

                saved for your next setup.

              </p>

            </div>

            <div className="flex flex-wrap items-center gap-5">

              <Link
                to="/account"
                className="text-sm font-semibold text-nexora-muted hover:text-nexora-primary"
              >
                My Account
              </Link>

              <Link
                to="/products"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-nexora-muted hover:text-nexora-primary"
              >
                Continue browsing

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* ================= CONTENT ================= */}

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        <div className="mb-6 flex items-end justify-between gap-4">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-nexora-taupe">
              Your collection
            </p>

            <h2 className="mt-2 text-xl font-black tracking-tight text-nexora-text">
              Saved hardware
            </h2>

          </div>

          <p className="text-xs text-nexora-muted">
            {wishlistItems.length} saved
          </p>

        </div>

        {/* ================= GRID ================= */}

        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {wishlistItems.map(
            (product) => {
              /*
               * product.id
               * = wishlist record ID
               *
               * product.productId
               * = actual product ID
               */

              const productId =
                product.productId;

              const isRemoving =
                String(
                  removingProductId
                ) ===
                String(
                  productId
                );

              const isAdded =
                String(
                  addedProductId
                ) ===
                String(
                  productId
                );

              const stock =
                Number(
                  product.stock
                );

              return (
                <article
                  key={
                    product.id
                  }
                  className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-nexora-border bg-nexora-surface transition-all duration-300 hover:-translate-y-1 hover:border-nexora-taupe hover:shadow-[0_20px_45px_rgba(18,63,50,0.08)]"
                >

                  {/* ================= IMAGE ================= */}

                  <div className="relative">

                    <Link
                      to={`/products/${productId}`}
                      className="block overflow-hidden bg-[#F3EFE7]"
                    >

                      <div className="flex aspect-[4/3] items-center justify-center p-7 sm:p-8">

                        <img
                          src={
                            product.thumbnail
                          }
                          alt={
                            product.name
                          }
                          loading="lazy"
                          className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04] ${
                            stock === 0
                              ? "opacity-60 grayscale"
                              : ""
                          }`}
                        />

                      </div>

                    </Link>

                    {/* ================= HEART REMOVE ================= */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(
                          productId
                        )
                      }
                      disabled={
                        isRemoving
                      }
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-nexora-primary bg-nexora-primary text-white shadow-sm hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {isRemoving ? (

                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />

                      ) : (

                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-[18px] w-[18px]"
                          aria-hidden="true"
                        >
                          <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08A6.01 6.01 0 0 1 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.54L12 21.35Z" />
                        </svg>

                      )}

                    </button>

                    {/* ================= OUT OF STOCK ================= */}

                    {stock ===
                      0 && (

                      <div className="absolute left-4 top-4 rounded-full bg-nexora-text px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                        Out of stock
                      </div>

                    )}

                  </div>

                  {/* ================= CONTENT ================= */}

                  <div className="flex flex-1 flex-col p-5 sm:p-6">

                    {/* ================= META ================= */}

                    <div className="flex items-center gap-2">

                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                        {product.brand ||
                          "NEXORA"}
                      </p>

                      {product.category && (
                        <>

                          <span className="h-1 w-1 rounded-full bg-nexora-border" />

                          <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
                            {
                              product.category
                            }
                          </p>

                        </>
                      )}

                    </div>

                    {/* ================= NAME ================= */}

                    <Link
                      to={`/products/${productId}`}
                      className="mt-3"
                    >

                      <h2 className="line-clamp-2 min-h-[3.5rem] text-lg font-bold leading-7 tracking-[-0.02em] text-nexora-text hover:text-nexora-primary">
                        {product.name}
                      </h2>

                    </Link>

                    <div className="mt-auto pt-6">

                      {/* ================= PRICE / STOCK ================= */}

                      <div className="flex items-end justify-between gap-4">

                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexora-taupe">
                            Price
                          </p>

                          <p className="mt-1 text-2xl font-black tracking-[-0.035em] text-nexora-primary">
                            ₹
                            {Number(
                              product.price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                        {stock >
                          0 && (

                          <div className="text-right">

                            <div className="flex items-center justify-end gap-1.5">

                              <span className="h-1.5 w-1.5 rounded-full bg-nexora-primary" />

                              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-nexora-primary">
                                In stock
                              </span>

                            </div>

                            <p className="mt-1 text-[11px] text-nexora-muted">
                              {stock} available
                            </p>

                          </div>

                        )}

                      </div>

                      {/* ================= ACTIONS ================= */}

                      <div className="mt-5 space-y-2.5">

                        {/* ADD TO CART */}

                        <button
                          type="button"
                          onClick={() =>
                            handleAddToCart(
                              product
                            )
                          }
                          disabled={
                            stock <= 0
                          }
                          className="group/button flex w-full items-center justify-between rounded-full bg-nexora-primary px-5 py-3.5 text-sm font-bold text-white hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:bg-nexora-primary-soft disabled:text-nexora-muted"
                        >

                          <span>

                            {stock <= 0
                              ? "Currently unavailable"
                              : isAdded
                                ? "✓ Added to Cart"
                                : "Add to Cart"}

                          </span>

                          {stock >
                            0 &&
                            !isAdded && (

                              <span>
                                →
                              </span>

                            )}

                        </button>

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(
                              productId
                            )
                          }
                          disabled={
                            isRemoving
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-nexora-border bg-nexora-surface px-5 py-3.5 text-sm font-semibold text-nexora-muted hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          {isRemoving
                            ? "Removing..."
                            : "Remove"}

                        </button>

                      </div>

                    </div>

                  </div>

                </article>
              );
            }
          )}

        </div>

      </section>

    </main>
  );
};

export default Wishlist;