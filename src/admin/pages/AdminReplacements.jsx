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
  fetchAllReplacements,
  updateReplacementStatusThunk,
  completeReplacementInspectionThunk,
  editReplacementInspectionThunk,
  shipReplacementThunk,
  markReplacementDeliveredThunk,
} from "../../redux/slices/replacementSlice";

import {
  fetchAllOrders,
} from "../../redux/slices/orderSlice";

import {
  createNotificationThunk,
} from "../../redux/slices/notificationSlice";

import ReplacementDetailsDrawer from "../components/replacements/ReplacementDetailsDrawer";
import ReplacementInspectionDrawer from "../components/replacements/ReplacementInspectionDrawer";

/* =====================================================
   NOTIFICATION CONTENT
===================================================== */

const getReplacementNotificationContent = (
  event,
  replacementRequest
) => {
  const shortId = String(
    replacementRequest?.id || ""
  )
    .slice(-8)
    .toUpperCase();

  const notifications = {
    approved: {
      title: "Replacement approved",
      message: `Your replacement request #${shortId} has been approved.`,
    },

    rejected: {
      title: "Replacement request rejected",
      message: `Your replacement request #${shortId} was not approved.`,
    },

    received: {
      title: "Returned item received",
      message: `We have received the original item for replacement #${shortId}.`,
    },

    inspection_completed: {
      title: "Replacement inspection completed",
      message: `Inspection for replacement #${shortId} has been completed.`,
    },

    shipped: {
      title: "Replacement shipped",
      message: `Your replacement for request #${shortId} has been shipped.`,
    },

    delivered: {
      title: "Replacement delivered",
      message: `Your replacement for request #${shortId} has been delivered.`,
    },
  };

  return notifications[event] || null;
};

/* =====================================================
   COMPONENT
===================================================== */

const AdminReplacements = () => {
  const dispatch = useDispatch();

  /* =====================================================
     REDUX
  ===================================================== */

  const {
    items: replacementItems,
    loading,
    error,
    updateError,

    updatingReplacementId,
    inspectingReplacementId,
    editingInspectionId,
    shippingReplacementId,
  } = useSelector(
    (state) => state.replacements
  );

  const {
    items: orders,
  } = useSelector(
    (state) => state.orders
  );

  const safeReplacements =
    Array.isArray(replacementItems)
      ? replacementItems
      : [];

  const safeOrders =
    Array.isArray(orders)
      ? orders
      : [];

  /* =====================================================
     LOCAL STATE
  ===================================================== */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    selectedReplacementId,
    setSelectedReplacementId,
  ] = useState(null);

  const [
    inspectionReplacementId,
    setInspectionReplacementId,
  ] = useState(null);

  const [
    inspectionMode,
    setInspectionMode,
  ] = useState("create");

  /* =====================================================
     FETCH
  ===================================================== */

  useEffect(() => {
    dispatch(
      fetchAllReplacements()
    );

    dispatch(
      fetchAllOrders()
    );
  }, [dispatch]);

  /* =====================================================
     SELECTED REPLACEMENT
  ===================================================== */

  const selectedReplacement =
    safeReplacements.find(
      (replacement) =>
        String(
          replacement.id
        ) ===
        String(
          selectedReplacementId
        )
    ) || null;

  const selectedOrder =
    selectedReplacement
      ? safeOrders.find(
          (order) =>
            String(
              order.id
            ) ===
            String(
              selectedReplacement.orderId
            )
        ) || null
      : null;

  /* =====================================================
     SELECTED BUSY STATE
  ===================================================== */

  const isSelectedUpdating =
    Boolean(
      selectedReplacement
    ) &&
    String(
      updatingReplacementId
    ) ===
      String(
        selectedReplacement.id
      );

  const isSelectedInspecting =
    Boolean(
      selectedReplacement
    ) &&
    String(
      inspectingReplacementId
    ) ===
      String(
        selectedReplacement.id
      );

  const isSelectedInspectionEditing =
    Boolean(
      selectedReplacement
    ) &&
    String(
      editingInspectionId
    ) ===
      String(
        selectedReplacement.id
      );

  const isSelectedShipping =
    Boolean(
      selectedReplacement
    ) &&
    String(
      shippingReplacementId
    ) ===
      String(
        selectedReplacement.id
      );

  const isSelectedBusy =
    isSelectedUpdating ||
    isSelectedInspecting ||
    isSelectedInspectionEditing ||
    isSelectedShipping;

  /* =====================================================
     INSPECTION REPLACEMENT
  ===================================================== */

  const inspectionReplacement =
    safeReplacements.find(
      (replacement) =>
        String(
          replacement.id
        ) ===
        String(
          inspectionReplacementId
        )
    ) || null;

  const isCreatingInspection =
    Boolean(
      inspectionReplacement
    ) &&
    String(
      inspectingReplacementId
    ) ===
      String(
        inspectionReplacement.id
      );

  const isEditingInspection =
    Boolean(
      inspectionReplacement
    ) &&
    String(
      editingInspectionId
    ) ===
      String(
        inspectionReplacement.id
      );

  const isInspectionSubmitting =
    isCreatingInspection ||
    isEditingInspection;

  /* =====================================================
     SORT + FILTER
  ===================================================== */

  const filteredReplacements =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return [
        ...safeReplacements,
      ]
        .sort(
          (
            a,
            b
          ) => {
            const dateA =
              a.requestedAt ||
              a.createdAt
                ? new Date(
                    a.requestedAt ||
                      a.createdAt
                  ).getTime()
                : 0;

            const dateB =
              b.requestedAt ||
              b.createdAt
                ? new Date(
                    b.requestedAt ||
                      b.createdAt
                  ).getTime()
                : 0;

            return (
              dateB -
              dateA
            );
          }
        )
        .filter(
          (
            replacement
          ) => {
            const status =
              String(
                replacement.status ||
                  "requested"
              ).toLowerCase();

            const matchesStatus =
              statusFilter ===
                "all" ||
              status ===
                statusFilter;

            const relatedOrder =
              safeOrders.find(
                (order) =>
                  String(
                    order.id
                  ) ===
                  String(
                    replacement.orderId
                  )
              );

            const itemSearchValues =
              Array.isArray(
                replacement.items
              )
                ? replacement.items.flatMap(
                    (item) => [
                      item.name,
                      item.brand,
                      item.id,
                      item.variantId,
                      item.variantLabel,

                      ...(item.variantAttributes &&
                      typeof item.variantAttributes ===
                        "object"
                        ? Object.entries(
                            item.variantAttributes
                          ).flatMap(
                            ([
                              key,
                              value,
                            ]) => [
                              key,
                              value,
                            ]
                          )
                        : []),
                    ]
                  )
                : [];

            const searchableText =
              [
                replacement.id,
                replacement.orderId,
                replacement.userId,
                replacement.reason,
                replacement.details,
                replacement.inspectionResult,
                replacement.inspectionNote,
                replacement.inspectionUpdatedReason,

                relatedOrder
                  ?.shippingAddress
                  ?.name,

                relatedOrder
                  ?.shippingAddress
                  ?.phone,

                relatedOrder
                  ?.shippingAddress
                  ?.email,

                relatedOrder
                  ?.paymentMethod,

                relatedOrder
                  ?.paymentStatus,

                ...itemSearchValues,
              ]
                .filter(
                  (value) =>
                    value !==
                      undefined &&
                    value !==
                      null &&
                    value !==
                      ""
                )
                .join(" ")
                .toLowerCase();

            const matchesSearch =
              !normalizedSearch ||
              searchableText.includes(
                normalizedSearch
              );

            return (
              matchesStatus &&
              matchesSearch
            );
          }
        );
    }, [
      safeReplacements,
      safeOrders,
      search,
      statusFilter,
    ]);

  /* =====================================================
     STATS
  ===================================================== */

  const stats =
    useMemo(() => {
      const countStatus = (
        targetStatus
      ) =>
        safeReplacements.filter(
          (replacement) =>
            String(
              replacement.status ||
                ""
            ).toLowerCase() ===
            targetStatus
        ).length;

      return {
        total:
          safeReplacements.length,

        requested:
          countStatus(
            "requested"
          ),

        approved:
          countStatus(
            "approved"
          ),

        received:
          countStatus(
            "received"
          ),

        inspected:
          countStatus(
            "inspected"
          ),

        shipped:
          countStatus(
            "shipped"
          ),

        delivered:
          countStatus(
            "delivered"
          ),

        rejected:
          countStatus(
            "rejected"
          ),
      };
    }, [
      safeReplacements,
    ]);

  /* =====================================================
     DETAILS
  ===================================================== */

  const handleOpenDetails = (
    replacementId
  ) => {
    setSelectedReplacementId(
      replacementId
    );
  };

  const handleCloseDetails =
    () => {
      if (
        isSelectedBusy
      ) {
        return;
      }

      setSelectedReplacementId(
        null
      );
    };

  /* =====================================================
     CUSTOMER NOTIFICATION
  ===================================================== */

  const createCustomerNotification =
    async (
      event,
      replacementRequest
    ) => {
      if (
        !replacementRequest
          ?.userId
      ) {
        return;
      }

      const content =
        getReplacementNotificationContent(
          event,
          replacementRequest
        );

      if (!content) {
        return;
      }

      try {
        await dispatch(
          createNotificationThunk({
            userId: String(
              replacementRequest.userId
            ),

            type:
              "replacement",

            title:
              content.title,

            message:
              content.message,

            referenceId:
              String(
                replacementRequest.id
              ),

            referenceType:
              "replacement",

            orderId:
              String(
                replacementRequest.orderId
              ),

            isRead:
              false,

            createdAt:
              new Date().toISOString(),
          })
        ).unwrap();
      } catch (
        notificationError
      ) {
        console.error(
          "Replacement updated, but notification creation failed:",
          notificationError
        );
      }
    };

  /* =====================================================
     STATUS UPDATE
  ===================================================== */

  const handleStatusUpdate =
    async (
      nextStatus
    ) => {
      if (
        !selectedReplacement
      ) {
        return;
      }

      if (
        isSelectedBusy
      ) {
        return;
      }

      const currentStatus =
        String(
          selectedReplacement.status ||
            "requested"
        ).toLowerCase();

      const allowedTransitions =
        {
          requested: [
            "approved",
            "rejected",
          ],

          approved: [
            "received",
          ],
        };

      const allowedNextStatuses =
        allowedTransitions[
          currentStatus
        ] || [];

      if (
        !allowedNextStatuses.includes(
          nextStatus
        )
      ) {
        return;
      }

      try {
        const updatedReplacement =
          await dispatch(
            updateReplacementStatusThunk({
              replacementRequest:
                selectedReplacement,

              status:
                nextStatus,
            })
          ).unwrap();

        await createCustomerNotification(
          nextStatus,
          updatedReplacement ||
            selectedReplacement
        );

        return updatedReplacement;
      } catch (statusError) {
        console.error(
          "Failed to update replacement status:",
          statusError
        );
      }
    };

  /* =====================================================
     OPEN INSPECTION
  ===================================================== */

  const handleOpenInspection =
    () => {
      if (
        !selectedReplacement ||
        isSelectedBusy
      ) {
        return;
      }

      const status =
        String(
          selectedReplacement.status ||
            ""
        ).toLowerCase();

      if (
        status !==
        "received"
      ) {
        return;
      }

      setInspectionMode(
        "create"
      );

      setInspectionReplacementId(
        selectedReplacement.id
      );
    };

  /* =====================================================
     OPEN EDIT INSPECTION
  ===================================================== */

  const handleOpenEditInspection =
    () => {
      if (
        !selectedReplacement ||
        isSelectedBusy
      ) {
        return;
      }

      const status =
        String(
          selectedReplacement.status ||
            ""
        ).toLowerCase();

      if (
        status !==
        "inspected"
      ) {
        return;
      }

      if (
        selectedReplacement.replacementStockDeducted
      ) {
        return;
      }

      setInspectionMode(
        "edit"
      );

      setInspectionReplacementId(
        selectedReplacement.id
      );
    };

  /* =====================================================
     CLOSE INSPECTION
  ===================================================== */

  const handleCloseInspection =
    () => {
      if (
        inspectingReplacementId ||
        editingInspectionId
      ) {
        return;
      }

      setInspectionReplacementId(
        null
      );

      setInspectionMode(
        "create"
      );
    };

  /* =====================================================
     COMPLETE INSPECTION
  ===================================================== */

  const handleCompleteInspection =
    async ({
      condition,
      note,
    }) => {
      if (
        !inspectionReplacement
      ) {
        return;
      }

      try {
        const updatedReplacement =
          await dispatch(
            completeReplacementInspectionThunk({
              replacementRequest:
                inspectionReplacement,

              condition,
              note,
            })
          ).unwrap();

        await createCustomerNotification(
          "inspection_completed",
          updatedReplacement ||
            inspectionReplacement
        );

        setInspectionReplacementId(
          null
        );

        setInspectionMode(
          "create"
        );

        return updatedReplacement;
      } catch (
        inspectionError
      ) {
        console.error(
          "Failed to complete replacement inspection:",
          inspectionError
        );

        throw inspectionError;
      }
    };

  /* =====================================================
     EDIT INSPECTION
  ===================================================== */

  const handleEditInspection =
    async ({
      condition,
      note,
      editReason,
    }) => {
      if (
        !inspectionReplacement
      ) {
        return;
      }

      try {
        const updatedReplacement =
          await dispatch(
            editReplacementInspectionThunk({
              replacementRequest:
                inspectionReplacement,

              condition,
              note,
              editReason,
            })
          ).unwrap();

        setInspectionReplacementId(
          null
        );

        setInspectionMode(
          "create"
        );

        return updatedReplacement;
      } catch (
        inspectionError
      ) {
        console.error(
          "Failed to edit replacement inspection:",
          inspectionError
        );

        throw inspectionError;
      }
    };

  /* =====================================================
     INSPECTION ROUTER
  ===================================================== */

  const handleInspectionSubmit =
    (
      formData
    ) => {
      if (
        inspectionMode ===
        "edit"
      ) {
        return handleEditInspection(
          formData
        );
      }

      return handleCompleteInspection(
        formData
      );
    };

  /* =====================================================
     SHIP REPLACEMENT
  ===================================================== */

  const handleShipReplacement =
    async () => {
      if (
        !selectedReplacement ||
        isSelectedBusy
      ) {
        return;
      }

      const status =
        String(
          selectedReplacement.status ||
            ""
        ).toLowerCase();

      if (
        status !==
        "inspected"
      ) {
        return;
      }

      if (
        selectedReplacement.replacementStockDeducted
      ) {
        return;
      }

      try {
        const updatedReplacement =
          await dispatch(
            shipReplacementThunk({
              replacementRequest:
                selectedReplacement,
            })
          ).unwrap();

        await createCustomerNotification(
          "shipped",
          updatedReplacement ||
            selectedReplacement
        );

        return updatedReplacement;
      } catch (
        shippingError
      ) {
        console.error(
          "Failed to ship replacement:",
          shippingError
        );
      }
    };

  /* =====================================================
     MARK DELIVERED
  ===================================================== */

  const handleMarkDelivered =
    async () => {
      if (
        !selectedReplacement ||
        isSelectedBusy
      ) {
        return;
      }

      const status =
        String(
          selectedReplacement.status ||
            ""
        ).toLowerCase();

      if (
        status !==
        "shipped"
      ) {
        return;
      }

      try {
        const updatedReplacement =
          await dispatch(
            markReplacementDeliveredThunk({
              replacementRequest:
                selectedReplacement,
            })
          ).unwrap();

        await createCustomerNotification(
          "delivered",
          updatedReplacement ||
            selectedReplacement
        );

        return updatedReplacement;
      } catch (
        deliveryError
      ) {
        console.error(
          "Failed to mark replacement delivered:",
          deliveryError
        );
      }
    };

  /* =====================================================
     STATUS STYLE
  ===================================================== */

  const getStatusStyle = (
    status
  ) => {
    const normalized =
      String(
        status ||
          "requested"
      ).toLowerCase();

    const styles = {
      requested:
        "border-amber-200 bg-amber-50 text-amber-700",

      approved:
        "border-emerald-200 bg-emerald-50 text-emerald-700",

      received:
        "border-nexora-primary/20 bg-nexora-primary-soft text-nexora-primary",

      inspected:
        "border-violet-200 bg-violet-50 text-violet-700",

      shipped:
        "border-blue-200 bg-blue-50 text-blue-700",

      delivered:
        "border-emerald-200 bg-emerald-50 text-emerald-700",

      rejected:
        "border-red-200 bg-red-50 text-red-700",
    };

    return (
      styles[normalized] ||
      styles.requested
    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-nexora-primary-soft" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 8,
          }).map(
            (
              _,
              index
            ) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl border border-nexora-border bg-nexora-surface"
              />
            )
          )}
        </div>

        <div className="h-[450px] animate-pulse rounded-[2rem] border border-nexora-border bg-nexora-surface" />
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
              Replacements
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-nexora-muted">
              Review replacement requests,
              inspect returned products, and
              manage outgoing replacement
              inventory.
            </p>
          </div>

          <div className="text-xs text-nexora-muted">
            {
              safeReplacements.length
            }{" "}
            total requests
          </div>
        </div>

        {/* ================= ERROR ================= */}

        {(error ||
          updateError) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">
              {updateError ||
                error}
            </p>
          </div>
        )}

        {/* ================= STATS ================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <StatCard
            label="Total"
            value={
              stats.total
            }
          />

          <StatCard
            label="Requested"
            value={
              stats.requested
            }
          />

          <StatCard
            label="Approved"
            value={
              stats.approved
            }
          />

          <StatCard
            label="Received"
            value={
              stats.received
            }
          />

          <StatCard
            label="Inspected"
            value={
              stats.inspected
            }
          />

          <StatCard
            label="Shipped"
            value={
              stats.shipped
            }
          />

          <StatCard
            label="Delivered"
            value={
              stats.delivered
            }
          />

          <StatCard
            label="Rejected"
            value={
              stats.rejected
            }
          />
        </div>

        {/* ================= DIRECTORY ================= */}

        <section className="overflow-hidden rounded-[2rem] border border-nexora-border bg-nexora-surface">
          {/* ================= FILTERS ================= */}

          <div className="border-b border-nexora-border px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexora-taupe">
                  Replacement Directory
                </p>

                <h2 className="mt-1 text-lg font-black text-nexora-text">
                  Replacement Requests
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search replacements..."
                  className="h-11 min-w-[250px] rounded-xl border border-nexora-border bg-nexora-ivory px-4 text-sm text-nexora-text outline-none transition placeholder:text-nexora-muted/60 focus:border-nexora-primary focus:ring-2 focus:ring-nexora-primary/10"
                />

                <select
                  value={
                    statusFilter
                  }
                  onChange={(
                    event
                  ) =>
                    setStatusFilter(
                      event.target.value
                    )
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

                  <option value="inspected">
                    Inspected
                  </option>

                  <option value="shipped">
                    Shipped
                  </option>

                  <option value="delivered">
                    Delivered
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* ================= EMPTY ================= */}

          {filteredReplacements.length ===
          0 ? (
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
                No replacement requests
              </h3>

              <p className="mt-2 text-sm text-nexora-muted">
                No replacements match the
                current filters.
              </p>
            </div>
          ) : (
            /* ================= TABLE ================= */

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left">
                <thead className="border-b border-nexora-border bg-nexora-ivory/70">
                  <tr>
                    <TableHeading>
                      Replacement
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
                  {filteredReplacements.map(
                    (
                      replacement
                    ) => {
                      const status =
                        String(
                          replacement.status ||
                            "requested"
                        ).toLowerCase();

                      const products =
                        Array.isArray(
                          replacement.items
                        )
                          ? replacement.items
                          : [];

                      const firstProduct =
                        products[0];

                      const order =
                        safeOrders.find(
                          (
                            currentOrder
                          ) =>
                            String(
                              currentOrder.id
                            ) ===
                            String(
                              replacement.orderId
                            )
                        );

                      const customerName =
                        order
                          ?.shippingAddress
                          ?.name ||
                        "Customer";

                      const requestedAt =
                        replacement.requestedAt ||
                        replacement.createdAt;

                      const requestedDate =
                        requestedAt
                          ? new Date(
                              requestedAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month:
                                  "short",
                                year: "numeric",
                              }
                            )
                          : "—";

                      return (
                        <tr
                          key={
                            replacement.id
                          }
                          className="border-b border-nexora-border transition last:border-b-0 hover:bg-nexora-ivory/50"
                        >
                          {/* ================= ID ================= */}

                          <td className="px-5 py-5 sm:px-6">
                            <p className="font-mono text-xs font-bold text-nexora-primary">
                              #
                              {
                                replacement.id
                              }
                            </p>

                            <p className="mt-1 text-[10px] text-nexora-muted">
                              User{" "}
                              {
                                replacement.userId
                              }
                            </p>
                          </td>

                          {/* ================= ORDER ================= */}

                          <td className="px-5 py-5 sm:px-6">
                            <p className="font-mono text-xs font-semibold text-nexora-text">
                              #
                              {
                                replacement.orderId
                              }
                            </p>
                          </td>

                          {/* ================= CUSTOMER ================= */}

                          <td className="px-5 py-5 sm:px-6">
                            <p className="text-xs font-bold text-nexora-text">
                              {
                                customerName
                              }
                            </p>

                            {order
                              ?.shippingAddress
                              ?.phone && (
                              <p className="mt-1 text-[10px] text-nexora-muted">
                                {
                                  order
                                    .shippingAddress
                                    .phone
                                }
                              </p>
                            )}
                          </td>

                          {/* ================= PRODUCT ================= */}

                          <td className="px-5 py-5 sm:px-6">
                            <p className="max-w-[220px] truncate text-sm font-bold text-nexora-text">
                              {firstProduct
                                ?.name ||
                                "Unknown product"}
                            </p>

                            {firstProduct
                              ?.variantLabel && (
                              <p className="mt-1 max-w-[220px] truncate text-[10px] font-semibold text-nexora-primary">
                                {
                                  firstProduct.variantLabel
                                }
                              </p>
                            )}

                            {products.length >
                              1 && (
                              <p className="mt-1 text-[10px] text-nexora-muted">
                                +
                                {products.length -
                                  1}{" "}
                                more
                              </p>
                            )}
                          </td>

                          {/* ================= REASON ================= */}

                          <td className="px-5 py-5 sm:px-6">
                            <p className="text-xs font-bold capitalize text-nexora-text">
                              {String(
                                replacement.reason ||
                                  "Not specified"
                              ).replace(
                                /_/g,
                                " "
                              )}
                            </p>

                            {replacement.details && (
                              <p
                                title={
                                  replacement.details
                                }
                                className="mt-1 max-w-[180px] truncate text-[11px] text-nexora-muted"
                              >
                                {
                                  replacement.details
                                }
                              </p>
                            )}
                          </td>

                          {/* ================= DATE ================= */}

                          <td className="px-5 py-5 sm:px-6">
                            <p className="text-xs font-semibold text-nexora-text">
                              {
                                requestedDate
                              }
                            </p>
                          </td>

                          {/* ================= STATUS ================= */}

                          <td className="px-5 py-5 sm:px-6">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${getStatusStyle(
                                status
                              )}`}
                            >
                              {
                                status
                              }
                            </span>
                          </td>

                          {/* ================= ACTION ================= */}

                          <td className="px-5 py-5 text-right sm:px-6">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenDetails(
                                  replacement.id
                                )
                              }
                              className="rounded-full border border-nexora-border bg-nexora-surface px-4 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-nexora-primary transition hover:border-nexora-primary hover:bg-nexora-primary-soft"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ================= DETAILS DRAWER ================= */}

      <ReplacementDetailsDrawer
        isOpen={Boolean(
          selectedReplacement
        )}
        replacementRequest={
          selectedReplacement
        }
        order={
          selectedOrder
        }
        isUpdating={
          isSelectedBusy
        }
        isShipping={
          isSelectedShipping
        }
        onApprove={() =>
          handleStatusUpdate(
            "approved"
          )
        }
        onReject={() =>
          handleStatusUpdate(
            "rejected"
          )
        }
        onMarkReceived={() =>
          handleStatusUpdate(
            "received"
          )
        }
        onInspect={
          handleOpenInspection
        }
        onEditInspection={
          handleOpenEditInspection
        }
        onShip={
          handleShipReplacement
        }
        onMarkDelivered={
          handleMarkDelivered
        }
        onClose={
          handleCloseDetails
        }
      />

      {/* ================= INSPECTION DRAWER ================= */}

      <ReplacementInspectionDrawer
        isOpen={Boolean(
          inspectionReplacement
        )}
        replacementRequest={
          inspectionReplacement
        }
        mode={
          inspectionMode
        }
        isSubmitting={
          isInspectionSubmitting
        }
        onSubmit={
          handleInspectionSubmit
        }
        onClose={
          handleCloseInspection
        }
      />
    </>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-nexora-border bg-nexora-surface p-5">
    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-nexora-taupe">
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

const TableHeading = ({
  children,
  align = "left",
}) => (
  <th
    scope="col"
    className={`whitespace-nowrap px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe sm:px-6 ${
      align === "right"
        ? "text-right"
        : "text-left"
    }`}
  >
    {children}
  </th>
);

export default AdminReplacements;