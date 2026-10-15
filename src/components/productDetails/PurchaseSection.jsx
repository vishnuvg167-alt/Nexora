import {
  Link,
} from "react-router-dom";

const PurchaseSection = ({
  product,

  /* ================= VARIANT-AWARE VALUES ================= */

  activePrice,
  activeStock,
  selectedVariant,

  /* ================= EXISTING PROPS ================= */

  quantity,
  setQuantity,
  handleAddToCart,
  handleBuyNow,
  handleWishlist,
  isInWishlist,
  wishlistLoading = false,
  isWishlistUpdating = false,
}) => {
  /* =====================================================
     ACTIVE VALUES

     ProductDetails calculates these values.

     Normal product:
       activePrice = product.price
       activeStock = product.stock

     Variant product:
       activePrice = selected variant price
       activeStock = selected variant stock
  ===================================================== */

  const price =
    Number(
      activePrice ??
        product.price
    ) || 0;

  const stock =
    Math.max(
      Number(
        activeStock ??
          product.stock
      ) || 0,
      0
    );

  const isOutOfStock =
    stock <= 0;

  /* =====================================================
     QUANTITY
  ===================================================== */

  const decreaseQuantity =
    () => {
      if (quantity > 1) {
        setQuantity(
          (prev) =>
            prev - 1
        );
      }
    };

  const increaseQuantity =
    () => {
      if (
        quantity <
        stock
      ) {
        setQuantity(
          (prev) =>
            prev + 1
        );
      }
    };

  /* =====================================================
     TOTAL
  ===================================================== */

  const total =
    price * quantity;

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-nexora-surface text-nexora-text">

      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">

          <div>

            <div className="flex items-center gap-4">

              <span className="h-px w-10 bg-nexora-taupe" />

              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-nexora-taupe">
                Make it yours
              </p>

            </div>

            <h2 className="mt-6 max-w-3xl text-5xl font-black leading-[0.9] tracking-[-0.055em] text-nexora-text sm:text-6xl lg:text-7xl">

              Ready when

              <span className="block text-nexora-taupe-soft">
                you are.
              </span>

            </h2>

          </div>

          {/* ================= PRICE ================= */}

          <div className="lg:justify-self-end">

            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              Price
            </p>

            <p className="mt-3 text-3xl font-bold tracking-[-0.04em] text-nexora-primary">
              ₹
              {price.toLocaleString(
                "en-IN"
              )}
            </p>

            {/* ================= SELECTED VARIANT ================= */}

            {selectedVariant && (
              <div className="mt-3">

                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-nexora-taupe">
                  Selected
                </p>

                <p className="mt-1 text-sm font-semibold text-nexora-text">
                  {
                    selectedVariant.label
                  }
                </p>

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            PURCHASE PANEL
        ================================================= */}

        <div className="mt-16 border-y border-nexora-border sm:mt-20">

          <div className="grid lg:grid-cols-[1fr_auto] lg:items-center">

            {/* =================================================
                LEFT
            ================================================= */}

            <div className="py-10 lg:py-12 lg:pr-12">

              <div className="flex flex-wrap items-center gap-x-10 gap-y-6">

                {/* ================= AVAILABILITY ================= */}

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                    Availability
                  </p>

                  {isOutOfStock ? (
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-nexora-text">

                      <span className="h-2 w-2 rounded-full bg-red-500" />

                      Out of stock

                    </p>
                  ) : (
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-nexora-primary">

                      <span className="h-2 w-2 rounded-full bg-nexora-primary" />

                      {stock} available

                    </p>
                  )}

                </div>

                {/* =================================================
                    QUANTITY
                ================================================= */}

                {!isOutOfStock && (
                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                      Quantity
                    </p>

                    <div className="mt-2 flex items-center gap-4">

                      {/* ================= DECREASE ================= */}

                      <button
                        type="button"
                        onClick={
                          decreaseQuantity
                        }
                        disabled={
                          quantity <= 1
                        }
                        aria-label="Decrease quantity"
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-nexora-border
                          bg-nexora-ivory
                          text-lg
                          text-nexora-text
                          transition
                          hover:border-nexora-primary
                          hover:bg-nexora-primary
                          hover:text-white
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        −
                      </button>

                      <span className="min-w-6 text-center text-sm font-semibold text-nexora-text">
                        {quantity}
                      </span>

                      {/* ================= INCREASE ================= */}

                      <button
                        type="button"
                        onClick={
                          increaseQuantity
                        }
                        disabled={
                          quantity >=
                          stock
                        }
                        aria-label="Increase quantity"
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-nexora-border
                          bg-nexora-ivory
                          text-lg
                          text-nexora-text
                          transition
                          hover:border-nexora-primary
                          hover:bg-nexora-primary
                          hover:text-white
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        +
                      </button>

                    </div>

                  </div>
                )}

                {/* =================================================
                    TOTAL
                ================================================= */}

                {!isOutOfStock && (
                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                      Total
                    </p>

                    <p className="mt-2 text-sm font-semibold text-nexora-text">
                      ₹
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>
                )}

              </div>

            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="border-t border-nexora-border py-10 lg:border-l lg:border-t-0 lg:py-12 lg:pl-12">

              <div className="flex flex-col gap-3">

                {/* =================================================
                    PURCHASE BUTTONS
                ================================================= */}

                {!isOutOfStock ? (
                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">

                    {/* ================= ADD TO CART ================= */}

                    <button
                      type="button"
                      onClick={
                        handleAddToCart
                      }
                      className="
                        min-w-[180px]
                        rounded-full
                        bg-nexora-primary
                        px-8
                        py-4
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-white
                        transition
                        duration-300
                        hover:bg-nexora-primary-hover
                        active:scale-[0.98]
                      "
                    >
                      Add to Cart
                    </button>

                    {/* ================= BUY NOW ================= */}

                    <button
                      type="button"
                      onClick={
                        handleBuyNow
                      }
                      className="
                        min-w-[180px]
                        rounded-full
                        border
                        border-nexora-primary
                        bg-transparent
                        px-8
                        py-4
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-nexora-primary
                        transition
                        duration-300
                        hover:bg-nexora-primary
                        hover:text-white
                        active:scale-[0.98]
                      "
                    >
                      Buy Now
                    </button>

                  </div>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="
                      min-w-[220px]
                      cursor-not-allowed
                      rounded-full
                      bg-nexora-primary-soft
                      px-8
                      py-4
                      text-xs
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-nexora-muted
                    "
                  >
                    Currently Unavailable
                  </button>
                )}

                {/* =================================================
                    WISHLIST
                ================================================= */}

                <button
                  type="button"
                  onClick={
                    handleWishlist
                  }
                  disabled={
                    wishlistLoading ||
                    isWishlistUpdating
                  }
                  aria-pressed={
                    isInWishlist
                  }
                  className={`
                    group
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2.5
                    rounded-full
                    border
                    px-8
                    py-3.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    transition
                    duration-300
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-60

                    ${
                      isInWishlist
                        ? `
                          border-nexora-primary
                          bg-nexora-primary-soft
                          text-nexora-primary
                        `
                        : `
                          border-nexora-border
                          bg-nexora-surface
                          text-nexora-muted
                          hover:border-nexora-primary
                          hover:bg-nexora-primary-soft
                          hover:text-nexora-primary
                        `
                    }
                  `}
                >

                  {/* ================= HEART ================= */}

                  <svg
                    viewBox="0 0 24 24"
                    fill={
                      isInWishlist
                        ? "currentColor"
                        : "none"
                    }
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-300
                      group-hover:scale-110
                    "
                    aria-hidden="true"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
                  </svg>

                  {isWishlistUpdating
                    ? "Updating..."
                    : isInWishlist
                      ? "In Wishlist"
                      : "Add to Wishlist"}

                </button>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-5">

          <p className="text-xs leading-6 text-nexora-muted">
            Secure checkout · Stock
            verified before payment
          </p>

          <Link
            to="/products"
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.25em]
              text-nexora-muted
              transition
              hover:text-nexora-primary
            "
          >
            Continue Shopping →
          </Link>

        </div>

      </div>

    </section>
  );
};

export default PurchaseSection;