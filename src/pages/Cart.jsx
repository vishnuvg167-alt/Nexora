import {
  useEffect,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Link,
} from "react-router-dom";

import {
  removeCart,
  updateCart,
} from "../redux/slices/cartSlice";

import {
  fetchProducts,
} from "../redux/slices/productSlice";

import {
  getVariantById,
  hasProductVariants,
} from "../utils/productVariants";

const Cart = () => {
  const dispatch = useDispatch();

  /* =====================================================
     REDUX
  ===================================================== */

  const cartItems = useSelector(
    (state) => state.cart.items
  );

  const {
    items: products,
    loading: productsLoading,
  } = useSelector(
    (state) => state.products
  );

  /* =====================================================
     FETCH LATEST PRODUCTS
  ===================================================== */

  useEffect(() => {
    dispatch(
      fetchProducts()
    );
  }, [dispatch]);

  /* =====================================================
     GET CURRENT PRODUCT
  ===================================================== */

  const getCurrentProduct = (
    cartItem
  ) => {
    return products.find(
      (product) =>
        String(product.id) ===
        String(cartItem.id)
    );
  };

  /* =====================================================
     CART WITH CURRENT STOCK / PRICE
  ===================================================== */

  const cartWithCurrentStock =
    cartItems.map(
      (item) => {
        const currentProduct =
          getCurrentProduct(
            item
          );

        /* ---------------------------------------------
           PRODUCT NO LONGER EXISTS
        --------------------------------------------- */

        if (!currentProduct) {
          return {
            ...item,

            currentStock: 0,

            currentPrice:
              Number(
                item.price
              ) || 0,

            productExists:
              false,

            variantExists:
              item.variantId
                ? false
                : true,

            currentVariant:
              null,
          };
        }

        /* ---------------------------------------------
           VARIANT CART ITEM
        --------------------------------------------- */

        if (item.variantId) {
          const currentVariant =
            getVariantById(
              currentProduct,
              item.variantId
            );

          /*
            Product still exists but the
            selected variant may have been
            removed by the admin.
          */

          if (!currentVariant) {
            return {
              ...item,

              currentStock: 0,

              currentPrice:
                Number(
                  item.price
                ) || 0,

              productExists:
                true,

              variantExists:
                false,

              currentVariant:
                null,
            };
          }

          return {
            ...item,

            currentStock:
              Math.max(
                Number(
                  currentVariant.stock
                ) || 0,
                0
              ),

            currentPrice:
              Number(
                currentVariant.price
              ) ||
              Number(
                item.price
              ) ||
              0,

            /*
              Use the current variant label
              if the admin later changes it.
            */

            variantLabel:
              currentVariant.label ||
              item.variantLabel ||
              null,

            variantAttributes:
              currentVariant.attributes ||
              item.variantAttributes ||
              null,

            productExists:
              true,

            variantExists:
              true,

            currentVariant,
          };
        }

        /* ---------------------------------------------
           NORMAL PRODUCT
        --------------------------------------------- */

        return {
          ...item,

          currentStock:
            Math.max(
              Number(
                currentProduct.stock
              ) || 0,
              0
            ),

          currentPrice:
            Number(
              currentProduct.price
            ) ||
            Number(
              item.price
            ) ||
            0,

          productExists:
            true,

          /*
            Normal products don't require
            a variant.
          */

          variantExists:
            true,

          currentVariant:
            null,

          /*
            Helpful flag for detecting an
            old cart line if a normal product
            later becomes variant-only.
          */

          productNowHasVariants:
            hasProductVariants(
              currentProduct
            ),
        };
      }
    );

  /* =====================================================
     INVALID CART CHECK
  ===================================================== */

  const hasStockIssues =
    cartWithCurrentStock.some(
      (item) =>
        !item.productExists ||
        !item.variantExists ||
        (
          item.productNowHasVariants &&
          !item.variantId
        ) ||
        item.currentStock <= 0 ||
        item.quantity >
          item.currentStock
    );

  /* =====================================================
     TOTALS
  ===================================================== */

  const subtotal =
    cartWithCurrentStock.reduce(
      (total, item) =>
        total +
        item.currentPrice *
          item.quantity,
      0
    );

  const totalItems =
    cartWithCurrentStock.reduce(
      (total, item) =>
        total +
        item.quantity,
      0
    );

  /* =====================================================
     QUANTITY
  ===================================================== */

  const handleIncrease = (
    item
  ) => {
    if (
      !item.productExists ||
      !item.variantExists ||
      item.currentStock <= 0
    ) {
      return;
    }

    if (
      item.quantity <
      item.currentStock
    ) {
      dispatch(
        updateCart({
          id:
            item.id,

          variantId:
            item.variantId ??
            null,

          quantity:
            item.quantity +
            1,
        })
      );
    }
  };

  const handleDecrease = (
    item
  ) => {
    if (
      item.quantity > 1
    ) {
      dispatch(
        updateCart({
          id:
            item.id,

          variantId:
            item.variantId ??
            null,

          quantity:
            item.quantity -
            1,
        })
      );
    }
  };

  /* =====================================================
     REMOVE
  ===================================================== */

  const handleRemove = (
    item
  ) => {
    dispatch(
      removeCart({
        id:
          item.id,

        variantId:
          item.variantId ??
          null,
      })
    );
  };

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (
    cartItems.length === 0
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
                  d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 8H7"
                />

                <circle
                  cx="10"
                  cy="20"
                  r="1"
                />

                <circle
                  cx="18"
                  cy="20"
                  r="1"
                />
              </svg>

            </div>

            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              NEXORA / CART
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-nexora-text sm:text-5xl">
              Your cart is empty.
            </h1>

            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-nexora-muted">
              Your next setup starts
              here. Explore performance
              hardware and add your
              favourites to the cart.
            </p>

            <Link
              to="/products"
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-nexora-primary px-7 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-nexora-primary-hover"
            >
              Explore Products

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

          </div>

        </div>

      </main>
    );
  }

  /* =====================================================
     CART
  ===================================================== */

  return (
    <main className="min-h-screen bg-nexora-ivory">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-nexora-border bg-nexora-surface">

        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">

            <div>

              <div className="flex items-center gap-3">

                <span className="h-px w-10 bg-nexora-taupe" />

                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                  NEXORA / CART
                </p>

              </div>

              <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-[-0.045em] text-nexora-text sm:text-6xl">
                Your

                <span className="block text-nexora-taupe">
                  selection.
                </span>
              </h1>

              <p className="mt-5 text-sm text-nexora-muted sm:text-base">
                {totalItems}{" "}
                {totalItems === 1
                  ? "item"
                  : "items"}{" "}
                in your cart.
              </p>

            </div>

            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-nexora-muted transition hover:text-nexora-primary"
            >
              Continue shopping

              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>

          </div>

        </div>

      </section>

      {/* =================================================
          CART CONTENT
      ================================================= */}

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* ================= LOADING ================= */}

        {productsLoading &&
          products.length === 0 && (
            <div className="mb-6 rounded-2xl border border-nexora-border bg-nexora-surface p-4 text-sm text-nexora-muted">
              Checking current product
              availability...
            </div>
          )}

        {/* ================= STOCK WARNING ================= */}

        {!productsLoading &&
          hasStockIssues && (
            <div className="mb-6 rounded-2xl border border-nexora-copper/30 bg-nexora-copper-soft px-5 py-4">

              <div className="flex items-start gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexora-copper text-sm font-black text-white">
                  !
                </div>

                <div>

                  <p className="text-sm font-bold text-nexora-text">
                    Your cart needs
                    attention
                  </p>

                  <p className="mt-1 text-xs leading-5 text-nexora-muted">
                    Product or variant
                    availability has
                    changed since you
                    added an item. Update
                    or remove the affected
                    item before checkout.
                  </p>

                </div>

              </div>

            </div>
          )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-12">

          {/* =================================================
              CART ITEMS
          ================================================= */}

          <div>

            <div className="mb-5 flex items-end justify-between">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-nexora-taupe">
                  Your bag
                </p>

                <h2 className="mt-2 text-xl font-black tracking-tight text-nexora-text">
                  {cartItems.length}{" "}
                  {cartItems.length ===
                  1
                    ? "product"
                    : "products"}
                </h2>

              </div>

              <p className="text-xs text-nexora-muted">
                {totalItems}{" "}
                {totalItems === 1
                  ? "unit"
                  : "units"}
              </p>

            </div>

            <div className="space-y-4">

              {cartWithCurrentStock.map(
                (item) => {
                  const isOutOfStock =
                    item.currentStock <=
                    0;

                  const quantityTooHigh =
                    item.quantity >
                      item.currentStock &&
                    item.currentStock >
                      0;

                  const missingVariant =
                    Boolean(
                      item.variantId
                    ) &&
                    !item.variantExists;

                  const requiresVariant =
                    Boolean(
                      item.productNowHasVariants
                    ) &&
                    !item.variantId;

                  /*
                    Product ID alone is no longer
                    unique in the cart.
                  */

                  const cartKey =
                    `${item.id}::${
                      item.variantId ??
                      "default"
                    }`;

                  return (
                    <article
                      key={
                        cartKey
                      }
                      className={`
                        group
                        overflow-hidden
                        rounded-[1.75rem]
                        border
                        bg-nexora-surface
                        transition-all
                        duration-300
                        hover:shadow-[0_15px_35px_rgba(18,63,50,0.07)]

                        ${
                          isOutOfStock ||
                          quantityTooHigh ||
                          missingVariant ||
                          requiresVariant
                            ? "border-nexora-copper/50"
                            : "border-nexora-border hover:border-nexora-taupe"
                        }
                      `}
                    >

                      <div className="p-4 sm:p-5">

                        <div className="grid gap-5 sm:grid-cols-[150px_minmax(0,1fr)] lg:grid-cols-[160px_minmax(0,1fr)_140px]">

                          {/* ================= IMAGE ================= */}

                          <Link
                            to={`/products/${item.id}`}
                            className="flex h-48 items-center justify-center overflow-hidden rounded-[1.4rem] bg-[#F3EFE7] sm:h-40"
                          >
                            <img
                              src={
                                item.thumbnail
                              }
                              alt={
                                item.name
                              }
                              className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          </Link>

                          {/* ================= INFORMATION ================= */}

                          <div className="flex min-w-0 flex-col justify-between py-1">

                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                                  NEXORA
                                </p>

                                <span className="h-1 w-1 rounded-full bg-nexora-border" />

                                {isOutOfStock ||
                                missingVariant ||
                                requiresVariant ? (
                                  <div className="flex items-center gap-1.5">

                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-500">
                                      Needs attention
                                    </span>

                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">

                                    <span className="h-1.5 w-1.5 rounded-full bg-nexora-primary" />

                                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-nexora-muted">
                                      In stock
                                    </span>

                                  </div>
                                )}

                              </div>

                              <Link
                                to={`/products/${item.id}`}
                                className="mt-3 block max-w-xl text-lg font-bold leading-6 tracking-[-0.02em] text-nexora-text transition hover:text-nexora-primary sm:text-xl"
                              >
                                {item.name}
                              </Link>

                              {/* ================= VARIANT ================= */}

                              {item.variantId &&
                                item.variantExists && (
                                  <div className="mt-3">

                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                                      Configuration
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-nexora-text">
                                      {item.variantLabel ||
                                        Object.values(
                                          item.variantAttributes ||
                                            {}
                                        ).join(
                                          " / "
                                        )}
                                    </p>

                                  </div>
                                )}

                              <p className="mt-3 text-lg font-black tracking-tight text-nexora-primary">
                                ₹
                                {item.currentPrice.toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                              {/* CURRENT STOCK */}

                              {!isOutOfStock &&
                                !missingVariant &&
                                !requiresVariant && (
                                  <p className="mt-1 text-xs text-nexora-muted">
                                    {
                                      item.currentStock
                                    }{" "}
                                    available
                                  </p>
                                )}

                              {/* PRODUCT REMOVED */}

                              {!item.productExists && (
                                <p className="mt-2 text-xs font-semibold leading-5 text-red-500">
                                  This product is
                                  no longer
                                  available.
                                </p>
                              )}

                              {/* VARIANT REMOVED */}

                              {item.productExists &&
                                missingVariant && (
                                  <p className="mt-2 text-xs font-semibold leading-5 text-red-500">
                                    This
                                    configuration
                                    is no longer
                                    available.
                                  </p>
                                )}

                              {/* OLD CART LINE */}

                              {item.productExists &&
                                requiresVariant && (
                                  <p className="mt-2 text-xs font-semibold leading-5 text-nexora-copper">
                                    This product now
                                    requires a
                                    configuration.
                                    Remove it and
                                    select a variant
                                    again.
                                  </p>
                                )}

                              {/* OUT OF STOCK */}

                              {item.productExists &&
                                item.variantExists &&
                                !requiresVariant &&
                                isOutOfStock && (
                                  <p className="mt-2 text-xs font-semibold leading-5 text-red-500">
                                    This item is
                                    currently out of
                                    stock.
                                  </p>
                                )}

                              {/* QUANTITY TOO HIGH */}

                              {quantityTooHigh &&
                                !missingVariant &&
                                !requiresVariant && (
                                  <p className="mt-2 text-xs font-semibold leading-5 text-nexora-copper">
                                    Only{" "}
                                    {
                                      item.currentStock
                                    }{" "}
                                    available. Reduce
                                    the quantity before
                                    checkout.
                                  </p>
                                )}

                            </div>

                            {/* =================================================
                                QUANTITY + REMOVE
                            ================================================= */}

                            <div className="mt-6 flex flex-wrap items-start gap-4">

                              {!missingVariant &&
                                !requiresVariant &&
                                item.productExists && (
                                  <div>

                                    <div className="flex items-center rounded-full border border-nexora-border bg-nexora-ivory p-1">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDecrease(
                                            item
                                          )
                                        }
                                        disabled={
                                          item.quantity ===
                                          1
                                        }
                                        aria-label={`Decrease quantity of ${item.name}`}
                                        className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-medium text-nexora-text transition hover:bg-nexora-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                                      >
                                        −
                                      </button>

                                      <span className="min-w-10 px-2 text-center text-sm font-bold text-nexora-text">
                                        {
                                          item.quantity
                                        }
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleIncrease(
                                            item
                                          )
                                        }
                                        disabled={
                                          isOutOfStock ||
                                          item.quantity >=
                                            item.currentStock
                                        }
                                        aria-label={`Increase quantity of ${item.name}`}
                                        className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-medium text-nexora-text transition hover:bg-nexora-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                                      >
                                        +
                                      </button>

                                    </div>

                                    {!isOutOfStock &&
                                      !quantityTooHigh &&
                                      item.quantity >=
                                        item.currentStock && (
                                        <p
                                          role="status"
                                          className="mt-2 text-[11px] font-medium text-nexora-copper"
                                        >
                                          Maximum
                                          available
                                          quantity
                                          reached
                                        </p>
                                      )}

                                  </div>
                                )}

                              {/* ================= REMOVE ================= */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemove(
                                    item
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-xs font-bold uppercase tracking-[0.12em] text-nexora-muted transition hover:text-red-500"
                              >

                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"
                                  />
                                </svg>

                                Remove
                              </button>

                            </div>

                          </div>

                          {/* =================================================
                              ITEM TOTAL
                          ================================================= */}

                          <div className="flex items-end justify-between border-t border-nexora-border pt-5 sm:col-span-2 lg:col-span-1 lg:flex-col lg:items-end lg:justify-between lg:border-l lg:border-t-0 lg:py-2 lg:pl-6 lg:pt-2">

                            <div className="lg:text-right">

                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexora-taupe">
                                Item total
                              </p>

                              <p className="mt-2 text-xl font-black tracking-[-0.03em] text-nexora-text">
                                ₹
                                {(
                                  item.currentPrice *
                                  item.quantity
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                            </div>

                            <p className="text-xs text-nexora-muted">
                              Qty{" "}
                              {
                                item.quantity
                              }
                            </p>

                          </div>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <aside className="h-fit lg:sticky lg:top-28">

            <div className="overflow-hidden rounded-[2rem] bg-nexora-primary text-white shadow-[0_25px_60px_rgba(18,63,50,0.18)]">

              <div className="p-6 sm:p-7">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-nexora-taupe-soft/70">
                      Checkout
                    </p>

                    <h2 className="mt-3 text-2xl font-black tracking-tight">
                      Order Summary
                    </h2>

                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-4 w-4 text-nexora-taupe-soft"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2"
                      />
                    </svg>

                  </div>

                </div>

                <div className="mt-8 space-y-4">

                  <div className="flex items-center justify-between text-sm">

                    <span className="text-white/55">
                      Items
                    </span>

                    <span className="font-semibold">
                      {totalItems}
                    </span>

                  </div>

                  <div className="flex items-center justify-between text-sm">

                    <span className="text-white/55">
                      Subtotal
                    </span>

                    <span className="font-semibold">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                  <div className="flex items-center justify-between text-sm">

                    <span className="text-white/55">
                      Shipping
                    </span>

                    <span className="font-semibold">
                      Free
                    </span>

                  </div>

                </div>

                <div className="my-7 h-px bg-white/10" />

                <div className="flex items-end justify-between gap-4">

                  <div>

                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-nexora-taupe-soft/60">
                      Total
                    </p>

                    <p className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>

                  <span className="pb-1 text-xs font-medium text-white/45">
                    INR
                  </span>

                </div>

                {/* =================================================
                    CHECKOUT
                ================================================= */}

                {hasStockIssues ? (
                  <div className="mt-8">

                    <button
                      type="button"
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center rounded-full bg-white/15 px-6 py-4 text-sm font-bold text-white/50"
                    >
                      Resolve Stock Issues
                    </button>

                    <p className="mt-3 text-center text-[11px] leading-5 text-white/50">
                      Update your cart
                      before proceeding
                      to checkout.
                    </p>

                  </div>
                ) : (
                  <Link
                    to="/checkout"
                    className="group mt-8 flex w-full items-center justify-between rounded-full bg-nexora-ivory px-6 py-4 text-sm font-bold text-nexora-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                  >
                    <span>
                      Proceed to
                      Checkout
                    </span>

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                )}

                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-white/45">

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                    />

                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>

                  Secure checkout

                </div>

              </div>

            </div>

            {/* =================================================
                BENEFITS
            ================================================= */}

            <div className="mt-4 rounded-[1.75rem] border border-nexora-border bg-nexora-surface p-5">

              <div className="grid gap-4">

                <div className="flex items-start gap-3">

                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nexora-primary-soft text-xs font-bold text-nexora-primary">
                    ✓
                  </div>

                  <div>

                    <p className="text-sm font-bold text-nexora-text">
                      Free shipping
                    </p>

                    <p className="mt-1 text-xs leading-5 text-nexora-muted">
                      No additional
                      delivery charges.
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-3">

                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nexora-primary-soft text-xs font-bold text-nexora-primary">
                    ✓
                  </div>

                  <div>

                    <p className="text-sm font-bold text-nexora-text">
                      Live stock validation
                    </p>

                    <p className="mt-1 text-xs leading-5 text-nexora-muted">
                      Product and variant
                      quantities are
                      checked against
                      current inventory.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </section>

    </main>
  );
};

export default Cart;