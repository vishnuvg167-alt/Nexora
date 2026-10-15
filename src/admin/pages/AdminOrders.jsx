import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAllOrders,
  updateOrderStatusThunk,
  updatePaymentStatusThunk,
} from "../../redux/slices/orderSlice";

import { createNotificationThunk } from "../../redux/slices/notificationSlice";

import OrderTable from "../components/orders/OrderTable";
import OrderPagination from "../components/orders/OrderPagination";
import OrderDetailsDrawer from "../components/orders/OrderDetailsDrawer";

/* ================= CONSTANTS ================= */

const ORDERS_PER_PAGE = 8;

/* =====================================================
   ORDER NOTIFICATION CONTENT
===================================================== */

const getOrderNotificationContent = (status, orderId) => {
  const normalizedStatus = String(status || "").toLowerCase();
  const shortOrderId = String(orderId).slice(-8).toUpperCase();

  const notifications = {
    processing: {
      title: "Order is being processed",
      message: `Your order #${shortOrderId} is now being prepared.`,
    },

    shipped: {
      title: "Your order has shipped",
      message: `Your order #${shortOrderId} has been shipped and is on the way.`,
    },

    delivered: {
      title: "Order delivered",
      message: `Your order #${shortOrderId} has been delivered successfully.`,
    },

    cancelled: {
      title: "Order cancelled",
      message: `Your order #${shortOrderId} has been cancelled.`,
    },
  };

  return notifications[normalizedStatus] || null;
};

/* =====================================================
   COMPONENT
===================================================== */

const AdminOrders = () => {
  const dispatch = useDispatch();

  /* ================= REDUX ================= */

  const {
    items: orders,
    loading,
    error,
    updatingOrderId,
    updatingPaymentOrderId,
  } = useSelector((state) => state.orders);

  /* ================= LOCAL STATE ================= */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  /* ================= SELECTED ORDER ================= */

  const selectedOrder =
    orders.find(
      (order) => String(order.id) === String(selectedOrderId)
    ) || null;

  /* ================= FETCH ORDERS ================= */

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalOrders = orders.length;

  const placedOrders = orders.filter(
    (order) =>
      (order.status || "placed").toLowerCase() === "placed"
  ).length;

  const paidOrders = orders.filter(
    (order) =>
      (order.paymentStatus || "").toLowerCase() === "paid"
  ).length;

  const codOrders = orders.filter(
    (order) =>
      (order.paymentMethod || "").toLowerCase() === "cod"
  ).length;

  const totalOrderValue = orders.reduce((total, order) => {
    const status = (order.status || "placed").toLowerCase();

    if (status === "cancelled") {
      return total;
    }

    return total + Number(order.total || 0);
  }, 0);

  /* =====================================================
     FILTER ORDERS
  ===================================================== */

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName = order.shippingAddress?.name || "";
      const customerEmail = order.shippingAddress?.email || "";
      const customerPhone = order.shippingAddress?.phone || "";

      /* ================= SEARCH ================= */

      const matchesSearch =
        !normalizedSearch ||
        String(order.id).toLowerCase().includes(normalizedSearch) ||
        String(order.userId || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        customerName.toLowerCase().includes(normalizedSearch) ||
        customerEmail.toLowerCase().includes(normalizedSearch) ||
        customerPhone.toLowerCase().includes(normalizedSearch);

      /* ================= ORDER STATUS ================= */

      const orderStatus = (
        order.status || "placed"
      ).toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        orderStatus === statusFilter;

      /* ================= PAYMENT STATUS ================= */

      const paymentStatus = (
        order.paymentStatus || "unknown"
      ).toLowerCase();

      const matchesPayment =
        paymentFilter === "all" ||
        paymentStatus === paymentFilter;

      /* ================= PAYMENT METHOD ================= */

      const paymentMethod = (
        order.paymentMethod || "unknown"
      ).toLowerCase();

      const matchesPaymentMethod =
        paymentMethodFilter === "all" ||
        paymentMethod === paymentMethodFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesPaymentMethod
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
    paymentMethodFilter,
  ]);

  /* =====================================================
     SORT ORDERS
  ===================================================== */

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      return dateB - dateA;
    });
  }, [filteredOrders]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.ceil(
    sortedOrders.length / ORDERS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * ORDERS_PER_PAGE;

  const paginatedOrders = sortedOrders.slice(
    startIndex,
    startIndex + ORDERS_PER_PAGE
  );

  /* ================= RESET PAGE ================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    paymentFilter,
    paymentMethodFilter,
  ]);

  /* ================= KEEP PAGE VALID ================= */

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* =====================================================
     VIEW ORDER
  ===================================================== */

  const handleViewOrder = (order) => {
    setSelectedOrderId(order.id);
  };

  /* =====================================================
     CLOSE ORDER
  ===================================================== */

  const handleCloseOrder = () => {
    setSelectedOrderId(null);
  };

  /* =====================================================
     UPDATE ORDER STATUS
  ===================================================== */

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const currentOrder = orders.find(
        (order) => String(order.id) === String(orderId)
      );

      if (!currentOrder) {
        throw new Error("Order not found.");
      }

      const normalizedStatus = String(status || "")
        .trim()
        .toLowerCase();

      if (!normalizedStatus) {
        throw new Error("Order status is required.");
      }

      /* ================= UPDATE ORDER ================= */

      /*
       * updateOrderStatusThunk is responsible for creating
       * deliveredAt when normalizedStatus === "delivered".
       */

      const updatedOrder = await dispatch(
        updateOrderStatusThunk({
          orderId,
          status: normalizedStatus,
        })
      ).unwrap();

      /* ================= CREATE NOTIFICATION ================= */

      const notificationContent =
        getOrderNotificationContent(
          normalizedStatus,
          orderId
        );

      if (
        notificationContent &&
        currentOrder.userId
      ) {
        try {
          await dispatch(
            createNotificationThunk({
              userId: String(currentOrder.userId),
              type: "order",
              title: notificationContent.title,
              message: notificationContent.message,
              referenceId: String(orderId),
              referenceType: "order",
              isRead: false,
              createdAt: new Date().toISOString(),
            })
          ).unwrap();
        } catch (notificationError) {
          /*
           * Notification failure should not undo
           * a successful order status update.
           */

          console.error(
            "Order updated, but notification creation failed:",
            notificationError
          );
        }
      }

      return updatedOrder;
    } catch (error) {
      console.error(
        "Failed to update order status:",
        error
      );

      throw error;
    }
  };

  /* =====================================================
     UPDATE PAYMENT STATUS
  ===================================================== */

  const handleUpdatePaymentStatus = async (
    orderId,
    paymentStatus
  ) => {
    try {
      return await dispatch(
        updatePaymentStatusThunk({
          orderId,
          paymentStatus,
        })
      ).unwrap();
    } catch (error) {
      console.error(
        "Failed to update payment status:",
        error
      );

      throw error;
    }
  };

  /* =====================================================
     FILTER STATE
  ===================================================== */

  const hasFilters =
    Boolean(search.trim()) ||
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    paymentMethodFilter !== "all";

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-nexora-taupe">
            Order Management
          </p>

          <h1 className="text-3xl font-bold tracking-[-0.04em] text-nexora-text sm:text-4xl">
            Orders
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-nexora-muted">
            View customer orders, payment methods, payment status and
            fulfilment progress.
          </p>
        </div>
      </section>

      {/* ================= STATS ================= */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total Orders"
          value={totalOrders}
          type="total"
        />

        <StatCard
          label="Placed Orders"
          value={placedOrders}
          type="placed"
        />

        <StatCard
          label="Paid Orders"
          value={paidOrders}
          type="paid"
        />

        <StatCard
          label="COD Orders"
          value={codOrders}
          type="cod"
        />

        <StatCard
          label="Order Value"
          value={`₹${totalOrderValue.toLocaleString("en-IN")}`}
          type="revenue"
        />
      </section>

      {/* ================= ORDERS PANEL ================= */}

      <section className="overflow-hidden rounded-[1.75rem] border border-nexora-border bg-nexora-surface shadow-sm">
        {/* ================= TOOLBAR ================= */}

        <div className="flex flex-col gap-4 border-b border-nexora-border p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-nexora-text">
              Order Directory
            </h2>

            <p className="mt-1 text-sm text-nexora-muted">
              {sortedOrders.length}{" "}
              {sortedOrders.length === 1
                ? "order"
                : "orders"}{" "}
              found
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap xl:w-auto xl:flex-nowrap">
            {/* ================= SEARCH ================= */}

            <div className="relative w-full sm:w-64">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-nexora-taupe"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search orders..."
                className="h-11 w-full rounded-xl border border-nexora-border bg-nexora-ivory pl-11 pr-4 text-sm text-nexora-text outline-none placeholder:text-nexora-muted focus:border-nexora-primary focus:ring-2 focus:ring-nexora-primary/10"
              />
            </div>

            {/* ================= ORDER STATUS ================= */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-nexora-border bg-nexora-ivory px-4 text-sm font-medium text-nexora-text outline-none focus:border-nexora-primary"
            >
              <option value="all">All Status</option>
              <option value="placed">Placed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* ================= PAYMENT STATUS ================= */}

            <select
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-nexora-border bg-nexora-ivory px-4 text-sm font-medium text-nexora-text outline-none focus:border-nexora-primary"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="unknown">Unknown</option>
            </select>

            {/* ================= PAYMENT METHOD ================= */}

            <select
              value={paymentMethodFilter}
              onChange={(event) =>
                setPaymentMethodFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-nexora-border bg-nexora-ivory px-4 text-sm font-medium text-nexora-text outline-none focus:border-nexora-primary"
            >
              <option value="all">All Methods</option>
              <option value="razorpay">Razorpay</option>
              <option value="cod">
                Cash on Delivery
              </option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>

        {/* ================= CONTENT ================= */}

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            error={error}
            onRetry={() =>
              dispatch(fetchAllOrders())
            }
          />
        ) : sortedOrders.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
          />
        ) : (
          <>
            <OrderTable
              orders={paginatedOrders}
              onViewOrder={handleViewOrder}
            />

            <OrderPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>

      {/* ================= ORDER DETAILS DRAWER ================= */}

      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        isUpdating={
          String(updatingOrderId) ===
          String(selectedOrder?.id)
        }
        isUpdatingPayment={
          String(updatingPaymentOrderId) ===
          String(selectedOrder?.id)
        }
        onUpdateStatus={handleUpdateStatus}
        onUpdatePaymentStatus={
          handleUpdatePaymentStatus
        }
        onClose={handleCloseOrder}
      />
    </div>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({
  label,
  value,
  type,
}) => {
  const styles = {
    total: {
      wrapper:
        "bg-nexora-primary-soft",
      value:
        "text-nexora-primary",
    },

    placed: {
      wrapper:
        "bg-amber-50",
      value:
        "text-amber-700",
    },

    paid: {
      wrapper:
        "bg-emerald-50",
      value:
        "text-emerald-700",
    },

    cod: {
      wrapper:
        "bg-nexora-taupe-soft",
      value:
        "text-nexora-text",
    },

    revenue: {
      wrapper:
        "bg-nexora-copper-soft",
      value:
        "text-nexora-copper",
    },
  };

  const currentStyle =
    styles[type] ||
    styles.total;

  return (
    <article className="rounded-2xl border border-nexora-border bg-nexora-surface p-5 shadow-sm">
      <div
        className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${currentStyle.wrapper}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
          className={`h-5 w-5 ${currentStyle.value}`}
        >
          <path d="M6 2h12l3 5v15H3V7l3-5Z" />
          <path d="M3 7h18" />
          <path d="M9 11a3 3 0 0 0 6 0" />
        </svg>
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-nexora-taupe">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold tracking-[-0.04em] ${currentStyle.value}`}
      >
        {value}
      </p>
    </article>
  );
};

/* =====================================================
   LOADING
===================================================== */

const LoadingState = () => {
  return (
    <div className="flex min-h-64 items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexora-primary-soft border-t-nexora-primary" />

        <p className="text-sm text-nexora-muted">
          Loading orders...
        </p>
      </div>
    </div>
  );
};

/* =====================================================
   ERROR
===================================================== */

const ErrorState = ({
  error,
  onRetry,
}) => {
  return (
    <div className="flex min-h-64 items-center justify-center p-6">
      <div className="text-center">
        <p className="font-semibold text-red-700">
          Unable to load orders
        </p>

        <p className="mt-2 text-sm text-nexora-muted">
          {error}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-nexora-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-nexora-primary-hover"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

/* =====================================================
   EMPTY
===================================================== */

const EmptyState = ({
  hasFilters,
}) => {
  return (
    <div className="flex min-h-64 items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-nexora-primary-soft text-nexora-primary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M6 2h12l3 5v15H3V7l3-5Z" />
            <path d="M3 7h18" />
          </svg>
        </div>

        <h3 className="mt-4 font-semibold text-nexora-text">
          {hasFilters
            ? "No orders found"
            : "No orders yet"}
        </h3>

        <p className="mt-1 text-sm text-nexora-muted">
          {hasFilters
            ? "Try changing your search or filters."
            : "Customer orders will appear here."}
        </p>
      </div>
    </div>
  );
};

export default AdminOrders;