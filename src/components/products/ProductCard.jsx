import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

import {
  addToWishlistThunk,
  removeFromWishlistThunk,
} from "../../redux/slices/wishlistSlice";

import { addToCart } from "../../redux/slices/cartSlice";

import {
  addToComparison,
  removeFromComparison,
} from "../../redux/slices/comparisonSlice";

import productImages from "../../constants/productImages";

const ProductCard = ({ product, rating = 0, reviewCount = 0 }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [cartMessage, setCartMessage] = useState(false);

  /* ================= AUTH ================= */

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  /* ================= WISHLIST ================= */

  const {
    items: wishlistItems,
    addingProductId,
    removingProductId,
  } = useSelector((state) => state.wishlist);

  const isWishlisted = wishlistItems.some(
    (item) => String(item.productId) === String(product.id)
  );

  const isAddingWishlist =
    String(addingProductId) === String(product.id);

  const isRemovingWishlist =
    String(removingProductId) === String(product.id);

  const isWishlistUpdating =
    isAddingWishlist || isRemovingWishlist;

  /* ================= COMPARISON ================= */

  const comparisonItems = useSelector(
    (state) => state.comparison.items
  );

  const isCompared = comparisonItems.some(
    (item) => String(item.id) === String(product.id)
  );

  /* ================= IMAGE ================= */

  const productImage =
    productImages[String(product.id)] ||
    product.images?.[0] ||
    product.thumbnail ||
    "";

  /* ================= LOGIN REDIRECT ================= */

  const redirectToLogin = () => {
    navigate("/login", {
      state: {
        from: location.pathname + location.search,
      },
    });
  };

  /* ================= WISHLIST ================= */

  const handleWishlist = async () => {
    if (!isAuthenticated || !user?.id) {
      redirectToLogin();
      return;
    }

    if (isWishlistUpdating) return;

    try {
      if (isWishlisted) {
        await dispatch(
          removeFromWishlistThunk({
            userId: user.id,
            productId: product.id,
          })
        ).unwrap();

        return;
      }

      await dispatch(
        addToWishlistThunk({
          userId: user.id,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            thumbnail: productImage,
            stock: product.stock,
            category: product.category,
            brand: product.brand,
          },
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    }
  };

  /* ================= COMPARISON ================= */

  const handleComparison = () => {
    if (isCompared) {
      dispatch(removeFromComparison(product.id));
      return;
    }

    dispatch(
      addToComparison({
        ...product,
        compareImage: productImage,
        rating: Number(rating),
        reviewCount: Number(reviewCount),
      })
    );
  };

  /* ================= CART ================= */

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        thumbnail: productImage,
        stock: product.stock,
        quantity: 1,
      })
    );

    setCartMessage(true);

    setTimeout(() => {
      setCartMessage(false);
    }, 2000);
  };

  /* ================= PRODUCT CARD ================= */

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-nexora-border bg-nexora-surface transition-all duration-300 hover:-translate-y-1 hover:border-nexora-taupe hover:shadow-[0_20px_45px_rgba(18,63,50,0.10)]">

      {/* ================= IMAGE AREA ================= */}

      <div className="relative">
        <Link
          to={`/products/${product.id}`}
          className="block overflow-hidden bg-[#f3efe7]"
        >
          <div className="flex aspect-[4/3] items-center justify-center p-7 sm:p-8">
            <img
              src={productImage}
              alt={product.name}
              loading="lazy"
              className={`h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
                Number(product.stock) === 0
                  ? "opacity-60 grayscale"
                  : ""
              }`}
            />
          </div>
        </Link>

        {/* ================= STOCK BADGE ================= */}

        {Number(product.stock) === 0 && (
          <div className="absolute left-4 top-4 rounded-full bg-nexora-text px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Out of stock
          </div>
        )}

        {/* ================= WISHLIST ================= */}

        <button
          type="button"
          onClick={handleWishlist}
          disabled={isWishlistUpdating}
          aria-pressed={isWishlisted}
          aria-label={
            isWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-105 disabled:cursor-wait disabled:opacity-60 ${
            isWishlisted
              ? "border-nexora-primary bg-nexora-primary text-white"
              : "border-nexora-border bg-nexora-surface/90 text-nexora-primary hover:border-nexora-primary"
          }`}
        >
          {isWishlistUpdating ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill={isWishlisted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* ================= CONTENT ================= */}

      <div className="flex flex-1 flex-col p-5 sm:p-6">

        {/* BRAND / CATEGORY */}

        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
            {product.brand}
          </p>

          <span className="h-1 w-1 rounded-full bg-nexora-border" />

          <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-muted">
            {product.category}
          </p>
        </div>

        {/* PRODUCT NAME */}

        <Link to={`/products/${product.id}`} className="mt-3">
          <h2 className="line-clamp-2 min-h-[3.25rem] text-lg font-bold leading-[1.45] tracking-[-0.02em] text-nexora-text transition-colors duration-200 hover:text-nexora-primary">
            {product.name}
          </h2>
        </Link>

        {/* ================= RATING ================= */}

        <div className="mt-3 flex items-center gap-2">
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
              {reviewCount > 0 ? Number(rating).toFixed(1) : "—"}
            </span>
          </div>

          <span className="text-xs text-nexora-muted">
            {reviewCount > 0
              ? `${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`
              : "No reviews yet"}
          </span>
        </div>

        {/* ================= COMPARE ================= */}

        <button
          type="button"
          onClick={handleComparison}
          aria-pressed={isCompared}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
            isCompared
              ? "border-nexora-primary bg-nexora-primary-soft text-nexora-primary"
              : "border-nexora-border bg-nexora-surface text-nexora-muted hover:border-nexora-primary hover:text-nexora-primary"
          }`}
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
              d="M8 7h11m0 0-3-3m3 3-3 3M16 17H5m0 0 3 3m-3-3 3-3"
            />
          </svg>

          <span>
            {isCompared ? "Added to Compare" : "Add to Compare"}
          </span>

          {isCompared && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m5 12 4 4L19 6"
              />
            </svg>
          )}
        </button>

        {/* ================= BOTTOM ================= */}

        <div className="mt-auto pt-6">

          {/* PRICE / STOCK */}

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexora-taupe">
                Price
              </p>

              <p className="mt-1 text-2xl font-black tracking-[-0.035em] text-nexora-text">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </p>
            </div>

            {Number(product.stock) > 0 && (
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-nexora-primary" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-nexora-primary">
                    In stock
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-nexora-muted">
                  {product.stock} available
                </p>
              </div>
            )}
          </div>

          {/* ================= ADD TO CART ================= */}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={Number(product.stock) === 0}
            className="mt-5 flex w-full items-center justify-between rounded-full bg-nexora-primary px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-nexora-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-nexora-primary-soft disabled:text-nexora-muted"
          >
            <span>
              {Number(product.stock) === 0
                ? "Currently unavailable"
                : cartMessage
                  ? "✓ Added to Cart"
                  : "Add to Cart"}
            </span>

            {Number(product.stock) > 0 && !cartMessage && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M13 6l6 6-6 6"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;