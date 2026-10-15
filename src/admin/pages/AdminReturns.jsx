import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAllReturns,
  updateReturnStatusThunk,
  completeReturnInspectionThunk,
  editReturnInspectionThunk,
  startRefundThunk,
  completeRefundThunk,
} from "../../redux/slices/returnSlice";

import { fetchAllOrders } from "../../redux/slices/orderSlice";

import {
  createNotificationThunk,
} from "../../redux/slices/notificationSlice";

import ReturnDetailsDrawer from "../components/returns/ReturnDetailsDrawer";
import ReturnInspectionDrawer from "../components/returns/ReturnInspectionDrawer";
import RefundAmountChart from "../components/returns/RefundAmountChart";

/* =====================================================
   RETURN NOTIFICATION CONTENT
===================================================== */

const getReturnNotificationContent = (event, returnRequest) => {
  const shortReturnId = String(returnRequest?.id || "")
    .slice(-8)
    .toUpperCase();

  const notifications = {
    approved: {
      type: "return",
      title: "Return approved",
      message: `Your return request #${shortReturnId} has been approved.`,
    },

    rejected: {
      type: "return",
      title: "Return request rejected",
      message: `Your return request #${shortReturnId} was not approved.`,
    },

    received: {
      type: "return",
      title: "Returned items received",
      message: `We have received the items for return #${shortReturnId}.`,
    },

    inspection_completed: {
      type: "return",
      title: "Return inspection completed",
      message: `Inspection for return #${shortReturnId} has been completed.`,
    },

    refund_started: {
      type: "refund",
      title: "Refund processing started",
      message: `Your refund for return #${shortReturnId} is now being processed.`,
    },

    refund_completed: {
      type: "refund",
      title: "Refund completed",
      message: `Your refund for return #${shortReturnId} has been completed.`,
    },
  };

  return notifications[event] || null;
};

/* =====================================================
   COMPONENT
===================================================== */

const AdminReturns = () => {
  const dispatch = useDispatch();

  /* =====================================================
     REDUX
  ===================================================== */

  const {
    items: returnItems,
    loading,
    error,
    updatingReturnId,
    updatingRefundId,
    inspectingReturnId,
    editingInspectionId,
  } = useSelector((state) => state.returns);

  const { items: orders } = useSelector((state) => state.orders);

  const safeReturns = Array.isArray(returnItems) ? returnItems : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  /* =====================================================
     LOCAL STATE
  ===================================================== */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReturnId, setSelectedReturnId] = useState(null);
  const [inspectionReturnId, setInspectionReturnId] = useState(null);
  const [inspectionMode, setInspectionMode] = useState("create");

  /* =====================================================
     FETCH
  ===================================================== */

  useEffect(() => {
    dispatch(fetchAllReturns());
    dispatch(fetchAllOrders());
  }, [dispatch]);

  /* =====================================================
     SELECTED RETURN
  ===================================================== */

  const selectedReturn =
    safeReturns.find(
      (returnRequest) =>
        String(returnRequest.id) === String(selectedReturnId)
    ) || null;

  const selectedOrder = selectedReturn
    ? safeOrders.find(
        (order) =>
          String(order.id) === String(selectedReturn.orderId)
      ) || null
    : null;

  /* =====================================================
     SELECTED RETURN BUSY STATE
  ===================================================== */

  const isSelectedReturnUpdating =
    Boolean(selectedReturn) &&
    String(updatingReturnId) === String(selectedReturn.id);

  const isSelectedReturnInspecting =
    Boolean(selectedReturn) &&
    String(inspectingReturnId) === String(selectedReturn.id);

  const isSelectedInspectionEditing =
    Boolean(selectedReturn) &&
    String(editingInspectionId) === String(selectedReturn.id);

  const isSelectedRefundUpdating =
    Boolean(selectedReturn) &&
    String(updatingRefundId) === String(selectedReturn.id);

  const isSelectedReturnBusy =
    isSelectedReturnUpdating ||
    isSelectedReturnInspecting ||
    isSelectedInspectionEditing ||
    isSelectedRefundUpdating;

  /* =====================================================
     INSPECTION RETURN
  ===================================================== */

  const inspectionReturn =
    safeReturns.find(
      (returnRequest) =>
        String(returnRequest.id) === String(inspectionReturnId)
    ) || null;

  const isCreatingInspection =
    Boolean(inspectionReturn) &&
    String(inspectingReturnId) === String(inspectionReturn.id);

  const isEditingInspection =
    Boolean(inspectionReturn) &&
    String(editingInspectionId) === String(inspectionReturn.id);

  const isInspectionSubmitting =
    isCreatingInspection || isEditingInspection;

  /* =====================================================
     SORT + FILTER
  ===================================================== */

  const filteredReturns = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...safeReturns]
      .sort((a, b) => {
        const dateA = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const dateB = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return dateB - dateA;
      })
      .filter((returnRequest) => {
        const status = (
          returnRequest.status || "requested"
        ).toLowerCase();

        const matchesStatus =
          statusFilter === "all" || status === statusFilter;

        const relatedOrder = safeOrders.find(
          (order) =>
            String(order.id) === String(returnRequest.orderId)
        );

        /*
         * Search also includes variant information so
         * the admin can search for values such as:
         *
         * 32GB / 1TB
         * 1-32-1tb
         * RAM
         * Storage
         */

        const returnItemSearchValues = Array.isArray(
          returnRequest.items
        )
          ? returnRequest.items.flatMap((item) => [
              item.name,
              item.brand,
              item.variantId,
              item.variantLabel,

              ...(item.variantAttributes &&
              typeof item.variantAttributes === "object"
                ? Object.entries(item.variantAttributes).flatMap(
                    ([key, value]) => [key, value]
                  )
                : []),
            ])
          : [];

        const searchableText = [
          returnRequest.id,
          returnRequest.orderId,
          returnRequest.userId,
          returnRequest.reason,
          returnRequest.details,
          returnRequest.inspectionResult,
          returnRequest.inspectionNote,
          returnRequest.inspectionUpdatedReason,
          returnRequest.refundStatus,
          returnRequest.refundAmount,
          relatedOrder?.shippingAddress?.name,
          relatedOrder?.shippingAddress?.phone,
          relatedOrder?.paymentMethod,
          relatedOrder?.paymentStatus,
          ...returnItemSearchValues,
        ]
          .filter(
            (value) =>
              value !== undefined &&
              value !== null &&
              value !== ""
          )
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !normalizedSearch ||
          searchableText.includes(normalizedSearch);

        return matchesStatus && matchesSearch;
      });
  }, [
    safeReturns,
    safeOrders,
    search,
    statusFilter,
  ]);

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    const countStatus = (targetStatus) =>
      safeReturns.filter(
        (item) =>
          (item.status || "").toLowerCase() === targetStatus
      ).length;

    return {
      total: safeReturns.length,
      requested: countStatus("requested"),
      approved: countStatus("approved"),
      received: countStatus("received"),
      completed: countStatus("completed"),
      rejected: countStatus("rejected"),
    };
  }, [safeReturns]);

  /* =====================================================
     DETAILS
  ===================================================== */

  const handleOpenDetails = (returnId) => {
    setSelectedReturnId(returnId);
  };

  const handleCloseDetails = () => {
    if (isSelectedReturnBusy) return;

    setSelectedReturnId(null);
  };

  /* =====================================================
     CREATE CUSTOMER NOTIFICATION
  ===================================================== */

  const createCustomerNotification = async (
    event,
    returnRequest,
    extraData = {}
  ) => {
    if (!returnRequest?.userId) return;

    const content = getReturnNotificationContent(
      event,
      returnRequest
    );

    if (!content) return;

    try {
      await dispatch(
        createNotificationThunk({
          userId: String(returnRequest.userId),
          type: content.type,
          title: content.title,
          message: content.message,
          referenceId: String(returnRequest.id),
          referenceType:
            content.type === "refund" ? "refund" : "return",
          orderId: String(returnRequest.orderId),
          isRead: false,
          createdAt: new Date().toISOString(),
          ...extraData,
        })
      ).unwrap();
    } catch (notificationError) {
      console.error(
        "Return updated, but notification creation failed:",
        notificationError
      );
    }
  };

  /* =====================================================
     STATUS TRANSITIONS
  ===================================================== */

  const handleStatusUpdate = async (nextStatus) => {
    if (!selectedReturn) return;
    if (isSelectedReturnBusy) return;

    const currentStatus = (
      selectedReturn.status || ""
    ).toLowerCase();

    const allowedTransitions = {
      requested: ["approved", "rejected"],
      approved: ["received"],
      received: [],
      completed: [],
      rejected: [],
    };

    const allowedNextStatuses =
      allowedTransitions[currentStatus] || [];

    if (!allowedNextStatuses.includes(nextStatus)) {
      return;
    }

    try {
      const updatedReturn = await dispatch(
        updateReturnStatusThunk({
          returnId: selectedReturn.id,
          status: nextStatus,
        })
      ).unwrap();

      await createCustomerNotification(
        nextStatus,
        updatedReturn || selectedReturn
      );

      return updatedReturn;
    } catch (error) {
      console.error(
        "Failed to update return:",
        error
      );
    }
  };

  /* =====================================================
     OPEN NEW INSPECTION
  ===================================================== */

  const handleOpenInspection = () => {
    if (!selectedReturn) return;
    if (isSelectedReturnBusy) return;

    const status = (
      selectedReturn.status || ""
    ).toLowerCase();

    if (status !== "received") return;

    setInspectionMode("create");
    setInspectionReturnId(selectedReturn.id);
  };

  /* =====================================================
     OPEN EDIT INSPECTION
  ===================================================== */

  const handleOpenEditInspection = () => {
    if (!selectedReturn) return;
    if (isSelectedReturnBusy) return;

    const status = (
      selectedReturn.status || ""
    ).toLowerCase();

    const refundStatus = (
      selectedReturn.refundStatus || "not_started"
    ).toLowerCase();

    if (status !== "completed") return;

    /*
     * Once refund processing begins,
     * inspection/inventory is locked.
     */

    if (["pending", "refunded"].includes(refundStatus)) {
      return;
    }

    setInspectionMode("edit");
    setInspectionReturnId(selectedReturn.id);
  };

  /* =====================================================
     CLOSE INSPECTION
  ===================================================== */

  const handleCloseInspection = () => {
    if (inspectingReturnId || editingInspectionId) {
      return;
    }

    setInspectionReturnId(null);
    setInspectionMode("create");
  };

  /* =====================================================
     COMPLETE NEW INSPECTION
  ===================================================== */

  const handleCompleteInspection = async ({
    condition,
    note,
  }) => {
    if (!inspectionReturn) return;

    const status = (
      inspectionReturn.status || ""
    ).toLowerCase();

    if (status !== "received") return;

    try {
      const updatedReturn = await dispatch(
        completeReturnInspectionThunk({
          returnRequest: inspectionReturn,
          condition,
          note,
        })
      ).unwrap();

      await createCustomerNotification(
        "inspection_completed",
        updatedReturn || inspectionReturn
      );

      setInspectionReturnId(null);
      setInspectionMode("create");

      return updatedReturn;
    } catch (error) {
      console.error(
        "Failed to complete inspection:",
        error
      );
    }
  };

  /* =====================================================
     EDIT INSPECTION
  ===================================================== */

  const handleEditInspection = async ({
    condition,
    note,
    editReason,
  }) => {
    if (!inspectionReturn) return;

    const status = (
      inspectionReturn.status || ""
    ).toLowerCase();

    const refundStatus = (
      inspectionReturn.refundStatus || "not_started"
    ).toLowerCase();

    if (status !== "completed") return;

    /*
     * Do not allow inventory changes
     * once refund processing begins.
     */

    if (["pending", "refunded"].includes(refundStatus)) {
      return;
    }

    try {
      const updatedReturn = await dispatch(
        editReturnInspectionThunk({
          returnRequest: inspectionReturn,
          condition,
          note,
          editReason,
        })
      ).unwrap();

      setInspectionReturnId(null);
      setInspectionMode("create");

      return updatedReturn;
    } catch (error) {
      console.error(
        "Failed to edit inspection:",
        error
      );
    }
  };

  /* =====================================================
     DRAWER SUBMIT ROUTER
  ===================================================== */

  const handleInspectionSubmit = (formData) => {
    if (inspectionMode === "edit") {
      return handleEditInspection(formData);
    }

    return handleCompleteInspection(formData);
  };

  /* =====================================================
     START REFUND
  ===================================================== */

  const handleStartRefund = async () => {
    if (!selectedReturn || !selectedOrder) return;
    if (isSelectedReturnBusy) return;

    const returnStatus = (
      selectedReturn.status || ""
    ).toLowerCase();

    const refundStatus = (
      selectedReturn.refundStatus || "not_started"
    ).toLowerCase();

    if (returnStatus !== "completed") return;
    if (refundStatus !== "not_started") return;

    try {
      const updatedReturn = await dispatch(
        startRefundThunk({
          returnRequest: selectedReturn,
          order: selectedOrder,
        })
      ).unwrap();

      const notificationReturn =
        updatedReturn || selectedReturn;

      await createCustomerNotification(
        "refund_started",
        notificationReturn,
        {
          refundAmount: Number(
            notificationReturn.refundAmount || 0
          ),
        }
      );

      return updatedReturn;
    } catch (error) {
      console.error(
        "Failed to start refund:",
        error
      );
    }
  };

  /* =====================================================
     COMPLETE REFUND
  ===================================================== */

  const handleCompleteRefund = async () => {
    if (!selectedReturn) return;
    if (isSelectedReturnBusy) return;

    const returnStatus = (
      selectedReturn.status || ""
    ).toLowerCase();

    const refundStatus = (
      selectedReturn.refundStatus || "not_started"
    ).toLowerCase();

    if (returnStatus !== "completed") return;
    if (refundStatus !== "pending") return;

    try {
      const updatedReturn = await dispatch(
        completeRefundThunk({
          returnRequest: selectedReturn,
        })
      ).unwrap();

      const notificationReturn =
        updatedReturn || selectedReturn;

      await createCustomerNotification(
        "refund_completed",
        notificationReturn,
        {
          refundAmount: Number(
            notificationReturn.refundAmount ||
              selectedReturn.refundAmount ||
              0
          ),
        }
      );

      return updatedReturn;
    } catch (error) {
      console.error(
        "Failed to complete refund:",
        error
      );
    }
  };

  /* =====================================================
     STATUS STYLE
  ===================================================== */

  const getStatusStyle = (status) => {
    const normalizedStatus = (
      status || "requested"
    ).toLowerCase();

    if (normalizedStatus === "approved") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (normalizedStatus === "received") {
      return "border-nexora-primary/20 bg-nexora-primary-soft text-nexora-primary";
    }

    if (normalizedStatus === "completed") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (normalizedStatus === "rejected") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-nexora-primary-soft" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-nexora-border bg-nexora-surface"
            />
          ))}
        </div>

        <div className="h-[380px] animate-pulse rounded-[2rem] border border-nexora-border bg-nexora-surface" />

        <div className="h-96 animate-pulse rounded-[2rem] border border-nexora-border bg-nexora-surface" />
      </div>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <div className="space-y-8">
        {/* ================= HEADER ================= */}

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-nexora-taupe">
              Customer Service
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-nexora-text">
              Returns
            </h1>

            <p className="mt-2 text-sm text-nexora-muted">
              Review returns, inspect received products, and manage
              refund processing.
            </p>
          </div>

          <div className="text-xs text-nexora-muted">
            {safeReturns.length} total requests
          </div>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ================= STATS ================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard
            label="Total Returns"
            value={stats.total}
          />

          <StatCard
            label="Requested"
            value={stats.requested}
          />

          <StatCard
            label="Approved"
            value={stats.approved}
          />

          <StatCard
            label="Received"
            value={stats.received}
          />

          <StatCard
            label="Completed"
            value={stats.completed}
          />

          <StatCard
            label="Rejected"
            value={stats.rejected}
          />
        </div>

        {/* ================= REFUND ANALYTICS ================= */}

        <RefundAmountChart returns={safeReturns} />

        {/* ================= DIRECTORY ================= */}

        <section className="overflow-hidden rounded-[2rem] border border-nexora-border bg-nexora-surface">
          {/* ================= FILTERS ================= */}

          <div className="border-b border-nexora-border px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexora-taupe">
                  Return Directory
                </p>

                <h2 className="mt-1 text-lg font-black text-nexora-text">
                  Return Requests
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search returns..."
                  className="h-11 min-w-[240px] rounded-xl border border-nexora-border bg-nexora-ivory px-4 text-sm text-nexora-text outline-none transition placeholder:text-nexora-muted/60 focus:border-nexora-primary focus:ring-2 focus:ring-nexora-primary/10"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="h-11 rounded-xl border border-nexora-border bg-nexora-ivory px-4 text-sm font-semibold text-nexora-text outline-none focus:border-nexora-primary"
                >
                  <option value="all">
                    All Statuses
                  </option>

                  <option value="requested">
                    Requested
                  </option>

                  <option value="approved">
                    Approved
                  </option>

                  <option value="received">
                    Received
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* ================= EMPTY ================= */}

          {filteredReturns.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-nexora-primary-soft">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6 text-nexora-primary"
                  aria-hidden="true"
                >
                  <path d="M4 7h11" />
                  <path d="m11 3 4 4-4 4" />
                  <path d="M20 17H9" />
                  <path d="m13 13-4 4 4 4" />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-black text-nexora-text">
                No return requests
              </h3>

              <p className="mt-2 text-sm text-nexora-muted">
                No returns match the current filters.
              </p>
            </div>
          ) : (
            /* ================= TABLE ================= */

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="border-b border-nexora-border bg-nexora-ivory/70">
                  <tr>
                    <TableHeading>
                      Return
                    </TableHeading>

                    <TableHeading>
                      Order
                    </TableHeading>

                    <TableHeading>
                      Customer
                    </TableHeading>

                    <TableHeading>
                      Product
                    </TableHeading>

                    <TableHeading>
                      Reason
                    </TableHeading>

                    <TableHeading>
                      Requested
                    </TableHeading>

                    <TableHeading>
                      Status
                    </TableHeading>

                    <TableHeading align="right">
                      Actions
                    </TableHeading>
                  </tr>
                </thead>

                <tbody>
                  {filteredReturns.map((returnRequest) => {
                    const status = (
                      returnRequest.status || "requested"
                    ).toLowerCase();

                    const products = Array.isArray(
                      returnRequest.items
                    )
                      ? returnRequest.items
                      : [];

                    const firstProduct = products[0];

                    const order = safeOrders.find(
                      (currentOrder) =>
                        String(currentOrder.id) ===
                        String(returnRequest.orderId)
                    );

                    const customerName =
                      order?.shippingAddress?.name ||
                      "Customer";

                    const requestedDate =
                      returnRequest.createdAt
                        ? new Date(
                            returnRequest.createdAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—";

                    return (
                      <tr
                        key={returnRequest.id}
                        className="border-b border-nexora-border transition last:border-b-0 hover:bg-nexora-ivory/50"
                      >
                        {/* ================= RETURN ================= */}

                        <td className="px-5 py-5 sm:px-6">
                          <p className="font-mono text-xs font-bold text-nexora-primary">
                            #{returnRequest.id}
                          </p>

                          <p className="mt-1 text-[10px] text-nexora-muted">
                            User {returnRequest.userId}
                          </p>
                        </td>

                        {/* ================= ORDER ================= */}

                        <td className="px-5 py-5 sm:px-6">
                          <p className="font-mono text-xs font-semibold text-nexora-text">
                            #{returnRequest.orderId}
                          </p>
                        </td>

                        {/* ================= CUSTOMER ================= */}

                        <td className="px-5 py-5 sm:px-6">
                          <p className="text-xs font-bold text-nexora-text">
                            {customerName}
                          </p>

                          {order?.shippingAddress?.phone && (
                            <p className="mt-1 text-[10px] text-nexora-muted">
                              {order.shippingAddress.phone}
                            </p>
                          )}
                        </td>

                        {/* ================= PRODUCT ================= */}

                        <td className="px-5 py-5 sm:px-6">
                          <p className="max-w-[220px] truncate text-sm font-bold text-nexora-text">
                            {firstProduct?.name ||
                              "Unknown product"}
                          </p>

                          {firstProduct?.variantLabel && (
                            <p className="mt-1 text-[10px] font-semibold text-nexora-primary">
                              {firstProduct.variantLabel}
                            </p>
                          )}

                          {products.length > 1 && (
                            <p className="mt-1 text-[10px] text-nexora-muted">
                              +{products.length - 1} more
                            </p>
                          )}
                        </td>

                        {/* ================= REASON ================= */}

                        <td className="px-5 py-5 sm:px-6">
                          <p className="text-xs font-bold capitalize text-nexora-text">
                            {(
                              returnRequest.reason ||
                              "Not specified"
                            ).replace(/_/g, " ")}
                          </p>

                          {returnRequest.details && (
                            <p
                              className="mt-1 max-w-[180px] truncate text-[11px] text-nexora-muted"
                              title={returnRequest.details}
                            >
                              {returnRequest.details}
                            </p>
                          )}
                        </td>

                        {/* ================= DATE ================= */}

                        <td className="px-5 py-5 sm:px-6">
                          <p className="text-xs font-semibold text-nexora-text">
                            {requestedDate}
                          </p>
                        </td>

                        {/* ================= STATUS ================= */}

                        <td className="px-5 py-5 sm:px-6">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${getStatusStyle(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* ================= ACTION ================= */}

                        <td className="px-5 py-5 text-right sm:px-6">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenDetails(
                                returnRequest.id
                              )
                            }
                            className="rounded-full border border-nexora-border bg-nexora-surface px-4 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-nexora-primary hover:border-nexora-primary hover:bg-nexora-primary-soft"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ================= DETAILS DRAWER ================= */}

      <ReturnDetailsDrawer
        isOpen={Boolean(selectedReturn)}
        returnRequest={selectedReturn}
        order={selectedOrder}
        isUpdating={isSelectedReturnBusy}
        isRefundUpdating={isSelectedRefundUpdating}
        onApprove={() =>
          handleStatusUpdate("approved")
        }
        onReject={() =>
          handleStatusUpdate("rejected")
        }
        onMarkReceived={() =>
          handleStatusUpdate("received")
        }
        onInspect={handleOpenInspection}
        onEditInspection={handleOpenEditInspection}
        onStartRefund={handleStartRefund}
        onCompleteRefund={handleCompleteRefund}
        onClose={handleCloseDetails}
      />

      {/* ================= INSPECTION DRAWER ================= */}

      <ReturnInspectionDrawer
        isOpen={Boolean(inspectionReturn)}
        returnRequest={inspectionReturn}
        mode={inspectionMode}
        isSubmitting={isInspectionSubmitting}
        onSubmit={handleInspectionSubmit}
        onClose={handleCloseInspection}
      />
    </>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl border border-nexora-border bg-nexora-surface p-5">
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
      {label}
    </p>

    <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-nexora-primary">
      {value}
    </p>
  </div>
);

/* =====================================================
   TABLE HEADING
===================================================== */

const TableHeading = ({ children, align = "left" }) => (
  <th
    scope="col"
    className={`whitespace-nowrap px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe sm:px-6 ${
      align === "right" ? "text-right" : "text-left"
    }`}
  >
    {children}
  </th>
);

export default AdminReturns;