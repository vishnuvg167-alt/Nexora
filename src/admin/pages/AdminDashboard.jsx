import {
  useEffect,
  useMemo,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchProducts,
} from "../../redux/slices/productSlice";

import {
  fetchAllOrders,
} from "../../redux/slices/orderSlice";

import {
  fetchAdminUsers,
} from "../../redux/slices/adminUserSlice";

/* ================= PRODUCT IMAGES ================= */

import productImages from "../../constants/productImages";

/* ================= DASHBOARD COMPONENTS ================= */

import DashboardStats from "../components/dashboard/DashboardStats";

import RevenueChart from "../components/dashboard/RevenueChart";

import OrderStatusChart from "../components/dashboard/OrderStatusChart";

import ProductCategoryChart from "../components/dashboard/ProductCategoryChart";

import RecentOrders from "../components/dashboard/RecentOrders";

/* ================= CONSTANTS ================= */

const LOW_STOCK_LIMIT = 5;

/* =====================================================
   COMPONENT
===================================================== */

const AdminDashboard = () => {
  const dispatch = useDispatch();

  /* ================= PRODUCTS ================= */

  const {
    items: products,
    loading: productsLoading,
    error: productsError,
  } = useSelector(
    (state) => state.products
  );

  /* ================= ORDERS ================= */

  const {
    items: orders,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector(
    (state) => state.orders
  );

  /* ================= USERS ================= */

  const {
    items: users,
    loading: usersLoading,
    error: usersError,
  } = useSelector(
    (state) => state.adminUsers
  );

  /* =====================================================
     FETCH DASHBOARD DATA
  ===================================================== */

  useEffect(() => {
    dispatch(
      fetchProducts()
    );

    dispatch(
      fetchAllOrders()
    );

    dispatch(
      fetchAdminUsers()
    );
  }, [dispatch]);

  /* ================= LOADING ================= */

  const loading =
    productsLoading ||
    ordersLoading ||
    usersLoading;

  /* ================= ERROR ================= */

  const error =
    productsError ||
    ordersError ||
    usersError;

  /* =====================================================
     DASHBOARD CALCULATIONS
  ===================================================== */

  const dashboardData =
    useMemo(() => {
      /* ================= TOTAL PRODUCTS ================= */

      const totalProducts =
        products.length;

      /* ================= TOTAL USERS ================= */

      const totalUsers =
        users.length;

      /* ================= TOTAL ORDERS ================= */

      const totalOrders =
        orders.length;

      /* ================= TOTAL REVENUE ================= */

      /*
        Cancelled orders should not
        contribute to store revenue.
      */

      const totalRevenue =
        orders.reduce(
          (
            total,
            order
          ) => {
            if (
              order.status ===
              "cancelled"
            ) {
              return total;
            }

            return (
              total +
              Number(
                order.total ||
                  0
              )
            );
          },
          0
        );

      /* ================= ORDER STATUS ================= */

      const orderStatusCounts =
        {
          placed: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        };

      orders.forEach(
        (order) => {
          const status =
            order.status ||
            "placed";

          if (
            Object.prototype.hasOwnProperty.call(
              orderStatusCounts,
              status
            )
          ) {
            orderStatusCounts[
              status
            ] += 1;
          }
        }
      );

      /* ================= LOW STOCK ================= */

      const lowStockProducts =
        products
          .filter(
            (product) => {
              const stock =
                Number(
                  product.stock ||
                    0
                );

              return (
                stock <=
                LOW_STOCK_LIMIT
              );
            }
          )
          .sort(
            (a, b) =>
              Number(
                a.stock ||
                  0
              ) -
              Number(
                b.stock ||
                  0
              )
          );

      /* ================= RECENT ORDERS ================= */

      const recentOrders = [
        ...orders,
      ]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt ||
                0
            ) -
            new Date(
              a.createdAt ||
                0
            )
        )
        .slice(0, 5);

      return {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        orderStatusCounts,
        lowStockProducts,
        recentOrders,
      };
    }, [
      products,
      users,
      orders,
    ]);

  /* =====================================================
     INITIAL LOADING
  ===================================================== */

  const isInitialLoading =
    loading &&
    products.length === 0 &&
    orders.length === 0 &&
    users.length === 0;

  if (isInitialLoading) {
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
            Loading dashboard...
          </p>

        </div>
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-8">

      {/* =================================================
          DASHBOARD HERO
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
        {/* DECORATION */}

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

        {/* CONTENT */}

        <div className="relative">

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
              NEXORA / ADMIN
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
            Dashboard
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
            Monitor your store,
            customers, orders,
            inventory and overall
            performance from one
            place.
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
            Some dashboard data
            could not be loaded.
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
          STATISTICS
      ================================================= */}

      <DashboardStats
        totalProducts={
          dashboardData.totalProducts
        }
        totalUsers={
          dashboardData.totalUsers
        }
        totalOrders={
          dashboardData.totalOrders
        }
        totalRevenue={
          dashboardData.totalRevenue
        }
      />

      {/* =================================================
          REVENUE GRAPH
      ================================================= */}

      <RevenueChart
        orders={orders}
      />

      {/* =================================================
          DONUT + PIE CHARTS
      ================================================= */}

      <div
        className="
          grid
          gap-6
          xl:grid-cols-2
        "
      >
        {/* ORDER STATUS */}

        <OrderStatusChart
          counts={
            dashboardData.orderStatusCounts
          }
        />

        {/* PRODUCT CATEGORIES */}

        <ProductCategoryChart
          products={products}
        />

      </div>

      {/* =================================================
          LOW STOCK PRODUCTS
      ================================================= */}

      <LowStockProducts
        products={
          dashboardData.lowStockProducts
        }
      />

      {/* =================================================
          RECENT ORDERS
      ================================================= */}

      <RecentOrders
        orders={
          dashboardData.recentOrders
        }
      />

    </div>
  );
};

/* =====================================================
   LOW STOCK PRODUCTS
===================================================== */

const LowStockProducts = ({
  products,
}) => {
  const visibleProducts =
    products.slice(0, 5);

  return (
    <section
      className="
        rounded-2xl
        border
        border-nexora-border
        bg-nexora-surface
        p-6
      "
    >
      {/* ================= HEADER ================= */}

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
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-nexora-taupe
            "
          >
            Inventory
          </p>

          <h2
            className="
              mt-2
              text-lg
              font-bold
              text-nexora-text
            "
          >
            Low Stock
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-nexora-muted
            "
          >
            Products with{" "}
            {LOW_STOCK_LIMIT} or
            fewer units remaining.
          </p>

        </div>

        {/* ================= COUNT ================= */}

        {products.length > 0 && (
          <span
            className="
              rounded-full
              bg-amber-50
              px-3
              py-1
              text-xs
              font-bold
              text-amber-700
            "
          >
            {products.length}
          </span>
        )}

      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {visibleProducts.length ===
      0 ? (
        <div
          className="
            mt-6
            flex
            min-h-44
            items-center
            justify-center
            rounded-xl
            bg-nexora-ivory
            p-6
            text-center
          "
        >
          <div>

            <div
              className="
                mx-auto
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-emerald-50
                text-emerald-700
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </div>

            <p
              className="
                mt-3
                text-sm
                font-semibold
                text-nexora-text
              "
            >
              Inventory looks
              healthy
            </p>

            <p
              className="
                mt-1
                text-xs
                text-nexora-muted
              "
            >
              No products are
              currently low in
              stock.
            </p>

          </div>
        </div>
      ) : (
        /* =================================================
           PRODUCT LIST
        ================================================= */

        <div
          className="
            mt-6
            divide-y
            divide-nexora-border
          "
        >
          {visibleProducts.map(
            (product) => {
              /* ================= STOCK ================= */

              const stock =
                Number(
                  product.stock ||
                    0
                );

              /* ================= IMAGE ================= */

              const productImage =
                productImages[
                  String(
                    product.id
                  )
                ] ||
                product.thumbnail ||
                "";

              return (
                <div
                  key={
                    product.id
                  }
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    py-4
                    first:pt-0
                    last:pb-0
                  "
                >
                  {/* ================= PRODUCT ================= */}

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-4
                    "
                  >
                    {/* PRODUCT IMAGE */}

                    <div
                      className="
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-xl
                        border
                        border-nexora-border
                        bg-nexora-ivory
                      "
                    >
                      {productImage ? (
                        <img
                          src={
                            productImage
                          }
                          alt={
                            product.name ||
                            "Product"
                          }
                          className="
                            h-full
                            w-full
                            object-contain
                            p-1.5
                          "
                        />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          className="
                            h-5
                            w-5
                            text-nexora-taupe
                          "
                          aria-hidden="true"
                        >
                          <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />

                          <path d="m4 7.5 8 4.5 8-4.5" />

                          <path d="M12 12v9" />
                        </svg>
                      )}
                    </div>

                    {/* PRODUCT DETAILS */}

                    <div className="min-w-0">

                      <p
                        className="
                          truncate
                          text-sm
                          font-bold
                          text-nexora-text
                        "
                      >
                        {product.name ||
                          "Product"}
                      </p>

                      <div
                        className="
                          mt-1
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <p
                          className="
                            text-xs
                            text-nexora-muted
                          "
                        >
                          {product.category ||
                            "Uncategorized"}
                        </p>

                        {product.brand && (
                          <>
                            <span
                              className="
                                h-1
                                w-1
                                rounded-full
                                bg-nexora-taupe
                              "
                            />

                            <p
                              className="
                                text-xs
                                text-nexora-muted
                              "
                            >
                              {
                                product.brand
                              }
                            </p>
                          </>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* ================= STOCK BADGE ================= */}

                  <span
                    className={`
                      shrink-0
                      rounded-full
                      px-3
                      py-1.5
                      text-xs
                      font-bold

                      ${
                        stock === 0
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }
                    `}
                  >
                    {stock === 0
                      ? "Out of stock"
                      : `${stock} left`}
                  </span>

                </div>
              );
            }
          )}
        </div>
      )}

    </section>
  );
};

export default AdminDashboard;