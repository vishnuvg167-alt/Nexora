import {
  useParams,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchProducts,
} from "../redux/slices/productSlice";

import {
  getProductById,
} from "../services/productService";

import {
  addToCart,
} from "../redux/slices/cartSlice";

import {
  fetchWishlist,
  addToWishlistThunk,
  removeFromWishlistThunk,
} from "../redux/slices/wishlistSlice";

import {
  fetchReviews,
  addReview,
} from "../redux/slices/reviewSlice";

import {
  addRecentlyViewed,
  getRecentlyViewed,
} from "../utils/recentlyViewed";

import {
  getDefaultVariant,
  getPurchasablePrice,
  getPurchasableStock,
  hasProductVariants,
} from "../utils/productVariants";

import productImages from "../constants/productImages";
import productGalleryImages from "../constants/productGalleryImages";

/* ================= COMPONENTS ================= */

import ProductHero from "../components/productDetails/ProductHero";
import ProductStory from "../components/productDetails/ProductStory";
import PerformanceShowcase from "../components/productDetails/PerformanceShowcase";
import ProductVariantSelector from "../components/productDetails/ProductVariantSelector";
import PurchaseSection from "../components/productDetails/PurchaseSection";
import Specifications from "../components/productDetails/Specifications";
import RelatedProducts from "../components/productDetails/RelatedProducts";
import RecentlyViewed from "../components/productDetails/RecentlyViewed";
import CustomerReviews from "../components/productDetails/CustomerReviews";

/* =====================================================
   COMPONENT
===================================================== */

const ProductDetails = () => {
  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  /* ================= AUTH ================= */

  const {
    user,
    isAuthenticated,
  } = useSelector(
    (state) => state.auth
  );

  /* ================= PRODUCTS ================= */

  const allProducts = useSelector(
    (state) =>
      state.products.items
  );

  /* ================= WISHLIST ================= */

  const {
    items: wishlistItems,
    loading: wishlistLoading,
    addingProductId,
    removingProductId,
  } = useSelector(
    (state) =>
      state.wishlist
  );

  /* ================= REVIEWS ================= */

  const {
    items: reviews,
    loading: reviewsLoading,
    submitting,
    error: reviewsError,
  } = useSelector(
    (state) =>
      state.reviews
  );

  /* ================= PRODUCT STATE ================= */

  const [
    product,
    setProduct,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  /* ================= VARIANT ================= */

  const [
    selectedVariant,
    setSelectedVariant,
  ] = useState(null);

  const [
    cartMessage,
    setCartMessage,
  ] = useState("");

  const [
    wishlistMessage,
    setWishlistMessage,
  ] = useState("");

  const [
    recentlyViewedIds,
    setRecentlyViewedIds,
  ] = useState([]);

  /* ================= REVIEW FORM ================= */

  const [
    reviewForm,
    setReviewForm,
  ] = useState({
    rating: 0,
    title: "",
    comment: "",
  });

  const [
    reviewFormErrors,
    setReviewFormErrors,
  ] = useState({});

  const [
    reviewSuccess,
    setReviewSuccess,
  ] = useState("");

  /* =====================================================
     WISHLIST CHECK
  ===================================================== */

  const isInWishlist =
    wishlistItems.some(
      (item) =>
        String(
          item.productId
        ) ===
        String(
          product?.id
        )
    );

  /* =====================================================
     WISHLIST UPDATING
  ===================================================== */

  const isWishlistUpdating =
    String(
      addingProductId
    ) ===
      String(
        product?.id
      ) ||
    String(
      removingProductId
    ) ===
      String(
        product?.id
      );

  /* =====================================================
     FETCH PRODUCT
  ===================================================== */

  useEffect(() => {
    const fetchProduct =
      async () => {
        try {
          setLoading(true);
          setError(null);

          const data =
            await getProductById(
              id
            );

          setProduct(data);

          /* ---------- VARIANT ---------- */

          const defaultVariant =
            getDefaultVariant(
              data
            );

          setSelectedVariant(
            defaultVariant
          );

          /* ---------- IMAGE ---------- */

          const gallery =
            productGalleryImages[
              String(data.id)
            ];

          const image =
            gallery?.[0] ||
            productImages[
              String(data.id)
            ] ||
            data.images?.[0] ||
            data.thumbnail ||
            "";

          setSelectedImage(
            image
          );

          /* ---------- QUANTITY ---------- */

          setQuantity(1);

          /* ---------- MESSAGES ---------- */

          setCartMessage("");
          setWishlistMessage("");

          /* ---------- RECENTLY VIEWED ---------- */

          const previousRecentlyViewed =
            getRecentlyViewed();

          setRecentlyViewedIds(
            previousRecentlyViewed.filter(
              (productId) =>
                String(
                  productId
                ) !==
                String(
                  data.id
                )
            )
          );

          addRecentlyViewed(
            data.id
          );
        } catch (error) {
          setError(
            error.message
          );
        } finally {
          setLoading(false);
        }
      };

    fetchProduct();
  }, [id]);

  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  useEffect(() => {
    if (
      allProducts.length === 0
    ) {
      dispatch(
        fetchProducts()
      );
    }
  }, [
    dispatch,
    allProducts.length,
  ]);

  /* =====================================================
     FETCH USER WISHLIST
  ===================================================== */

  useEffect(() => {
    if (
      isAuthenticated &&
      user?.id
    ) {
      dispatch(
        fetchWishlist(
          user.id
        )
      );
    }
  }, [
    dispatch,
    isAuthenticated,
    user?.id,
  ]);

  /* =====================================================
     AUTO GALLERY SLIDER
  ===================================================== */

  useEffect(() => {
    if (!product) {
      return;
    }

    const gallery =
      productGalleryImages[
        String(product.id)
      ] || [];

    if (
      gallery.length <= 1
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        setSelectedImage(
          (currentImage) => {
            const currentIndex =
              gallery.indexOf(
                currentImage
              );

            const nextIndex =
              currentIndex === -1
                ? 0
                : (
                    currentIndex +
                    1
                  ) %
                  gallery.length;

            return gallery[
              nextIndex
            ];
          }
        );
      }, 4000);

    return () => {
      clearInterval(
        interval
      );
    };
  }, [product]);

  /* =====================================================
     FETCH REVIEWS
  ===================================================== */

  useEffect(() => {
    if (id) {
      dispatch(
        fetchReviews(id)
      );
    }
  }, [
    dispatch,
    id,
  ]);

  /* =====================================================
     VARIANT CHANGE
  ===================================================== */

  const handleVariantChange =
    (variant) => {
      setSelectedVariant(
        variant
      );

      /*
        Reset quantity because the newly
        selected variant may have less stock.
      */

      setQuantity(1);

      setCartMessage("");
    };

  /* =====================================================
     ACTIVE PURCHASE CONFIGURATION
  ===================================================== */

  const activePrice =
    product
      ? getPurchasablePrice(
          product,
          selectedVariant?.id
        )
      : 0;

  const activeStock =
    product
      ? getPurchasableStock(
          product,
          selectedVariant?.id
        )
      : 0;

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart =
    () => {
      if (
        !isAuthenticated
      ) {
        navigate(
          "/login",
          {
            state: {
              from:
                location.pathname +
                location.search,
            },
          }
        );

        return;
      }

      if (!product) {
        return;
      }

      if (
        hasProductVariants(
          product
        ) &&
        !selectedVariant
      ) {
        setCartMessage(
          "Please select a product configuration"
        );

        return;
      }

      if (
        activeStock <= 0
      ) {
        setCartMessage(
          "This configuration is out of stock"
        );

        return;
      }

      if (
        quantity >
        activeStock
      ) {
        setCartMessage(
          `Only ${activeStock} available`
        );

        return;
      }

      const image =
        productImages[
          String(
            product.id
          )
        ] ||
        product.images?.[0] ||
        product.thumbnail ||
        "";

      dispatch(
        addToCart({
          id:
            product.id,

          name:
            product.name,

          price:
            activePrice,

          thumbnail:
            image,

          stock:
            activeStock,

          quantity,

          variantId:
            selectedVariant?.id ||
            null,

          variantLabel:
            selectedVariant?.label ||
            null,

          variantAttributes:
            selectedVariant?.attributes ||
            null,
        })
      );

      setCartMessage(
        `${quantity} ${
          quantity === 1
            ? "item"
            : "items"
        } added to your cart`
      );

      setTimeout(() => {
        setCartMessage("");
      }, 2500);
    };

  /* =====================================================
     TOGGLE WISHLIST
  ===================================================== */

  const handleWishlist =
    async () => {
      if (
        !isAuthenticated ||
        !user?.id
      ) {
        navigate(
          "/login",
          {
            state: {
              from:
                location.pathname +
                location.search,
            },
          }
        );

        return;
      }

      if (
        !product ||
        isWishlistUpdating
      ) {
        return;
      }

      try {
        /* ---------- REMOVE ---------- */

        if (isInWishlist) {
          await dispatch(
            removeFromWishlistThunk({
              userId:
                user.id,

              productId:
                product.id,
            })
          ).unwrap();

          setWishlistMessage(
            "Removed from your wishlist"
          );

          setTimeout(() => {
            setWishlistMessage(
              ""
            );
          }, 2500);

          return;
        }

        /* ---------- IMAGE ---------- */

        const image =
          productImages[
            String(
              product.id
            )
          ] ||
          product.images?.[0] ||
          product.thumbnail ||
          "";

        /* ---------- ADD ---------- */

        await dispatch(
          addToWishlistThunk({
            userId:
              user.id,

            product: {
              id:
                product.id,

              name:
                product.name,

              /*
                Wishlist remains product-level,
                not variant-level.

                Starting/base product price is
                kept here for now.
              */

              price:
                product.price,

              thumbnail:
                image,

              stock:
                product.stock,

              category:
                product.category,

              brand:
                product.brand,
            },
          })
        ).unwrap();

        setWishlistMessage(
          "Added to your wishlist"
        );

        setTimeout(() => {
          setWishlistMessage(
            ""
          );
        }, 2500);
      } catch (error) {
        console.error(
          "Wishlist update failed:",
          error
        );

        setWishlistMessage(
          typeof error ===
            "string"
            ? error
            : "Unable to update wishlist"
        );

        setTimeout(() => {
          setWishlistMessage(
            ""
          );
        }, 2500);
      }
    };

  /* =====================================================
     BUY NOW
  ===================================================== */

  const handleBuyNow =
    () => {
      if (
        !isAuthenticated
      ) {
        navigate(
          "/login",
          {
            state: {
              from:
                location.pathname +
                location.search,
            },
          }
        );

        return;
      }

      if (!product) {
        return;
      }

      if (
        hasProductVariants(
          product
        ) &&
        !selectedVariant
      ) {
        return;
      }

      if (
        activeStock <= 0 ||
        quantity >
          activeStock
      ) {
        return;
      }

      const image =
        productImages[
          String(
            product.id
          )
        ] ||
        product.images?.[0] ||
        product.thumbnail ||
        "";

      const buyNowItem = {
        id:
          product.id,

        name:
          product.name,

        price:
          activePrice,

        thumbnail:
          image,

        stock:
          activeStock,

        quantity,

        variantId:
          selectedVariant?.id ||
          null,

        variantLabel:
          selectedVariant?.label ||
          null,

        variantAttributes:
          selectedVariant?.attributes ||
          null,
      };

      navigate(
        "/checkout",
        {
          state: {
            buyNowItem,
          },
        }
      );
    };

  /* =====================================================
     REVIEW INPUT
  ===================================================== */

  const handleReviewChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setReviewForm(
        (prev) => ({
          ...prev,
          [name]:
            value,
        })
      );

      setReviewFormErrors(
        (prev) => ({
          ...prev,
          [name]:
            "",
        })
      );

      setReviewSuccess(
        ""
      );
    };

  /* =====================================================
     RATING
  ===================================================== */

  const handleRatingChange =
    (rating) => {
      setReviewForm(
        (prev) => ({
          ...prev,
          rating,
        })
      );

      setReviewFormErrors(
        (prev) => ({
          ...prev,
          rating:
            "",
        })
      );

      setReviewSuccess(
        ""
      );
    };

  /* =====================================================
     VALIDATE REVIEW
  ===================================================== */

  const validateReview =
    () => {
      const errors =
        {};

      if (
        reviewForm.rating <
          1 ||
        reviewForm.rating >
          5
      ) {
        errors.rating =
          "Please select a rating.";
      }

      if (
        !reviewForm.title.trim()
      ) {
        errors.title =
          "Review title is required.";
      } else if (
        reviewForm.title.trim()
          .length < 3
      ) {
        errors.title =
          "Title must contain at least 3 characters.";
      }

      if (
        !reviewForm.comment.trim()
      ) {
        errors.comment =
          "Review comment is required.";
      } else if (
        reviewForm.comment.trim()
          .length < 10
      ) {
        errors.comment =
          "Review must contain at least 10 characters.";
      }

      setReviewFormErrors(
        errors
      );

      return (
        Object.keys(
          errors
        ).length === 0
      );
    };

  /* =====================================================
     LOGIN FROM REVIEW
  ===================================================== */

  const handleLoginRedirect =
    () => {
      navigate(
        "/login",
        {
          state: {
            from:
              location.pathname +
              location.search,
          },
        }
      );
    };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-nexora-ivory px-6 py-12 sm:py-16">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 lg:grid-cols-2">

            <div className="h-[600px] animate-pulse rounded-[2rem] bg-nexora-primary-soft" />

            <div className="flex flex-col justify-center space-y-5">

              <div className="h-3 w-24 animate-pulse rounded-full bg-nexora-primary-soft" />

              <div className="h-14 w-3/4 animate-pulse rounded-xl bg-nexora-primary-soft" />

              <div className="h-7 w-32 animate-pulse rounded-lg bg-nexora-primary-soft" />

              <div className="h-24 w-full animate-pulse rounded-xl bg-nexora-primary-soft" />

              <div className="mt-5 flex gap-3">

                <div className="h-12 w-40 animate-pulse rounded-full bg-nexora-primary-soft" />

                <div className="h-12 w-40 animate-pulse rounded-full bg-nexora-primary-soft" />

              </div>

            </div>

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
      <main className="min-h-screen bg-nexora-ivory px-6 py-16">

        <div className="mx-auto max-w-7xl">

          <div className="rounded-[2rem] border border-red-100 bg-nexora-surface px-6 py-24 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-500">
              !
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
              Product Error
            </p>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-nexora-text sm:text-4xl">
              Unable to load product
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-nexora-muted">
              {error}
            </p>

            <Link
              to="/products"
              className="mt-8 inline-block rounded-full bg-nexora-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-nexora-primary-hover"
            >
              Back to Products
            </Link>

          </div>

        </div>

      </main>
    );
  }

  /* =====================================================
     PRODUCT NOT FOUND
  ===================================================== */

  if (!product) {
    return (
      <main className="min-h-screen bg-nexora-ivory px-6 py-16">

        <div className="mx-auto max-w-7xl">

          <div className="rounded-[2rem] border border-nexora-border bg-nexora-surface px-6 py-24 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-nexora-primary-soft text-xl font-bold text-nexora-primary">
              ?
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              NEXORA
            </p>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-nexora-text sm:text-4xl">
              Product not found
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-nexora-muted">
              The product you're looking for is no longer available or could not be found.
            </p>

            <Link
              to="/products"
              className="mt-8 inline-block rounded-full bg-nexora-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-nexora-primary-hover"
            >
              Browse Products
            </Link>

          </div>

        </div>

      </main>
    );
  }

  /* =====================================================
     PRODUCT IMAGES
  ===================================================== */

  const productImage =
    productImages[
      String(
        product.id
      )
    ] ||
    product.images?.[0] ||
    product.thumbnail ||
    "";

  const galleryImages =
    productGalleryImages[
      String(
        product.id
      )
    ] || [
      productImage,
    ];

  /* =====================================================
     PRODUCT STORY
  ===================================================== */

  const categoryStory = {
    "Graphics Cards": {
      eyebrow:
        "Graphics performance",

      headline:
        "Built for visual power.",

      secondary:
        "Ready for what comes next.",

      featureOne:
        "High-performance graphics",

      featureOneText:
        "Designed for high-resolution gaming, demanding creative workloads and accelerated visual performance.",

      featureTwo:
        "Built for immersion",

      featureTwoText:
        "Engineered to deliver detailed visuals, responsive rendering and a smoother gaming experience.",
    },

    Laptops: {
      eyebrow:
        "Mobile performance",

      headline:
        "Power without boundaries.",

      secondary:
        "Performance that moves with you.",

      featureOne:
        "Desktop-class capability",

      featureOneText:
        "Built to handle demanding applications, gaming and productivity wherever your work takes you.",

      featureTwo:
        "Designed for mobility",

      featureTwoText:
        "Performance, portability and usability come together in one focused system.",
    },

    Processors: {
      eyebrow:
        "Processing performance",

      headline:
        "Power at the core.",

      secondary:
        "Built to process more.",

      featureOne:
        "Responsive computing",

      featureOneText:
        "Engineered to handle demanding applications, multitasking and intensive computing workloads.",

      featureTwo:
        "Built for efficiency",

      featureTwoText:
        "Balanced performance and efficiency provide a responsive experience across everyday and demanding tasks.",
    },

    Monitors: {
      eyebrow:
        "Display technology",

      headline:
        "See every detail.",

      secondary:
        "Built for a clearer view.",

      featureOne:
        "Immersive visuals",

      featureOneText:
        "Designed to deliver detailed imagery, fluid motion and a focused viewing experience.",

      featureTwo:
        "Made for your setup",

      featureTwoText:
        "A display experience designed around gaming, creative work and everyday productivity.",
    },

    Keyboards: {
      eyebrow:
        "Precision control",

      headline:
        "Every input matters.",

      secondary:
        "Built for complete control.",

      featureOne:
        "Responsive input",

      featureOneText:
        "Designed for precise, consistent input across gaming, productivity and everyday use.",

      featureTwo:
        "Made to feel right",

      featureTwoText:
        "Thoughtful controls and focused ergonomics create a more deliberate typing experience.",
    },

    Mice: {
      eyebrow:
        "Precision control",

      headline:
        "Move with precision.",

      secondary:
        "Control every movement.",

      featureOne:
        "Accurate tracking",

      featureOneText:
        "Engineered for precise movement and responsive control when every action matters.",

      featureTwo:
        "Designed for control",

      featureTwoText:
        "A focused shape and responsive experience built around fast, accurate interaction.",
    },

    Headsets: {
      eyebrow:
        "Immersive audio",

      headline:
        "Hear every detail.",

      secondary:
        "Built around the experience.",

      featureOne:
        "Detailed sound",

      featureOneText:
        "Designed to deliver clear, immersive audio for gaming, entertainment and communication.",

      featureTwo:
        "Made for long sessions",

      featureTwoText:
        "A focused listening experience designed around comfort, clarity and immersion.",
    },

    SSDs: {
      eyebrow:
        "High-speed storage",

      headline:
        "Speed that keeps moving.",

      secondary:
        "Built for faster access.",

      featureOne:
        "Fast data access",

      featureOneText:
        "Designed for responsive storage performance across games, applications and demanding workflows.",

      featureTwo:
        "Room to perform",

      featureTwoText:
        "High-capacity storage and fast access keep your system ready for larger workloads.",
    },
  };

  const story =
    categoryStory[
      product.category
    ] || {
      eyebrow:
        "NEXORA engineering",

      headline:
        "Designed to perform.",

      secondary:
        "Built for what comes next.",

      featureOne:
        "Purpose-built performance",

      featureOneText:
        "Engineered to deliver a responsive and dependable experience.",

      featureTwo:
        "Designed around you",

      featureTwoText:
        "Thoughtful hardware and design come together in a focused NEXORA experience.",
    };

  /* =====================================================
     RELATED PRODUCTS
  ===================================================== */

  const relatedProducts =
    allProducts
      .filter(
        (item) =>
          item.category ===
            product.category &&
          String(
            item.id
          ) !==
            String(
              product.id
            )
      )
      .slice(
        0,
        4
      );

  /* =====================================================
     RECENTLY VIEWED
  ===================================================== */

  const recentlyViewedProducts =
    recentlyViewedIds
      .map(
        (
          recentId
        ) =>
          allProducts.find(
            (item) =>
              String(
                item.id
              ) ===
              String(
                recentId
              )
          )
      )
      .filter(
        Boolean
      )
      .slice(
        0,
        4
      );

  /* =====================================================
     REVIEW STATISTICS
  ===================================================== */

  const reviewCount =
    reviews.length;

  const averageRating =
    reviewCount > 0
      ? reviews.reduce(
          (
            total,
            review
          ) =>
            total +
            Number(
              review.rating
            ),
          0
        ) /
        reviewCount
      : 0;

  const ratingCounts = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  reviews.forEach(
    (review) => {
      const rating =
        Number(
          review.rating
        );

      if (
        ratingCounts[
          rating
        ] !==
        undefined
      ) {
        ratingCounts[
          rating
        ] += 1;
      }
    }
  );

  /* =====================================================
     USER REVIEW CHECK
  ===================================================== */

  const existingUserReview =
    reviews.find(
      (review) =>
        String(
          review.userId
        ) ===
          String(
            user?.id
          ) &&
        String(
          review.productId
        ) ===
          String(
            product.id
          )
    );

  const hasReviewed =
    Boolean(
      existingUserReview
    );

  /* =====================================================
     SUBMIT REVIEW
  ===================================================== */

  const handleReviewSubmit =
    async (e) => {
      e.preventDefault();

      setReviewSuccess(
        ""
      );

      if (
        !isAuthenticated
      ) {
        handleLoginRedirect();

        return;
      }

      if (
        hasReviewed
      ) {
        return;
      }

      if (
        !validateReview()
      ) {
        return;
      }

      const reviewData = {
        productId:
          String(
            product.id
          ),

        userId:
          String(
            user.id
          ),

        userName:
          user.name,

        rating:
          reviewForm.rating,

        title:
          reviewForm.title.trim(),

        comment:
          reviewForm.comment.trim(),

        createdAt:
          new Date().toISOString(),
      };

      try {
        await dispatch(
          addReview(
            reviewData
          )
        ).unwrap();

        setReviewForm({
          rating: 0,
          title: "",
          comment: "",
        });

        setReviewFormErrors(
          {}
        );

        setReviewSuccess(
          "Your review has been submitted successfully."
        );
      } catch (error) {
        console.error(
          "Failed to submit review:",
          error
        );
      }
    };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-nexora-ivory px-6 py-12 sm:py-16">

      {/* ================= CART TOAST ================= */}

      {cartMessage && (
        <div
          role="status"
          aria-live="polite"
          className="
            fixed
            right-4
            top-24
            z-50
            max-w-sm
            rounded-2xl
            border
            border-nexora-border
            bg-nexora-surface
            p-4
            shadow-[0_18px_50px_rgba(18,63,50,0.16)]
          "
        >

          <div className="flex items-center gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nexora-primary text-white">
              ✓
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-sm font-bold text-nexora-text">
                Cart
              </p>

              <p className="mt-0.5 text-xs text-nexora-muted">
                {cartMessage}
              </p>

            </div>

            <Link
              to="/cart"
              className="shrink-0 text-xs font-bold text-nexora-primary transition hover:text-nexora-primary-hover"
            >
              View Cart
            </Link>

            <button
              type="button"
              onClick={() =>
                setCartMessage(
                  ""
                )
              }
              className="text-lg text-nexora-taupe transition hover:text-nexora-primary"
              aria-label="Close notification"
            >
              ×
            </button>

          </div>

        </div>
      )}

      {/* ================= WISHLIST TOAST ================= */}

      {wishlistMessage && (
        <div
          role="status"
          aria-live="polite"
          className="
            fixed
            right-4
            top-24
            z-50
            max-w-sm
            rounded-2xl
            border
            border-nexora-border
            bg-nexora-surface
            p-4
            shadow-[0_18px_50px_rgba(18,63,50,0.16)]
          "
        >

          <div className="flex items-center gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nexora-primary-soft text-nexora-primary">

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08A6.01 6.01 0 0 1 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.54L12 21.35Z" />
              </svg>

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-sm font-bold text-nexora-text">
                Wishlist updated
              </p>

              <p className="mt-0.5 text-xs text-nexora-muted">
                {wishlistMessage}
              </p>

            </div>

            <Link
              to="/wishlist"
              className="shrink-0 text-xs font-bold text-nexora-primary transition hover:text-nexora-primary-hover"
            >
              View
            </Link>

            <button
              type="button"
              onClick={() =>
                setWishlistMessage(
                  ""
                )
              }
              className="text-lg text-nexora-taupe transition hover:text-nexora-primary"
              aria-label="Close notification"
            >
              ×
            </button>

          </div>

        </div>
      )}

      <div className="mx-auto max-w-7xl">

        {/* ================= HERO ================= */}

        <ProductHero
          product={
            product
          }
          productImage={
            productImage
          }
          galleryImages={
            galleryImages
          }
          selectedImage={
            selectedImage
          }
          setSelectedImage={
            setSelectedImage
          }
          reviewCount={
            reviewCount
          }
          averageRating={
            averageRating
          }
        />

        {/* ================= STORY ================= */}

        <ProductStory
          product={
            product
          }
        />

        {/* ================= PERFORMANCE ================= */}

        <PerformanceShowcase
          product={
            product
          }
          story={
            story
          }
          galleryImages={
            galleryImages
          }
          productImage={
            productImage
          }
        />

        {/* ================= VARIANTS ================= */}

        {hasProductVariants(
          product
        ) && (
          <section className="mt-10 rounded-[2rem] border border-nexora-border bg-nexora-surface p-6 sm:p-8">

            <div className="mb-6">

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-nexora-taupe">
                Configuration
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-nexora-text">
                Choose your configuration
              </h2>

              <p className="mt-2 text-sm leading-6 text-nexora-muted">
                Select the configuration that fits your setup.
              </p>

            </div>

            <ProductVariantSelector
              product={
                product
              }
              selectedVariant={
                selectedVariant
              }
              onVariantChange={
                handleVariantChange
              }
            />

          </section>
        )}

        {/* ================= PURCHASE ================= */}

        <PurchaseSection
          product={
            product
          }
          activePrice={
            activePrice
          }
          activeStock={
            activeStock
          }
          selectedVariant={
            selectedVariant
          }
          quantity={
            quantity
          }
          setQuantity={
            setQuantity
          }
          handleAddToCart={
            handleAddToCart
          }
          handleBuyNow={
            handleBuyNow
          }
          handleWishlist={
            handleWishlist
          }
          isInWishlist={
            isInWishlist
          }
          wishlistLoading={
            wishlistLoading
          }
          isWishlistUpdating={
            isWishlistUpdating
          }
        />

        {/* ================= SPECIFICATIONS ================= */}

        <Specifications
          product={
            product
          }
        />

        {/* ================= RELATED ================= */}

        <RelatedProducts
          relatedProducts={
            relatedProducts
          }
          category={
            product.category
          }
        />

        {/* ================= RECENTLY VIEWED ================= */}

        <RecentlyViewed
          recentlyViewedProducts={
            recentlyViewedProducts
          }
        />

        {/* ================= REVIEWS ================= */}

        <CustomerReviews
          reviews={
            reviews
          }
          reviewsLoading={
            reviewsLoading
          }
          reviewsError={
            reviewsError
          }
          submitting={
            submitting
          }
          averageRating={
            averageRating
          }
          ratingCounts={
            ratingCounts
          }
          isAuthenticated={
            isAuthenticated
          }
          hasReviewed={
            hasReviewed
          }
          reviewForm={
            reviewForm
          }
          reviewFormErrors={
            reviewFormErrors
          }
          reviewSuccess={
            reviewSuccess
          }
          handleReviewChange={
            handleReviewChange
          }
          handleRatingChange={
            handleRatingChange
          }
          handleReviewSubmit={
            handleReviewSubmit
          }
          handleLoginRedirect={
            handleLoginRedirect
          }
        />

      </div>

    </main>
  );
};

export default ProductDetails;