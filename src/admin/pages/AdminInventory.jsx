import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchProducts,
  updateProductStockThunk,
  updateProductVariantsThunk,
} from "../../redux/slices/productSlice";

import {
  createInventoryAdjustmentThunk,
  fetchInventoryAdjustments,
} from "../../redux/slices/inventorySlice";

import StockAdjustmentDrawer from "../components/inventory/StockAdjustmentDrawer";
import InventoryAdjustmentHistory from "../components/inventory/InventoryAdjustmentHistory";

/* =====================================================
   CONSTANTS
===================================================== */

const LOW_STOCK_LIMIT = 5;

/* =====================================================
   HELPERS
===================================================== */

const getStockStatus = (stock) => {
  const quantity =
    Number(stock) || 0;

  if (quantity <= 0) {
    return "out";
  }

  if (
    quantity <=
    LOW_STOCK_LIMIT
  ) {
    return "low";
  }

  return "in";
};

const getStockStatusLabel = (
  status
) => {
  if (status === "out") {
    return "Out of Stock";
  }

  if (status === "low") {
    return "Low Stock";
  }

  return "In Stock";
};

const hasProductVariants = (
  product
) => {
  return (
    Array.isArray(
      product?.variants
    ) &&
    product.variants.length >
      0
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({
  label,
  value,
  description,
  icon,
}) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-nexora-border
        bg-nexora-surface
        p-5
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.12em]
              text-nexora-muted
            "
          >
            {label}
          </p>

          <p
            className="
              mt-3
              text-3xl
              font-black
              tracking-tight
              text-nexora-text
            "
          >
            {value}
          </p>

          <p
            className="
              mt-2
              text-xs
              text-nexora-muted
            "
          >
            {description}
          </p>
        </div>

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-nexora-primary-soft
            text-nexora-primary
          "
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   STOCK BADGE
===================================================== */

const StockBadge = ({
  stock,
}) => {
  const status =
    getStockStatus(stock);

  const styles = {
    in: `
      bg-emerald-50
      text-emerald-700
      ring-emerald-600/20
    `,

    low: `
      bg-amber-50
      text-amber-700
      ring-amber-600/20
    `,

    out: `
      bg-red-50
      text-red-700
      ring-red-600/20
    `,
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2.5
        py-1
        text-[11px]
        font-bold
        ring-1
        ring-inset
        ${styles[status]}
      `}
    >
      {getStockStatusLabel(
        status
      )}
    </span>
  );
};

/* =====================================================
   ADMIN INVENTORY
===================================================== */

const AdminInventory = () => {
  const dispatch =
    useDispatch();

  /* =====================================================
     PRODUCT REDUX STATE
  ===================================================== */

  const {
    items: products,
    loading,
    error,
  } = useSelector(
    (state) =>
      state.products
  );

  /* =====================================================
     INVENTORY HISTORY REDUX STATE
  ===================================================== */

  const {
    adjustments,
    loading:
      historyLoading,
    error: historyError,
  } = useSelector(
    (state) =>
      state.inventory
  );

  /* =====================================================
     FILTER STATE
  ===================================================== */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("all");

  const [
    stockFilter,
    setStockFilter,
  ] = useState("all");

  /* =====================================================
     STOCK ADJUSTMENT STATE
  ===================================================== */

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState(null);

  const [
    isAdjustingStock,
    setIsAdjustingStock,
  ] = useState(false);

  /* =====================================================
     FETCH DATA
  ===================================================== */

  useEffect(() => {
    dispatch(
      fetchProducts()
    );

    dispatch(
      fetchInventoryAdjustments()
    );
  }, [dispatch]);

  /* =====================================================
     CATEGORIES
  ===================================================== */

  const categories =
    useMemo(() => {
      const uniqueCategories =
        [
          ...new Set(
            products
              .map(
                (
                  product
                ) =>
                  product.category
              )
              .filter(
                Boolean
              )
          ),
        ];

      return uniqueCategories.sort(
        (a, b) =>
          a.localeCompare(
            b
          )
      );
    }, [products]);

  /* =====================================================
     INVENTORY STATS
  ===================================================== */

  const inventoryStats =
    useMemo(() => {
      const totalProducts =
        products.length;

      const totalUnits =
        products.reduce(
          (
            total,
            product
          ) => {
            const stock =
              Math.max(
                Number(
                  product.stock
                ) || 0,
                0
              );

            return (
              total + stock
            );
          },
          0
        );

      const lowStock =
        products.filter(
          (product) =>
            getStockStatus(
              product.stock
            ) === "low"
        ).length;

      const outOfStock =
        products.filter(
          (product) =>
            getStockStatus(
              product.stock
            ) === "out"
        ).length;

      return {
        totalProducts,
        totalUnits,
        lowStock,
        outOfStock,
      };
    }, [products]);

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const name =
            String(
              product.name ||
                ""
            ).toLowerCase();

          const brand =
            String(
              product.brand ||
                ""
            ).toLowerCase();

          const category =
            String(
              product.category ||
                ""
            ).toLowerCase();

          /*
           * Variant labels are searchable too.
           *
           * Example:
           * searching "32GB / 1TB"
           * can find the laptop.
           */

          const variantText =
            Array.isArray(
              product.variants
            )
              ? product.variants
                  .map(
                    (
                      variant
                    ) =>
                      `${
                        variant.label ||
                        ""
                      } ${
                        variant.id ||
                        ""
                      }`
                  )
                  .join(" ")
                  .toLowerCase()
              : "";

          const matchesSearch =
            !normalizedSearch ||
            name.includes(
              normalizedSearch
            ) ||
            brand.includes(
              normalizedSearch
            ) ||
            category.includes(
              normalizedSearch
            ) ||
            variantText.includes(
              normalizedSearch
            );

          const matchesCategory =
            selectedCategory ===
              "all" ||
            product.category ===
              selectedCategory;

          const productStatus =
            getStockStatus(
              product.stock
            );

          const matchesStock =
            stockFilter ===
              "all" ||
            productStatus ===
              stockFilter;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesStock
          );
        }
      );
    }, [
      products,
      search,
      selectedCategory,
      stockFilter,
    ]);

  /* =====================================================
     RESET FILTERS
  ===================================================== */

  const handleResetFilters =
    () => {
      setSearch("");

      setSelectedCategory(
        "all"
      );

      setStockFilter(
        "all"
      );
    };

  /* =====================================================
     OPEN STOCK ADJUSTMENT
  ===================================================== */

  const handleOpenStockAdjustment =
    (product) => {
      setSelectedProduct(
        product
      );
    };

  /* =====================================================
     CLOSE STOCK ADJUSTMENT
  ===================================================== */

  const handleCloseStockAdjustment =
    () => {
      if (
        isAdjustingStock
      ) {
        return;
      }

      setSelectedProduct(
        null
      );
    };

  /* =====================================================
     CONFIRM STOCK ADJUSTMENT

     SIMPLE PRODUCT:
       update product.stock

     VARIANT PRODUCT:
       update exact variant.stock
       recalculate product.stock
  ===================================================== */

  const handleConfirmStockAdjustment =
    async ({
      product,
      adjustmentType,
      quantity,

      /*
       * For simple products:
       * previousStock/newStock = product stock.
       *
       * For variant products:
       * previousStock/newStock = selected variant stock.
       */

      previousStock,
      newStock,

      /*
       * Parent totals supplied by the
       * variant-aware drawer.
       */

      previousProductStock,
      newProductStock,

      variantId,
      variantLabel,

      reason,
    }) => {
      setIsAdjustingStock(
        true
      );

      try {
        const productHasVariants =
          hasProductVariants(
            product
          );

        /* ===============================================
           VARIANT PRODUCT
        =============================================== */

        if (
          productHasVariants
        ) {
          if (!variantId) {
            throw new Error(
              "Select a product configuration before adjusting stock."
            );
          }

          /*
           * Build a completely new variants array.
           *
           * We never mutate product.variants directly.
           */

          let variantFound =
            false;

          const updatedVariants =
            product.variants.map(
              (variant) => {
                if (
                  String(
                    variant.id
                  ) !==
                  String(
                    variantId
                  )
                ) {
                  return {
                    ...variant,
                  };
                }

                variantFound =
                  true;

                return {
                  ...variant,

                  stock:
                    Number(
                      newStock
                    ),
                };
              }
            );

          if (
            !variantFound
          ) {
            throw new Error(
              "The selected product configuration could not be found."
            );
          }

          /*
           * Recalculate parent stock here as well.
           *
           * We don't blindly trust the drawer.
           */

          const calculatedProductStock =
            updatedVariants.reduce(
              (
                total,
                variant
              ) =>
                total +
                Math.max(
                  Number(
                    variant.stock
                  ) || 0,
                  0
                ),
              0
            );

          /*
           * Defensive check.
           *
           * Drawer and page should calculate
           * exactly the same parent total.
           */

          if (
            Number(
              newProductStock
            ) !==
            calculatedProductStock
          ) {
            throw new Error(
              "Variant stock calculation mismatch. Please close the drawer and try again."
            );
          }

          /* =============================================
             STEP 1 — UPDATE VARIANT + PARENT STOCK
          ============================================= */

          await dispatch(
            updateProductVariantsThunk(
              {
                id: product.id,

                variants:
                  updatedVariants,

                stock:
                  calculatedProductStock,
              }
            )
          ).unwrap();

          /* =============================================
             STEP 2 — VARIANT-AWARE AUDIT RECORD
          ============================================= */

          await dispatch(
            createInventoryAdjustmentThunk(
              {
                productId:
                  String(
                    product.id
                  ),

                productName:
                  product.name,

                productCategory:
                  product.category ||
                  "",

                /*
                 * Variant identity
                 */

                variantId:
                  String(
                    variantId
                  ),

                variantLabel:
                  variantLabel ||
                  String(
                    variantId
                  ),

                /*
                 * Adjustment
                 */

                type:
                  adjustmentType,

                quantity:
                  Number(
                    quantity
                  ),

                /*
                 * These represent the
                 * selected variant.
                 */

                previousStock:
                  Number(
                    previousStock
                  ),

                newStock:
                  Number(
                    newStock
                  ),

                /*
                 * These represent the
                 * whole product.
                 */

                previousProductStock:
                  Number(
                    previousProductStock
                  ),

                newProductStock:
                  calculatedProductStock,

                reason,

                createdAt:
                  new Date().toISOString(),
              }
            )
          ).unwrap();
        } else {
          /* ===============================================
             SIMPLE PRODUCT
          =============================================== */

          await dispatch(
            updateProductStockThunk(
              {
                id: product.id,

                stock:
                  Number(
                    newStock
                  ),
              }
            )
          ).unwrap();

          /* ===============================================
             SIMPLE PRODUCT AUDIT
          =============================================== */

          await dispatch(
            createInventoryAdjustmentThunk(
              {
                productId:
                  String(
                    product.id
                  ),

                productName:
                  product.name,

                productCategory:
                  product.category ||
                  "",

                /*
                 * Explicitly null because
                 * this is not a variant.
                 */

                variantId: null,
                variantLabel:
                  null,

                type:
                  adjustmentType,

                quantity:
                  Number(
                    quantity
                  ),

                previousStock:
                  Number(
                    previousStock
                  ),

                newStock:
                  Number(
                    newStock
                  ),

                /*
                 * For simple products,
                 * product stock and item
                 * stock are the same.
                 */

                previousProductStock:
                  Number(
                    previousStock
                  ),

                newProductStock:
                  Number(
                    newStock
                  ),

                reason,

                createdAt:
                  new Date().toISOString(),
              }
            )
          ).unwrap();
        }

        /* ===============================================
           STEP 3 — CLOSE DRAWER
        =============================================== */

        setSelectedProduct(
          null
        );
      } finally {
        setIsAdjustingStock(
          false
        );
      }
    };

  /* =====================================================
     REFRESH
  ===================================================== */

  const handleRefresh =
    () => {
      dispatch(
        fetchProducts()
      );

      dispatch(
        fetchInventoryAdjustments()
      );
    };

  /* =====================================================
     INITIAL LOADING
  ===================================================== */

  if (
    loading &&
    products.length === 0
  ) {
    return (
      <div
        className="
          flex
          min-h-[60vh]
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              h-9
              w-9
              animate-spin
              rounded-full
              border-4
              border-nexora-primary-soft
              border-t-nexora-primary
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-semibold
              text-nexora-muted
            "
          >
            Loading
            inventory...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="space-y-7">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section>
        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.22em]
                text-nexora-copper
              "
            >
              Stock Control
            </p>

            <h1
              className="
                mt-2
                text-3xl
                font-black
                tracking-tight
                text-nexora-text
              "
            >
              Inventory
              Management
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-nexora-muted
              "
            >
              Monitor product
              availability,
              identify low-stock
              products and manage
              simple and variant
              inventory from one
              place.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={
              loading ||
              historyLoading
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-nexora-border
              bg-nexora-surface
              px-4
              py-2.5
              text-sm
              font-bold
              text-nexora-text
              hover:border-nexora-primary
              hover:text-nexora-primary
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={`
                h-4
                w-4
                ${
                  loading ||
                  historyLoading
                    ? "animate-spin"
                    : ""
                }
              `}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 6v5h-5"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 18v-5h5"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.1 9a7 7 0 0 1 11.5-2.6L20 11"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.9 15a7 7 0 0 1-11.5 2.6L4 13"
              />
            </svg>

            {loading ||
            historyLoading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </section>

      {/* =================================================
          PRODUCT ERROR
      ================================================= */}

      {error && (
        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-5
            py-4
          "
        >
          <p
            className="
              text-sm
              font-bold
              text-red-700
            "
          >
            Inventory error
          </p>

          <p
            className="
              mt-1
              text-sm
              text-red-600
            "
          >
            {error}
          </p>
        </div>
      )}

      {/* =================================================
          HISTORY ERROR
      ================================================= */}

      {historyError && (
        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-5
            py-4
          "
        >
          <p
            className="
              text-sm
              font-bold
              text-red-700
            "
          >
            Adjustment history
            error
          </p>

          <p
            className="
              mt-1
              text-sm
              text-red-600
            "
          >
            {historyError}
          </p>
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <section
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatCard
          label="Total Products"
          value={
            inventoryStats.totalProducts
          }
          description="Products in catalogue"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
              <path d="m4 7.5 8 4.5 8-4.5" />
              <path d="M12 12v9" />
            </svg>
          }
        />

        <StatCard
          label="Units In Stock"
          value={
            inventoryStats.totalUnits
          }
          description="Total sellable units"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M4 6h16v14H4z" />
              <path d="M8 3h8l2 3H6l2-3Z" />
              <path d="M9 11h6" />
            </svg>
          }
        />

        <StatCard
          label="Low Stock"
          value={
            inventoryStats.lowStock
          }
          description={`1–${LOW_STOCK_LIMIT} total units remaining`}
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 3 2.5 20h19L12 3Z" />
              <path d="M12 9v5" />
              <path d="M12 17h.01" />
            </svg>
          }
        />

        <StatCard
          label="Out of Stock"
          value={
            inventoryStats.outOfStock
          }
          description="Products requiring restock"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <path d="m9 9 6 6" />
              <path d="m15 9-6 6" />
            </svg>
          }
        />
      </section>

      {/* =================================================
          INVENTORY TABLE
      ================================================= */}

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-nexora-border
          bg-nexora-surface
        "
      >
        {/* ================= FILTERS ================= */}

        <div
          className="
            border-b
            border-nexora-border
            p-5
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              xl:flex-row
              xl:items-center
              xl:justify-between
            "
          >
            <div>
              <h2
                className="
                  text-lg
                  font-black
                  text-nexora-text
                "
              >
                Product Inventory
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-nexora-muted
                "
              >
                Showing{" "}
                {
                  filteredProducts.length
                }{" "}
                of{" "}
                {products.length}{" "}
                products
              </p>
            </div>

            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:flex-wrap
              "
            >
              {/* SEARCH */}

              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-nexora-muted
                  "
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />

                  <path d="m20 20-3.5-3.5" />
                </svg>

                <input
                  type="search"
                  value={
                    search
                  }
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Search products or variants..."
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-nexora-border
                    bg-white
                    pl-9
                    pr-4
                    text-sm
                    text-nexora-text
                    outline-none
                    placeholder:text-nexora-muted/70
                    focus:border-nexora-primary
                    sm:w-64
                  "
                />
              </div>

              {/* CATEGORY */}

              <select
                value={
                  selectedCategory
                }
                onChange={(
                  event
                ) =>
                  setSelectedCategory(
                    event
                      .target
                      .value
                  )
                }
                className="
                  h-10
                  rounded-xl
                  border
                  border-nexora-border
                  bg-white
                  px-3
                  text-sm
                  font-semibold
                  text-nexora-text
                  outline-none
                  focus:border-nexora-primary
                "
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map(
                  (
                    category
                  ) => (
                    <option
                      key={
                        category
                      }
                      value={
                        category
                      }
                    >
                      {
                        category
                      }
                    </option>
                  )
                )}
              </select>

              {/* STOCK FILTER */}

              <select
                value={
                  stockFilter
                }
                onChange={(
                  event
                ) =>
                  setStockFilter(
                    event
                      .target
                      .value
                  )
                }
                className="
                  h-10
                  rounded-xl
                  border
                  border-nexora-border
                  bg-white
                  px-3
                  text-sm
                  font-semibold
                  text-nexora-text
                  outline-none
                  focus:border-nexora-primary
                "
              >
                <option value="all">
                  All Stock
                </option>

                <option value="in">
                  In Stock
                </option>

                <option value="low">
                  Low Stock
                </option>

                <option value="out">
                  Out of Stock
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* =================================================
            PRODUCTS
        ================================================= */}

        {filteredProducts.length >
        0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              {/* ================= TABLE HEADER ================= */}

              <thead className="bg-nexora-ivory">
                <tr
                  className="
                    border-b
                    border-nexora-border
                  "
                >
                  <th
                    className="
                      px-5
                      py-3.5
                      text-left
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-nexora-muted
                    "
                  >
                    Product
                  </th>

                  <th
                    className="
                      px-5
                      py-3.5
                      text-left
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-nexora-muted
                    "
                  >
                    Category
                  </th>

                  <th
                    className="
                      px-5
                      py-3.5
                      text-left
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-nexora-muted
                    "
                  >
                    Price
                  </th>

                  <th
                    className="
                      px-5
                      py-3.5
                      text-left
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-nexora-muted
                    "
                  >
                    Stock
                  </th>

                  <th
                    className="
                      px-5
                      py-3.5
                      text-left
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-nexora-muted
                    "
                  >
                    Status
                  </th>

                  <th
                    className="
                      px-5
                      py-3.5
                      text-right
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-nexora-muted
                    "
                  >
                    Action
                  </th>
                </tr>
              </thead>

              {/* ================= TABLE BODY ================= */}

              <tbody
                className="
                  divide-y
                  divide-nexora-border
                "
              >
                {filteredProducts.map(
                  (
                    product
                  ) => {
                    const stock =
                      Math.max(
                        Number(
                          product.stock
                        ) || 0,
                        0
                      );

                    const productHasVariants =
                      hasProductVariants(
                        product
                      );

                    return (
                      <tr
                        key={
                          product.id
                        }
                        className="
                          transition
                          hover:bg-nexora-ivory/70
                        "
                      >
                        {/* PRODUCT */}

                        <td
                          className="
                            px-5
                            py-4
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-3
                            "
                          >
                            <div
                              className="
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-xl
                                border
                                border-nexora-border
                                bg-white
                              "
                            >
                              {product.thumbnail ? (
                                <img
                                  src={
                                    product.thumbnail
                                  }
                                  alt={
                                    product.name
                                  }
                                  className="
                                    h-full
                                    w-full
                                    object-contain
                                    p-1
                                  "
                                />
                              ) : (
                                <span
                                  className="
                                    text-[9px]
                                    font-bold
                                    text-nexora-muted
                                  "
                                >
                                  NEXORA
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p
                                className="
                                  max-w-[260px]
                                  truncate
                                  text-sm
                                  font-bold
                                  text-nexora-text
                                "
                              >
                                {
                                  product.name
                                }
                              </p>

                              <div
                                className="
                                  mt-1
                                  flex
                                  flex-wrap
                                  items-center
                                  gap-2
                                "
                              >
                                <span
                                  className="
                                    text-xs
                                    text-nexora-muted
                                  "
                                >
                                  {product.brand ||
                                    "NEXORA"}
                                </span>

                                {productHasVariants && (
                                  <span
                                    className="
                                      rounded-full
                                      bg-nexora-primary-soft
                                      px-2
                                      py-0.5
                                      text-[9px]
                                      font-black
                                      uppercase
                                      tracking-wider
                                      text-nexora-primary
                                    "
                                  >
                                    {
                                      product
                                        .variants
                                        .length
                                    }{" "}
                                    Variants
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CATEGORY */}

                        <td
                          className="
                            px-5
                            py-4
                            text-sm
                            font-medium
                            text-nexora-muted
                          "
                        >
                          {product.category ||
                            "—"}
                        </td>

                        {/* PRICE */}

                        <td
                          className="
                            px-5
                            py-4
                            text-sm
                            font-bold
                            text-nexora-text
                          "
                        >
                          ₹
                          {Number(
                            product.price ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        {/* STOCK */}

                        <td
                          className="
                            px-5
                            py-4
                          "
                        >
                          <div>
                            <div
                              className="
                                flex
                                items-baseline
                                gap-1
                              "
                            >
                              <span
                                className={`
                                  text-lg
                                  font-black

                                  ${
                                    stock ===
                                    0
                                      ? "text-red-600"
                                      : stock <=
                                          LOW_STOCK_LIMIT
                                        ? "text-amber-600"
                                        : "text-nexora-text"
                                  }
                                `}
                              >
                                {
                                  stock
                                }
                              </span>

                              <span
                                className="
                                  text-[11px]
                                  font-medium
                                  text-nexora-muted
                                "
                              >
                                units
                              </span>
                            </div>

                            {productHasVariants && (
                              <p
                                className="
                                  mt-1
                                  text-[10px]
                                  font-semibold
                                  text-nexora-muted
                                "
                              >
                                Total across{" "}
                                {
                                  product
                                    .variants
                                    .length
                                }{" "}
                                configurations
                              </p>
                            )}
                          </div>
                        </td>

                        {/* STATUS */}

                        <td
                          className="
                            px-5
                            py-4
                          "
                        >
                          <StockBadge
                            stock={
                              stock
                            }
                          />
                        </td>

                        {/* ACTION */}

                        <td
                          className="
                            px-5
                            py-4
                            text-right
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenStockAdjustment(
                                product
                              )
                            }
                            className="
                              rounded-lg
                              border
                              border-nexora-primary
                              bg-white
                              px-3
                              py-2
                              text-xs
                              font-bold
                              text-nexora-primary
                              hover:bg-nexora-primary
                              hover:text-white
                            "
                          >
                            {productHasVariants
                              ? "Manage Variants"
                              : "Adjust Stock"}
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* =================================================
             EMPTY STATE
          ================================================= */

          <div
            className="
              flex
              min-h-[300px]
              items-center
              justify-center
              px-6
              py-12
            "
          >
            <div
              className="
                max-w-sm
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-nexora-primary-soft
                  text-nexora-primary
                "
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M4 6h16v14H4z" />
                  <path d="M8 3h8l2 3H6l2-3Z" />
                  <path d="M9 11h6" />
                </svg>
              </div>

              <h3
                className="
                  mt-4
                  text-base
                  font-black
                  text-nexora-text
                "
              >
                No products found
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-nexora-muted
                "
              >
                No inventory
                items match your
                current search or
                filters.
              </p>

              <button
                type="button"
                onClick={
                  handleResetFilters
                }
                className="
                  mt-5
                  rounded-xl
                  bg-nexora-primary
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  text-white
                  hover:bg-nexora-primary-hover
                "
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </section>

      {/* =================================================
          INVENTORY ADJUSTMENT HISTORY
      ================================================= */}

      <InventoryAdjustmentHistory
        adjustments={
          adjustments
        }
        loading={
          historyLoading
        }
      />

      {/* =================================================
          STOCK ADJUSTMENT DRAWER
      ================================================= */}

      <StockAdjustmentDrawer
        isOpen={Boolean(
          selectedProduct
        )}
        product={
          selectedProduct
        }
        isUpdating={
          isAdjustingStock
        }
        onConfirm={
          handleConfirmStockAdjustment
        }
        onClose={
          handleCloseStockAdjustment
        }
      />
    </div>
  );
};

export default AdminInventory;