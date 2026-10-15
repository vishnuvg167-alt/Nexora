const ReturnDetailsDrawer = ({
  isOpen,
  returnRequest,
  order,
  isUpdating,
  isRefundUpdating,
  onApprove,
  onReject,
  onMarkReceived,
  onInspect,
  onEditInspection,
  onStartRefund,
  onCompleteRefund,
  onClose,
}) => {
  if (!isOpen || !returnRequest) {
    return null;
  }

  /* =====================================================
     NORMALIZED DATA
  ===================================================== */

  const status = (
    returnRequest.status || "requested"
  ).toLowerCase();

  const refundStatus = (
    returnRequest.refundStatus || "not_started"
  ).toLowerCase();

  const inspectionResult = (
    returnRequest.inspectionResult || ""
  ).toLowerCase();

  const items = Array.isArray(returnRequest.items)
    ? returnRequest.items
    : [];

  const orderItems = Array.isArray(order?.items)
    ? order.items
    : [];

  const shippingAddress =
    order?.shippingAddress || {};

  const paymentMethod = (
    order?.paymentMethod || ""
  ).toLowerCase();

  const paymentStatus = (
    order?.paymentStatus || ""
  ).toLowerCase();

  /* =====================================================
     HELPERS
  ===================================================== */

  const roundMoney = (value) =>
    Math.round(
      (Number(value) + Number.EPSILON) * 100
    ) / 100;

  const getItemKey = (item) =>
    `${String(item?.id)}::${String(
      item?.variantId || "simple"
    )}`;

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  const formatText = (value) =>
    String(value || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      );

  const formatDateTime = (value) => {
    if (!value) {
      return "Not available";
    }

    return new Date(value).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* =====================================================
     RETURN ITEM DETAILS

     We match the return item against the original order
     snapshot using product + variant.

     This means the admin sees the original purchased price,
     not a current product price.
  ===================================================== */

  const returnedItems = items.map((returnItem) => {
    const itemKey = getItemKey(returnItem);

    const originalOrderItem = orderItems.find(
      (orderItem) =>
        getItemKey(orderItem) === itemKey
    );

    const quantity =
      Number(returnItem.quantity) || 0;

    const originalUnitPrice = Number(
      originalOrderItem?.price ??
        returnItem.price ??
        0
    );

    const lineSubtotal = roundMoney(
      originalUnitPrice * quantity
    );

    return {
      ...returnItem,
      originalOrderItem,
      quantity,
      originalUnitPrice,
      lineSubtotal,
    };
  });

  /* =====================================================
     REFUND PREVIEW

     IMPORTANT:
     We do NOT use order.total for an item-level return.

     Example:

     Order subtotal = ₹194,998
     Order discount = ₹5,000

     Returned item = ₹89,999

     Returned share:
     89,999 / 194,998

     Allocated discount:
     5,000 × returned share

     Refund:
     returned subtotal - allocated discount

     Shipping is not refunded for item-level returns.
  ===================================================== */

  const previewReturnedSubtotal =
    roundMoney(
      returnedItems.reduce(
        (total, item) =>
          total + item.lineSubtotal,
        0
      )
    );

  const orderSubtotal =
    Number(order?.subtotal) || 0;

  const orderDiscount =
    Number(order?.discount) || 0;

  const orderShipping =
    Number(order?.shipping) || 0;

  const orderTotal =
    Number(order?.total) || 0;

  const returnedShare =
    orderSubtotal > 0
      ? Math.min(
          1,
          previewReturnedSubtotal /
            orderSubtotal
        )
      : 0;

  const previewAllocatedDiscount =
    roundMoney(
      orderDiscount * returnedShare
    );

  /*
   * Current NEXORA policy:
   * item-level returns do not refund shipping.
   */

  const previewShippingRefund = 0;

  const previewRefundAmount =
    roundMoney(
      Math.max(
        0,
        previewReturnedSubtotal -
          previewAllocatedDiscount +
          previewShippingRefund
      )
    );

  /* =====================================================
     STORED REFUND BREAKDOWN

     Once refund processing begins, the snapshot stored
     in the return record becomes the source of truth.
  ===================================================== */

  const storedBreakdown =
    returnRequest.refundBreakdown &&
    typeof returnRequest.refundBreakdown ===
      "object"
      ? returnRequest.refundBreakdown
      : null;

  const displayedReturnedSubtotal =
    refundStatus === "not_started"
      ? previewReturnedSubtotal
      : Number(
          storedBreakdown?.returnedItemsSubtotal ??
            previewReturnedSubtotal
        );

  const displayedAllocatedDiscount =
    refundStatus === "not_started"
      ? previewAllocatedDiscount
      : Number(
          storedBreakdown?.allocatedDiscount ??
            0
        );

  const displayedShippingRefund =
    refundStatus === "not_started"
      ? previewShippingRefund
      : Number(
          storedBreakdown?.shippingRefund ??
            0
        );

  const refundAmount =
    refundStatus === "not_started"
      ? previewRefundAmount
      : Number(
          returnRequest.refundAmount || 0
        );

  /* =====================================================
     PERMISSIONS
  ===================================================== */

  const canEditInspection =
    status === "completed" &&
    refundStatus === "not_started";

  const canStartRefund =
    status === "completed" &&
    refundStatus === "not_started" &&
    paymentStatus === "paid" &&
    Boolean(order) &&
    refundAmount > 0;

  const canCompleteRefund =
    status === "completed" &&
    refundStatus === "pending";

  /* =====================================================
     DATES
  ===================================================== */

  const requestedDate =
    formatDateTime(returnRequest.createdAt);

  const inspectedDate =
    formatDateTime(returnRequest.inspectedAt);

  const inspectionUpdatedDate =
    formatDateTime(
      returnRequest.inspectionUpdatedAt
    );

  const refundStartedDate =
    formatDateTime(
      returnRequest.refundStartedAt
    );

  const refundedDate =
    formatDateTime(
      returnRequest.refundedAt
    );

  const orderDate = order?.createdAt
    ? new Date(
        order.createdAt
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

  /* =====================================================
     CUSTOMER
  ===================================================== */

  const customerName =
    shippingAddress.name ||
    order?.customerName ||
    "Customer";

  const customerPhone =
    shippingAddress.phone ||
    order?.phone ||
    "Not available";

  /* =====================================================
     STATUS STYLES
  ===================================================== */

  const getReturnStatusStyle = () => {
    if (status === "approved") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "received") {
      return "border-nexora-primary/20 bg-nexora-primary-soft text-nexora-primary";
    }

    if (status === "completed") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "rejected") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  const getRefundStatusStyle = () => {
    if (refundStatus === "refunded") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (refundStatus === "pending") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    return "border-nexora-border bg-nexora-ivory text-nexora-muted";
  };

  return (
    <div className="fixed inset-0 z-[70]">
      {/* ================= OVERLAY ================= */}

      <button
        type="button"
        aria-label="Close return details"
        onClick={
          isUpdating ? undefined : onClose
        }
        className="
          absolute inset-0 h-full w-full
          cursor-default bg-black/35
          backdrop-blur-[2px]
        "
      />

      {/* ================= DRAWER ================= */}

      <aside
        className="
          absolute right-0 top-0
          flex h-full w-full max-w-2xl
          flex-col bg-nexora-surface
          shadow-2xl
        "
      >
        {/* ================= HEADER ================= */}

        <div
          className="
            flex items-start justify-between gap-5
            border-b border-nexora-border
            px-6 py-6 sm:px-8
          "
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
              Return Request
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-nexora-text">
              Return Details
            </h2>

            <p className="mt-2 font-mono text-xs font-semibold text-nexora-muted">
              #{returnRequest.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            aria-label="Close drawer"
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-full border
              border-nexora-border
              bg-nexora-ivory
              text-nexora-muted
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
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="m6 6 12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* ================= CONTENT ================= */}

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
          {/* ================= STATUS ================= */}

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard label="Return Status">
              <span
                className={`
                  inline-flex rounded-full border
                  px-3 py-1.5
                  text-[10px] font-bold uppercase
                  tracking-[0.1em]
                  ${getReturnStatusStyle()}
                `}
              >
                {formatText(status)}
              </span>
            </InfoCard>

            <InfoCard label="Refund Status">
              <span
                className={`
                  inline-flex rounded-full border
                  px-3 py-1.5
                  text-[10px] font-bold uppercase
                  tracking-[0.1em]
                  ${getRefundStatusStyle()}
                `}
              >
                {formatText(refundStatus)}
              </span>
            </InfoCard>
          </div>

          {/* ================= RETURN INFO ================= */}

          <Section
            eyebrow="Request"
            title="Return Information"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail
                label="Return ID"
                value={`#${returnRequest.id}`}
                mono
              />

              <Detail
                label="Order ID"
                value={`#${returnRequest.orderId}`}
                mono
              />

              <Detail
                label="Requested"
                value={requestedDate}
              />

              <Detail
                label="Reason"
                value={formatText(
                  returnRequest.reason ||
                    "Not specified"
                )}
              />
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-nexora-taupe">
                Customer Explanation
              </p>

              <div className="mt-2 rounded-2xl border border-nexora-border bg-nexora-ivory px-4 py-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-nexora-text">
                  {returnRequest.details ||
                    "No additional details were provided."}
                </p>
              </div>
            </div>
          </Section>

          {/* ================= PRODUCTS ================= */}

          <Section
            eyebrow="Items"
            title="Products Being Returned"
          >
            {returnedItems.length === 0 ? (
              <p className="text-sm text-nexora-muted">
                No product information available.
              </p>
            ) : (
              <div className="space-y-3">
                {returnedItems.map(
                  (item, index) => (
                    <div
                      key={`${item.id}-${item.variantId || "simple"}-${index}`}
                      className="
                        rounded-2xl
                        border border-nexora-border
                        bg-nexora-ivory p-4
                      "
                    >
                      <div className="flex gap-4">
                        {/* IMAGE */}

                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-nexora-border bg-white">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={
                                item.name ||
                                "Returned product"
                              }
                              loading="lazy"
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <span className="text-[9px] font-bold uppercase text-nexora-muted">
                              No Image
                            </span>
                          )}
                        </div>

                        {/* INFO */}

                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-nexora-taupe">
                            {item.brand ||
                              "NEXORA"}
                          </p>

                          <p className="mt-1 text-sm font-black text-nexora-text">
                            {item.name ||
                              "Unknown product"}
                          </p>

                          {/* VARIANT */}

                          {item.variantLabel && (
                            <div className="mt-2">
                              <span className="inline-flex rounded-full border border-nexora-primary/15 bg-nexora-primary-soft px-3 py-1 text-[10px] font-bold text-nexora-primary">
                                {item.variantLabel}
                              </span>
                            </div>
                          )}

                          {/* VARIANT ATTRIBUTES */}

                          {item.variantAttributes &&
                            typeof item.variantAttributes ===
                              "object" && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(
                                  item.variantAttributes
                                ).map(
                                  ([
                                    key,
                                    value,
                                  ]) => (
                                    <span
                                      key={key}
                                      className="text-[10px] text-nexora-muted"
                                    >
                                      <strong className="font-bold text-nexora-text">
                                        {key}:
                                      </strong>{" "}
                                      {String(
                                        value
                                      )}
                                    </span>
                                  )
                                )}
                              </div>
                            )}

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-nexora-muted">
                            <span>
                              Qty:{" "}
                              <strong className="text-nexora-text">
                                {item.quantity}
                              </strong>
                            </span>

                            <span>
                              Unit price:{" "}
                              <strong className="text-nexora-text">
                                {formatCurrency(
                                  item.originalUnitPrice
                                )}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* LINE TOTAL */}

                      <div className="mt-4 flex items-center justify-between border-t border-nexora-border pt-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-nexora-taupe">
                          Returned Merchandise
                        </span>

                        <span className="text-sm font-black text-nexora-primary">
                          {formatCurrency(
                            item.lineSubtotal
                          )}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </Section>

          {/* ================= CUSTOMER ================= */}

          <Section
            eyebrow="Customer"
            title="Customer Information"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail
                label="Name"
                value={customerName}
              />

              <Detail
                label="Phone"
                value={customerPhone}
              />

              <Detail
                label="User ID"
                value={returnRequest.userId}
                mono
              />

              <Detail
                label="Order Date"
                value={orderDate}
              />
            </div>

            {shippingAddress.address && (
              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-nexora-taupe">
                  Shipping Address
                </p>

                <p className="mt-2 text-sm leading-6 text-nexora-text">
                  {shippingAddress.address}

                  {shippingAddress.city
                    ? `, ${shippingAddress.city}`
                    : ""}

                  {shippingAddress.state
                    ? `, ${shippingAddress.state}`
                    : ""}

                  {shippingAddress.pincode
                    ? ` - ${shippingAddress.pincode}`
                    : ""}
                </p>
              </div>
            )}
          </Section>

          {/* ================= ORDER ================= */}

          <Section
            eyebrow="Order"
            title="Payment & Order Summary"
          >
            {order ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail
                    label="Order Status"
                    value={formatText(
                      order.status ||
                        "Not available"
                    )}
                  />

                  <Detail
                    label="Payment Method"
                    value={
                      paymentMethod
                        ? paymentMethod ===
                          "cod"
                          ? "Cash on Delivery"
                          : formatText(
                              paymentMethod
                            )
                        : "Not available"
                    }
                  />

                  <Detail
                    label="Payment Status"
                    value={
                      paymentStatus
                        ? formatText(
                            paymentStatus
                          )
                        : "Not available"
                    }
                  />

                  {order.paymentId && (
                    <Detail
                      label="Payment ID"
                      value={
                        order.paymentId
                      }
                      mono
                    />
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-nexora-border bg-nexora-ivory p-4">
                  <PriceRow
                    label="Order Subtotal"
                    value={formatCurrency(
                      orderSubtotal
                    )}
                  />

                  {orderDiscount > 0 && (
                    <PriceRow
                      label={
                        order.coupon?.code
                          ? `Discount (${order.coupon.code})`
                          : "Order Discount"
                      }
                      value={`-${formatCurrency(
                        orderDiscount
                      )}`}
                      accent
                    />
                  )}

                  <PriceRow
                    label="Shipping"
                    value={
                      orderShipping === 0
                        ? "Free"
                        : formatCurrency(
                            orderShipping
                          )
                    }
                  />

                  <div className="my-3 border-t border-nexora-border" />

                  <PriceRow
                    label="Order Total"
                    value={formatCurrency(
                      orderTotal
                    )}
                    strong
                  />
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-semibold text-amber-800">
                  The related order could
                  not be loaded.
                </p>
              </div>
            )}
          </Section>

          {/* ================= INSPECTION ================= */}

          {status === "completed" && (
            <Section
              eyebrow="Inspection"
              title="Inspection Result"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail
                  label="Condition"
                  value={
                    inspectionResult
                      ? formatText(
                          inspectionResult
                        )
                      : "Not available"
                  }
                />

                <Detail
                  label="Inspected"
                  value={inspectedDate}
                />

                <Detail
                  label="Stock Restored"
                  value={
                    returnRequest.stockRestored
                      ? "Yes"
                      : "No"
                  }
                />

                <Detail
                  label="Refund Status"
                  value={formatText(
                    refundStatus
                  )}
                />
              </div>

              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-nexora-taupe">
                  Inspection Note
                </p>

                <div className="mt-2 rounded-2xl border border-nexora-border bg-nexora-ivory px-4 py-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-nexora-text">
                    {returnRequest.inspectionNote ||
                      "No inspection note available."}
                  </p>
                </div>
              </div>

              {/* CORRECTION HISTORY */}

              {returnRequest.inspectionUpdatedAt && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-black text-amber-800">
                    Inspection corrected
                  </p>

                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <Detail
                      label="Last Corrected"
                      value={
                        inspectionUpdatedDate
                      }
                    />

                    <Detail
                      label="Correction Reason"
                      value={
                        returnRequest.inspectionUpdatedReason ||
                        "Not available"
                      }
                    />
                  </div>
                </div>
              )}

              {inspectionResult ===
                "resellable" &&
                returnRequest.stockRestored && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                    <p className="text-xs font-black text-emerald-800">
                      Inventory restored
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      The exact returned
                      quantity was added
                      back to sellable
                      inventory.
                    </p>
                  </div>
                )}

              {inspectionResult ===
                "defective" && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
                  <p className="text-xs font-black text-red-800">
                    Inventory not restored
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-700">
                    The returned product
                    was marked defective
                    or damaged and was not
                    added back to
                    sellable inventory.
                  </p>
                </div>
              )}

              {[
                "pending",
                "refunded",
              ].includes(
                refundStatus
              ) && (
                <div className="mt-5 rounded-2xl border border-nexora-border bg-nexora-ivory px-4 py-4">
                  <p className="text-xs font-black text-nexora-text">
                    Inspection locked
                  </p>

                  <p className="mt-1 text-xs leading-5 text-nexora-muted">
                    The inspection can no
                    longer be corrected
                    because the refund
                    workflow has started.
                  </p>
                </div>
              )}
            </Section>
          )}

          {/* ================= REFUND ================= */}

          {status === "completed" && (
            <Section
              eyebrow="Refund"
              title="Refund Processing"
            >
              {/* REFUND BREAKDOWN */}

              <div className="rounded-2xl border border-nexora-border bg-nexora-ivory p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-nexora-taupe">
                      Refund Breakdown
                    </p>

                    <p className="mt-1 text-xs text-nexora-muted">
                      Based on the
                      returned products
                      and the original
                      order pricing.
                    </p>
                  </div>

                  {refundStatus ===
                    "not_started" && (
                    <span className="rounded-full border border-nexora-primary/15 bg-nexora-primary-soft px-3 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-nexora-primary">
                      Preview
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  <PriceRow
                    label="Returned merchandise"
                    value={formatCurrency(
                      displayedReturnedSubtotal
                    )}
                  />

                  <PriceRow
                    label="Allocated order discount"
                    value={
                      displayedAllocatedDiscount >
                      0
                        ? `-${formatCurrency(
                            displayedAllocatedDiscount
                          )}`
                        : formatCurrency(
                            0
                          )
                    }
                    accent={
                      displayedAllocatedDiscount >
                      0
                    }
                  />

                  <PriceRow
                    label="Shipping refund"
                    value={formatCurrency(
                      displayedShippingRefund
                    )}
                  />

                  <div className="border-t border-nexora-border pt-3">
                    <PriceRow
                      label="Refund amount"
                      value={formatCurrency(
                        refundAmount
                      )}
                      strong
                    />
                  </div>
                </div>
              </div>

              {/* DISCOUNT EXPLANATION */}

              {displayedAllocatedDiscount >
                0 && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="text-xs font-black text-amber-800">
                    Order discount
                    allocated
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    This order received{" "}
                    {formatCurrency(
                      orderDiscount
                    )}{" "}
                    in total discounts.
                    The returned
                    merchandise receives
                    its proportional share
                    of that discount, so
                    the customer is
                    refunded the amount
                    actually paid for the
                    returned products.
                  </p>
                </div>
              )}

              {/* NOT STARTED */}

              {refundStatus ===
                "not_started" && (
                <>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Detail
                      label="Refund Amount"
                      value={
                        order
                          ? formatCurrency(
                              refundAmount
                            )
                          : "Not available"
                      }
                    />

                    <Detail
                      label="Payment Method"
                      value={
                        paymentMethod
                          ? paymentMethod ===
                            "cod"
                            ? "Cash on Delivery"
                            : formatText(
                                paymentMethod
                              )
                          : "Not available"
                      }
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-nexora-primary/15 bg-nexora-primary-soft/50 px-4 py-4">
                    <p className="text-xs font-black text-nexora-primary">
                      Refund preview
                    </p>

                    <p className="mt-1 text-xs leading-5 text-nexora-muted">
                      This preview uses
                      the original order
                      item prices and
                      allocates the
                      order-level discount
                      proportionally to
                      the returned
                      merchandise.
                      Shipping is not
                      refunded for this
                      item-level return.
                    </p>
                  </div>

                  {paymentStatus !==
                    "paid" && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                      <p className="text-xs font-black text-amber-800">
                        Payment is not
                        marked as paid
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        This order cannot
                        enter the refund
                        workflow until its
                        payment status is
                        Paid.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* PENDING */}

              {refundStatus ===
                "pending" && (
                <>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Detail
                      label="Refund Amount"
                      value={formatCurrency(
                        returnRequest.refundAmount
                      )}
                    />

                    <Detail
                      label="Started"
                      value={
                        refundStartedDate
                      }
                    />

                    <Detail
                      label="Payment Method"
                      value={
                        paymentMethod ===
                        "cod"
                          ? "Cash on Delivery"
                          : formatText(
                              paymentMethod ||
                                "Not available"
                            )
                      }
                    />

                    <Detail
                      label="Refund Status"
                      value="Pending"
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                    <p className="text-xs font-black text-amber-800">
                      Refund processing
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-700">
                      {paymentMethod ===
                      "razorpay"
                        ? "This frontend currently tracks the refund workflow only. A real Razorpay refund must later be executed securely by the .NET backend using the payment provider API."
                        : "This refund is being tracked as a manual refund. Mark it as refunded only after the customer has actually been reimbursed."}
                    </p>
                  </div>
                </>
              )}

              {/* REFUNDED */}

              {refundStatus ===
                "refunded" && (
                <>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Detail
                      label="Refund Amount"
                      value={formatCurrency(
                        returnRequest.refundAmount
                      )}
                    />

                    <Detail
                      label="Refund Started"
                      value={
                        refundStartedDate
                      }
                    />

                    <Detail
                      label="Refund Completed"
                      value={refundedDate}
                    />

                    <Detail
                      label="Refund Status"
                      value="Refunded"
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                    <p className="text-xs font-black text-emerald-800">
                      Refund recorded as
                      completed
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      The refund workflow
                      for this return has
                      been finalized. The
                      inspection and
                      inventory decision
                      are now locked.
                    </p>
                  </div>
                </>
              )}
            </Section>
          )}

          {/* ================= STATUS MESSAGES ================= */}

          {status === "requested" && (
            <StatusMessage
              type="primary"
              title="Review required"
            >
              Approving this request
              only accepts the
              customer's return
              request. It does not
              automatically restore
              stock or issue a refund.
            </StatusMessage>
          )}

          {status === "approved" && (
            <StatusMessage
              type="success"
              title="Return approved"
            >
              The customer is now
              authorized to return the
              selected product or
              products. Mark the return
              as received only after the
              physical products have
              arrived.
            </StatusMessage>
          )}

          {status === "received" && (
            <StatusMessage
              type="primary"
              title="Product received — inspection required"
            >
              Inspect the returned
              products before completing
              the return. Resellable
              products may return to
              inventory; defective
              products must not.
            </StatusMessage>
          )}

          {status === "completed" &&
            refundStatus ===
              "not_started" && (
              <StatusMessage
                type="success"
                title="Inspection completed"
              >
                Product inspection is
                complete. Review the
                item-level refund
                calculation before
                starting the refund
                workflow.
              </StatusMessage>
            )}

          {status === "completed" &&
            refundStatus ===
              "pending" && (
              <StatusMessage
                type="primary"
                title="Refund in progress"
              >
                The refund workflow has
                started. Inspection
                corrections are now
                locked.
              </StatusMessage>
            )}

          {status === "completed" &&
            refundStatus ===
              "refunded" && (
              <StatusMessage
                type="success"
                title="Return finalized"
              >
                The return inspection
                and refund workflow have
                both been completed.
              </StatusMessage>
            )}
        </div>

        {/* ================= FOOTER ================= */}

        <div className="border-t border-nexora-border bg-nexora-surface px-6 py-5 sm:px-8">
          {/* REQUESTED */}

          {status === "requested" ? (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <SecondaryButton
                onClick={onClose}
                disabled={isUpdating}
              >
                Close
              </SecondaryButton>

              <button
                type="button"
                onClick={onReject}
                disabled={isUpdating}
                className="
                  rounded-full border border-red-200
                  bg-red-50 px-5 py-3
                  text-xs font-bold text-red-700
                  hover:bg-red-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Reject Return
              </button>

              <PrimaryButton
                onClick={onApprove}
                disabled={isUpdating}
              >
                {isUpdating
                  ? "Updating..."
                  : "Approve Return"}
              </PrimaryButton>
            </div>
          ) : status === "approved" ? (
            /* APPROVED */

            <FooterAction
              title="Waiting for returned product"
              description="Confirm only after the returned product has physically arrived."
            >
              <SecondaryButton
                onClick={onClose}
                disabled={isUpdating}
              >
                Close
              </SecondaryButton>

              <PrimaryButton
                onClick={
                  onMarkReceived
                }
                disabled={isUpdating}
              >
                {isUpdating
                  ? "Updating..."
                  : "Mark as Received"}
              </PrimaryButton>
            </FooterAction>
          ) : status === "received" ? (
            /* RECEIVED */

            <FooterAction
              title="Inspection required"
              description="Inspect the product before completing this return."
            >
              <SecondaryButton
                onClick={onClose}
                disabled={isUpdating}
              >
                Close
              </SecondaryButton>

              <PrimaryButton
                onClick={onInspect}
                disabled={isUpdating}
              >
                {isUpdating
                  ? "Processing..."
                  : "Inspect Return"}
              </PrimaryButton>
            </FooterAction>
          ) : status === "completed" ? (
            /* COMPLETED */

            <div className="flex flex-col gap-4">
              {/* NOT STARTED */}

              {refundStatus ===
                "not_started" && (
                <>
                  <div>
                    <p className="text-xs font-bold text-nexora-text">
                      Ready for refund
                      review
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-nexora-muted">
                      You may still
                      correct the
                      inspection until
                      the refund process
                      begins.
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <SecondaryButton
                      onClick={onClose}
                      disabled={
                        isUpdating
                      }
                    >
                      Close
                    </SecondaryButton>

                    {canEditInspection && (
                      <button
                        type="button"
                        onClick={
                          onEditInspection
                        }
                        disabled={
                          isUpdating
                        }
                        className="
                          rounded-full
                          border border-amber-300
                          bg-amber-50
                          px-5 py-3
                          text-xs font-bold
                          text-amber-800
                          hover:bg-amber-100
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        Edit Inspection
                      </button>
                    )}

                    <PrimaryButton
                      onClick={
                        onStartRefund
                      }
                      disabled={
                        isUpdating ||
                        !canStartRefund
                      }
                    >
                      {isRefundUpdating
                        ? "Starting Refund..."
                        : `Start Refund • ${formatCurrency(
                            refundAmount
                          )}`}
                    </PrimaryButton>
                  </div>
                </>
              )}

              {/* PENDING */}

              {refundStatus ===
                "pending" && (
                <>
                  <div>
                    <p className="text-xs font-bold text-nexora-text">
                      Refund pending
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-nexora-muted">
                      Inspection is
                      locked. Mark the
                      refund as completed
                      only after
                      reimbursement has
                      been confirmed.
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <SecondaryButton
                      onClick={onClose}
                      disabled={
                        isUpdating
                      }
                    >
                      Close
                    </SecondaryButton>

                    <PrimaryButton
                      onClick={
                        onCompleteRefund
                      }
                      disabled={
                        isUpdating ||
                        !canCompleteRefund
                      }
                    >
                      {isRefundUpdating
                        ? "Updating Refund..."
                        : "Mark Refunded"}
                    </PrimaryButton>
                  </div>
                </>
              )}

              {/* REFUNDED */}

              {refundStatus ===
                "refunded" && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-800">
                      Refund completed
                    </p>

                    <p className="mt-1 text-[11px] text-nexora-muted">
                      This return is
                      finalized and its
                      inspection is
                      locked.
                    </p>
                  </div>

                  <SecondaryButton
                    onClick={onClose}
                    disabled={
                      isUpdating
                    }
                  >
                    Close
                  </SecondaryButton>
                </div>
              )}
            </div>
          ) : (
            /* FINAL / OTHER */

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-nexora-muted">
                Return status:{" "}
                <strong className="capitalize text-nexora-text">
                  {status}
                </strong>
              </p>

              <PrimaryButton
                onClick={onClose}
                disabled={isUpdating}
              >
                Close
              </PrimaryButton>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

/* =====================================================
   SECTION
===================================================== */

const Section = ({
  eyebrow,
  title,
  children,
}) => (
  <section className="rounded-2xl border border-nexora-border bg-nexora-surface p-5">
    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-nexora-taupe">
      {eyebrow}
    </p>

    <h3 className="mt-1 text-base font-black text-nexora-text">
      {title}
    </h3>

    <div className="mt-5">
      {children}
    </div>
  </section>
);

/* =====================================================
   DETAIL
===================================================== */

const Detail = ({
  label,
  value,
  mono = false,
}) => (
  <div>
    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-nexora-taupe">
      {label}
    </p>

    <p
      className={`
        mt-1.5 break-words
        text-sm font-semibold
        text-nexora-text
        ${
          mono
            ? "font-mono text-xs"
            : ""
        }
      `}
    >
      {value || "Not available"}
    </p>
  </div>
);

/* =====================================================
   INFO CARD
===================================================== */

const InfoCard = ({
  label,
  children,
}) => (
  <div className="rounded-2xl border border-nexora-border bg-nexora-ivory p-4">
    <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-nexora-taupe">
      {label}
    </p>

    {children}
  </div>
);

/* =====================================================
   PRICE ROW
===================================================== */

const PriceRow = ({
  label,
  value,
  strong = false,
  accent = false,
}) => (
  <div className="flex items-center justify-between gap-6">
    <span
      className={
        strong
          ? "text-sm font-black text-nexora-text"
          : "text-xs text-nexora-muted"
      }
    >
      {label}
    </span>

    <span
      className={`
        text-right
        ${
          strong
            ? "text-lg font-black text-nexora-primary"
            : "text-xs font-bold text-nexora-text"
        }
        ${
          accent
            ? "!text-emerald-700"
            : ""
        }
      `}
    >
      {value}
    </span>
  </div>
);

/* =====================================================
   STATUS MESSAGE
===================================================== */

const StatusMessage = ({
  type,
  title,
  children,
}) => {
  const style =
    type === "success"
      ? "border-emerald-200 bg-emerald-50"
      : "border-nexora-primary/15 bg-nexora-primary-soft/60";

  const titleStyle =
    type === "success"
      ? "text-emerald-800"
      : "text-nexora-primary";

  const textStyle =
    type === "success"
      ? "text-emerald-700"
      : "text-nexora-muted";

  return (
    <div
      className={`rounded-2xl border px-5 py-5 ${style}`}
    >
      <p
        className={`text-xs font-black ${titleStyle}`}
      >
        {title}
      </p>

      <p
        className={`mt-2 text-xs leading-5 ${textStyle}`}
      >
        {children}
      </p>
    </div>
  );
};

/* =====================================================
   BUTTONS
===================================================== */

const PrimaryButton = ({
  children,
  ...props
}) => (
  <button
    type="button"
    {...props}
    className="
      rounded-full
      bg-nexora-primary
      px-5 py-3
      text-xs font-bold
      text-white
      hover:bg-nexora-primary-hover
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
  >
    {children}
  </button>
);

const SecondaryButton = ({
  children,
  ...props
}) => (
  <button
    type="button"
    {...props}
    className="
      rounded-full
      border border-nexora-border
      px-5 py-3
      text-xs font-bold
      text-nexora-text
      hover:border-nexora-primary
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
  >
    {children}
  </button>
);

/* =====================================================
   FOOTER ACTION
===================================================== */

const FooterAction = ({
  title,
  description,
  children,
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-xs font-bold text-nexora-text">
        {title}
      </p>

      <p className="mt-1 text-[11px] text-nexora-muted">
        {description}
      </p>
    </div>

    <div className="flex gap-3">
      {children}
    </div>
  </div>
);

export default ReturnDetailsDrawer;