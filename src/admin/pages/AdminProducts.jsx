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
  deleteProductThunk,
  fetchProducts,
} from "../../redux/slices/productSlice";

import ProductTable from "../components/products/ProductTable";
import ProductPagination from "../components/products/ProductPagination";
import ProductFormDrawer from "../components/products/ProductFormDrawer";
import DeleteProductModal from "../components/products/DeleteProductModal";

/* ================= CONSTANTS ================= */

const PRODUCTS_PER_PAGE = 8;

/* =====================================================
   COMPONENT
===================================================== */

const AdminProducts = () => {
  const dispatch = useDispatch();

  /* ================= REDUX ================= */

  const {
    items: products,
    loading,
    error,
  } = useSelector(
    (state) => state.products
  );

  /* ================= SEARCH / FILTER ================= */

  const [search, setSearch] =
    useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  /* ================= PRODUCT DRAWER ================= */

  const [
    isDrawerOpen,
    setIsDrawerOpen,
  ] = useState(false);

  const [
    editingProduct,
    setEditingProduct,
  ] = useState(null);

  /* ================= DELETE ================= */

  const [
    productToDelete,
    setProductToDelete,
  ] = useState(null);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  /* =====================================================
     PRODUCT STATISTICS
  ===================================================== */

  const totalProducts =
    products.length;

  const inStockProducts =
    products.filter(
      (product) =>
        Number(
          product.stock || 0
        ) > 5
    ).length;

  const lowStockProducts =
    products.filter(
      (product) => {
        const stock =
          Number(
            product.stock || 0
          );

        return (
          stock > 0 &&
          stock <= 5
        );
      }
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        Number(
          product.stock || 0
        ) === 0
    ).length;

  /* =====================================================
     CATEGORIES
  ===================================================== */

  const categories =
    useMemo(() => {
      return [
        ...new Set(
          products
            .map(
              (product) =>
                product.category
            )
            .filter(Boolean)
        ),
      ].sort();
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
          /* ---------- SEARCH ---------- */

          const matchesSearch =
            !normalizedSearch ||
            product.name
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            product.brand
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            product.category
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            String(
              product.id
            )
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          /* ---------- CATEGORY ---------- */

          const matchesCategory =
            categoryFilter ===
              "all" ||
            product.category ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      products,
      search,
      categoryFilter,
    ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredProducts.length /
          PRODUCTS_PER_PAGE
      )
    );

  const paginatedProducts =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        PRODUCTS_PER_PAGE;

      const endIndex =
        startIndex +
        PRODUCTS_PER_PAGE;

      return filteredProducts.slice(
        startIndex,
        endIndex
      );
    }, [
      filteredProducts,
      currentPage,
    ]);

  /* ================= RESET PAGE ================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    categoryFilter,
  ]);

  /* ================= PAGE SAFETY ================= */

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* =====================================================
     ADD PRODUCT
  ===================================================== */

  const handleAddProduct = () => {
    setEditingProduct(null);

    setIsDrawerOpen(true);
  };

  /* =====================================================
     EDIT PRODUCT
  ===================================================== */

  const handleEdit = (
    product
  ) => {
    setEditingProduct(
      product
    );

    setIsDrawerOpen(true);
  };

  /* =====================================================
     CLOSE DRAWER
  ===================================================== */

  const handleCloseDrawer =
    () => {
      setIsDrawerOpen(false);

      setEditingProduct(
        null
      );
    };

  /* =====================================================
     OPEN DELETE MODAL
  ===================================================== */

  const handleDeleteClick = (
    product
  ) => {
    setProductToDelete(
      product
    );

    setDeleteError("");
  };

  /* =====================================================
     CLOSE DELETE MODAL
  ===================================================== */

  const handleCloseDelete =
    () => {
      if (isDeleting) {
        return;
      }

      setProductToDelete(
        null
      );

      setDeleteError("");
    };

  /* =====================================================
     CONFIRM DELETE
  ===================================================== */

  const handleConfirmDelete =
    async () => {
      if (!productToDelete) {
        return;
      }

      try {
        setIsDeleting(true);

        setDeleteError("");

        await dispatch(
          deleteProductThunk(
            productToDelete.id
          )
        ).unwrap();

        setProductToDelete(
          null
        );
      } catch (error) {
        setDeleteError(
          typeof error ===
            "string"
            ? error
            : "Failed to delete product."
        );
      } finally {
        setIsDeleting(false);
      }
    };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[2rem]
          bg-nexora-primary
          px-6
          py-8
          text-white
          sm:px-8
          sm:py-10
        "
      >
        {/* ATMOSPHERE */}

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-24
            h-64
            w-64
            rounded-full
            bg-nexora-copper/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-28
            left-1/3
            h-56
            w-56
            rounded-full
            bg-white/5
            blur-3xl
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            gap-6
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          {/* TITLE */}

          <div>
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <span
                className="
                  h-px
                  w-8
                  bg-nexora-taupe
                "
              />

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.28em]
                  text-nexora-taupe-soft
                "
              >
                NEXORA / CATALOG
              </p>
            </div>

            <h1
              className="
                mt-5
                text-3xl
                font-black
                tracking-[-0.035em]
                text-white
                sm:text-4xl
              "
            >
              Products
            </h1>

            <p
              className="
                mt-3
                max-w-xl
                text-sm
                leading-6
                text-white/60
              "
            >
              Manage products,
              inventory, pricing
              and catalog
              availability.
            </p>
          </div>

          {/* ADD PRODUCT */}

          <button
            type="button"
            onClick={
              handleAddProduct
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-nexora-surface
              px-5
              py-3
              text-sm
              font-bold
              text-nexora-primary
              shadow-sm
              hover:bg-nexora-ivory
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>

            Add Product
          </button>
        </div>
      </section>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <ProductStatCard
          label="Total Products"
          value={totalProducts}
          description="Products in catalog"
        />

        <ProductStatCard
          label="In Stock"
          value={
            inStockProducts
          }
          description="More than 5 units"
          type="success"
        />

        <ProductStatCard
          label="Low Stock"
          value={
            lowStockProducts
          }
          description="5 or fewer units"
          type="warning"
        />

        <ProductStatCard
          label="Out of Stock"
          value={
            outOfStockProducts
          }
          description="Requires restocking"
          type="danger"
        />
      </section>

      {/* =================================================
          CONTROLS
      ================================================= */}

      <section
        className="
          rounded-2xl
          border
          border-nexora-border
          bg-nexora-surface
          p-4
          sm:p-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* SEARCH */}

          <div
            className="
              relative
              w-full
              lg:max-w-md
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="
                pointer-events-none
                absolute
                left-4
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
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products..."
              className="
                w-full
                rounded-xl
                border
                border-nexora-border
                bg-nexora-ivory
                py-3
                pl-11
                pr-4
                text-sm
                text-nexora-text
                outline-none
                placeholder:text-nexora-muted
                focus:border-nexora-primary/40
                focus:ring-2
                focus:ring-nexora-primary/10
              "
            />
          </div>

          {/* CATEGORY FILTER */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <label
              htmlFor="admin-category-filter"
              className="
                hidden
                text-xs
                font-semibold
                text-nexora-muted
                sm:block
              "
            >
              Category
            </label>

            <select
              id="admin-category-filter"
              value={
                categoryFilter
              }
              onChange={(event) =>
                setCategoryFilter(
                  event.target
                    .value
                )
              }
              className="
                min-w-44
                rounded-xl
                border
                border-nexora-border
                bg-nexora-ivory
                px-4
                py-3
                text-sm
                font-medium
                text-nexora-text
                outline-none
                focus:border-nexora-primary/40
                focus:ring-2
                focus:ring-nexora-primary/10
              "
            >
              <option value="all">
                All categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* RESULTS */}

        <div
          className="
            mt-4
            border-t
            border-nexora-border
            pt-4
          "
        >
          <p
            className="
              text-xs
              text-nexora-muted
            "
          >
            Showing{" "}
            <span
              className="
                font-bold
                text-nexora-text
              "
            >
              {
                filteredProducts.length
              }
            </span>{" "}
            of{" "}
            <span
              className="
                font-bold
                text-nexora-text
              "
            >
              {products.length}
            </span>{" "}
            products
          </p>
        </div>
      </section>

      {/* =================================================
          ERROR
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
              font-semibold
              text-red-700
            "
          >
            Something went wrong
            while loading products.
          </p>

          <p
            className="
              mt-1
              text-xs
              text-red-600
            "
          >
            {String(error)}
          </p>
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading &&
      products.length === 0 ? (
        <div
          className="
            flex
            min-h-80
            items-center
            justify-center
            rounded-2xl
            border
            border-nexora-border
            bg-nexora-surface
          "
        >
          <div className="text-center">
            <div
              className="
                mx-auto
                h-8
                w-8
                animate-spin
                rounded-full
                border-2
                border-nexora-primary/20
                border-t-nexora-primary
              "
            />

            <p
              className="
                mt-4
                text-sm
                font-medium
                text-nexora-muted
              "
            >
              Loading products...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* =============================================
              PRODUCT TABLE
          ============================================= */}

          <ProductTable
            products={
              paginatedProducts
            }
            onEdit={
              handleEdit
            }
            onDelete={
              handleDeleteClick
            }
          />

          {/* =============================================
              PAGINATION
          ============================================= */}

          {filteredProducts.length >
            PRODUCTS_PER_PAGE && (
            <ProductPagination
              currentPage={
                currentPage
              }
              totalPages={
                totalPages
              }
              onPageChange={
                setCurrentPage
              }
            />
          )}
        </>
      )}

      {/* =================================================
          ADD / EDIT DRAWER
      ================================================= */}

      <ProductFormDrawer
        isOpen={
          isDrawerOpen
        }
        product={
          editingProduct
        }
        onClose={
          handleCloseDrawer
        }
      />

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      <DeleteProductModal
        product={
          productToDelete
        }
        isOpen={Boolean(
          productToDelete
        )}
        isDeleting={
          isDeleting
        }
        error={
          deleteError
        }
        onConfirm={
          handleConfirmDelete
        }
        onClose={
          handleCloseDelete
        }
      />

    </div>
  );
};

/* =====================================================
   PRODUCT STAT CARD
===================================================== */

const ProductStatCard = ({
  label,
  value,
  description,
  type = "default",
}) => {
  const styles = {
    default: {
      icon:
        "bg-nexora-primary-soft text-nexora-primary",

      value:
        "text-nexora-primary",
    },

    success: {
      icon:
        "bg-emerald-50 text-emerald-700",

      value:
        "text-emerald-700",
    },

    warning: {
      icon:
        "bg-amber-50 text-amber-700",

      value:
        "text-amber-700",
    },

    danger: {
      icon:
        "bg-red-50 text-red-700",

      value:
        "text-red-700",
    },
  };

  const style =
    styles[type] ||
    styles.default;

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
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-xs
              font-semibold
              text-nexora-muted
            "
          >
            {label}
          </p>

          <p
            className={`
              mt-3
              text-3xl
              font-black
              tracking-tight

              ${style.value}
            `}
          >
            {value}
          </p>

          <p
            className="
              mt-2
              text-[11px]
              text-nexora-muted
            "
          >
            {description}
          </p>
        </div>

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl

            ${style.icon}
          `}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />

            <path d="m4 7.5 8 4.5 8-4.5" />

            <path d="M12 12v9" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;