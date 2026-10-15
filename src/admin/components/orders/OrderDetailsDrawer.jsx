import {
  useEffect,
  useState,
} from "react";

/* =====================================================
   ORDER STATUS WORKFLOW

   placed      -> processing / cancelled
   processing  -> shipped / cancelled
   shipped     -> delivered
   delivered   -> locked
   cancelled   -> locked
===================================================== */

const STATUS_TRANSITIONS = {
  placed: [
    "processing",
    "cancelled",
  ],

  processing: [
    "shipped",
    "cancelled",
  ],

  shipped: [
    "delivered",
  ],

  delivered: [],

  cancelled: [],
};

/* =====================================================
   HELPERS
===================================================== */

const getPaymentMethodLabel = (
  method
) => {
  switch (
    method?.toLowerCase()
  ) {
    case "razorpay":
      return "Razorpay";

    case "cod":
      return "Cash on Delivery";

    default:
      return "Not available";
  }
};

const getPaymentStatusLabel = (
  status
) => {
  switch (
    status?.toLowerCase()
  ) {
    case "paid":
      return "Paid";

    case "pending":
      return "Pending";

    case "failed":
      return "Failed";

    case "refunded":
      return "Refunded";

    default:
      return "Not available";
  }
};

/* =====================================================
   COMPONENT
===================================================== */

const OrderDetailsDrawer = ({
  order,
  isOpen,
  isUpdating,
  isUpdatingPayment,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onClose,
}) => {
  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("");

  const [
    updateError,
    setUpdateError,
  ] = useState("");

  /* =====================================================
     SYNC STATUS
  ===================================================== */

  useEffect(() => {
    if (!order) {
      return;
    }

    const currentStatus =
      (
        order.status ||
        "placed"
      ).toLowerCase();

    const nextStatuses =
      STATUS_TRANSITIONS[
        currentStatus
      ] || [];

    setSelectedStatus(
      nextStatuses[0] || ""
    );

    setUpdateError("");
  }, [order]);

  if (
    !isOpen ||
    !order
  ) {
    return null;
  }

  /* =====================================================
     ORDER DATA
  ===================================================== */

  const shippingAddress =
    order.shippingAddress ||
    {};

  const items =
    Array.isArray(
      order.items
    )
      ? order.items
      : [];

  const paymentStatus =
    (
      order.paymentStatus ||
      "unknown"
    ).toLowerCase();

  const paymentMethod =
    (
      order.paymentMethod ||
      "unknown"
    ).toLowerCase();

  const orderStatus =
    (
      order.status ||
      "placed"
    ).toLowerCase();

  const paymentMethodLabel =
    getPaymentMethodLabel(
      paymentMethod
    );

  const paymentStatusLabel =
    getPaymentStatusLabel(
      paymentStatus
    );

  const isCOD =
    paymentMethod ===
    "cod";

  const isRazorpay =
    paymentMethod ===
    "razorpay";

  const isCancelled =
    orderStatus ===
    "cancelled";

  /* =====================================================
     DISPLAY PAYMENT STATUS

     Database can remain:
     paymentStatus: "pending"

     Cancelled COD is displayed as
     "No Payment" because no cash was collected.
  ===================================================== */

  const displayPaymentStatus =
    isCancelled &&
    isCOD &&
    paymentStatus ===
      "pending"
      ? "No Payment"
      : paymentStatusLabel;

  /* =====================================================
     COD PAYMENT RULE
  ===================================================== */

  const canMarkCODAsPaid =
    isCOD &&
    paymentStatus ===
      "pending" &&
    orderStatus ===
      "delivered";

  /* =====================================================
     VALID NEXT STATUSES
  ===================================================== */

  const availableStatuses =
    STATUS_TRANSITIONS[
      orderStatus
    ] || [];

  const isFinalStatus =
    availableStatuses.length ===
    0;

  const canUpdateStatus =
    !isFinalStatus &&
    Boolean(
      selectedStatus
    ) &&
    availableStatuses.includes(
      selectedStatus
    ) &&
    !isUpdating &&
    !isUpdatingPayment;

  /* =====================================================
     DATE
  ===================================================== */

  const formattedDate =
    order.createdAt
      ? new Date(
          order.createdAt
        ).toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : "—";

  /* =====================================================
     PRICE FORMATTER
  ===================================================== */

  const formatPrice = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  /* =====================================================
     COUPON / DISCOUNT DATA
  ===================================================== */

  const discount =
    Math.max(
      0,
      Number(
        order.discount || 0
      )
    );

  const coupon =
    order.coupon ||
    null;

  const hasDiscount =
    discount > 0;

  const couponCode =
    coupon?.code || "";

  const couponType =
    coupon?.type || "";

  const couponValue =
    Number(
      coupon?.value || 0
    );

  const couponMaxDiscount =
    coupon?.maxDiscount != null
      ? Number(
          coupon.maxDiscount
        )
      : null;

  const getCouponDescription =
    () => {
      if (!coupon) {
        return "";
      }

      if (
        couponType ===
        "percentage"
      ) {
        const baseText =
          `${couponValue}% discount`;

        if (
          couponMaxDiscount &&
          couponMaxDiscount > 0
        ) {
          return `${baseText} · Max ${formatPrice(
            couponMaxDiscount
          )}`;
        }

        return baseText;
      }

      if (
        couponType ===
        "fixed"
      ) {
        return `${formatPrice(
          couponValue
        )} fixed discount`;
      }

      return "Discount applied";
    };

  /* =====================================================
     UPDATE ORDER STATUS
  ===================================================== */

  const handleStatusUpdate =
    async () => {
      if (
        !canUpdateStatus
      ) {
        return;
      }

      if (
        !availableStatuses.includes(
          selectedStatus
        )
      ) {
        setUpdateError(
          "Invalid order status transition."
        );

        return;
      }

      setUpdateError("");

      try {
        await onUpdateStatus(
          order.id,
          selectedStatus
        );
      } catch (error) {
        setUpdateError(
          typeof error ===
            "string"
            ? error
            : error?.message ||
                "Failed to update order status."
        );
      }
    };

  /* =====================================================
     MARK COD PAYMENT AS PAID
  ===================================================== */

  const handleMarkAsPaid =
    async () => {
      if (
        !canMarkCODAsPaid ||
        isUpdatingPayment
      ) {
        return;
      }

      setUpdateError("");

      try {
        await onUpdatePaymentStatus(
          order.id,
          "paid"
        );
      } catch (error) {
        setUpdateError(
          typeof error ===
            "string"
            ? error
            : error?.message ||
                "Failed to update payment status."
        );
      }
    };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="fixed inset-0 z-50">

      {/* ================= OVERLAY ================= */}

      <button
        type="button"
        aria-label="Close order details"
        onClick={
          isUpdating ||
          isUpdatingPayment
            ? undefined
            : onClose
        }
        className="
          absolute
          inset-0
          h-full
          w-full
          cursor-default
          bg-black/30
          backdrop-blur-[2px]
        "
      />

      {/* ================= DRAWER ================= */}

      <aside
        className="
          absolute
          right-0
          top-0
          flex
          h-full
          w-full
          max-w-xl
          flex-col
          border-l
          border-nexora-border
          bg-nexora-surface
          shadow-2xl
        "
      >

        {/* ================= HEADER ================= */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-nexora-border
            px-6
            py-5
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
              Order Details
            </p>

            <h2
              className="
                mt-2
                text-xl
                font-bold
                text-nexora-text
              "
            >
              #{order.id}
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-nexora-muted
              "
            >
              {formattedDate}
            </p>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isUpdating ||
              isUpdatingPayment
            }
            aria-label="Close"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-nexora-border
              text-nexora-muted
              hover:border-nexora-primary
              hover:bg-nexora-primary
              hover:text-white
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>

        </div>

        {/* ================= CONTENT ================= */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-6
            py-6
          "
        >

          <div className="space-y-6">

            {/* ================= STATUS CARDS ================= */}

            <section
              className="
                grid
                grid-cols-2
                gap-3
              "
            >

              <InfoCard
                label="Order Status"
                value={
                  orderStatus
                }
                type="status"
              />

              <InfoCard
                label="Payment"
                value={
                  displayPaymentStatus
                }
                type="payment"
              />

            </section>

            {/* ================= PAYMENT METHOD ================= */}

            <section
              className={`
                rounded-2xl
                border
                p-5
                ${
                  isCancelled &&
                  isCOD &&
                  paymentStatus ===
                    "pending"
                    ? "border-red-200 bg-red-50/40"
                    : isCOD
                      ? "border-amber-200 bg-amber-50/60"
                      : isRazorpay
                        ? "border-nexora-primary/15 bg-nexora-primary-soft/60"
                        : "border-nexora-border bg-nexora-ivory"
                }
              `}
            >

              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >

                <div
                  className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    ${
                      isCancelled &&
                      isCOD
                        ? "bg-red-100 text-red-700"
                        : isCOD
                          ? "bg-amber-100 text-amber-700"
                          : isRazorpay
                            ? "bg-nexora-primary text-white"
                            : "bg-nexora-taupe-soft text-nexora-muted"
                    }
                  `}
                >

                  {isCancelled &&
                  isCOD ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  ) : isCOD ? (
                    <span className="text-base font-black">
                      ₹
                    </span>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="6"
                        width="18"
                        height="12"
                        rx="2"
                      />

                      <path d="M3 10h18" />
                    </svg>
                  )}

                </div>

                <div>

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-nexora-taupe
                    "
                  >
                    Payment Method
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-bold
                      text-nexora-text
                    "
                  >
                    {
                      paymentMethodLabel
                    }
                  </p>

                  {isCOD &&
                    paymentStatus ===
                      "pending" && (
                      <p
                        className={`
                          mt-2
                          text-xs
                          leading-5
                          ${
                            isCancelled
                              ? "text-red-600"
                              : "text-amber-700"
                          }
                        `}
                      >
                        {isCancelled
                          ? "Order cancelled. No payment was collected."
                          : orderStatus ===
                              "delivered"
                            ? "Order delivered. Confirm the cash was collected before marking the payment as paid."
                            : "Payment will be collected when the order is delivered."}
                      </p>
                    )}

                  {isCOD &&
                    paymentStatus ===
                      "paid" && (
                      <p
                        className="
                          mt-2
                          text-xs
                          leading-5
                          text-emerald-700
                        "
                      >
                        COD payment has
                        been collected.
                      </p>
                    )}

                  {isRazorpay &&
                    paymentStatus ===
                      "paid" && (
                      <p
                        className="
                          mt-2
                          text-xs
                          leading-5
                          text-nexora-muted
                        "
                      >
                        Online payment
                        completed through
                        Razorpay.
                      </p>
                    )}

                </div>

              </div>

            </section>

            {/* ================= STATUS MANAGEMENT ================= */}

            <Section>

              <SectionTitle>
                Manage Order Status
              </SectionTitle>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-nexora-muted
                "
              >
                Move this order through
                its fulfilment workflow.
              </p>

              {isFinalStatus ? (
                <div
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-nexora-border
                    bg-nexora-ivory
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-nexora-primary-soft
                        text-nexora-primary
                      "
                    >

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <rect
                          x="5"
                          y="10"
                          width="14"
                          height="10"
                          rx="2"
                        />

                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>

                    </div>

                    <div>

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-nexora-text
                        "
                      >
                        Order{" "}

                        <span className="capitalize">
                          {
                            orderStatus
                          }
                        </span>
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-nexora-muted
                        "
                      >
                        This is a final
                        order status and
                        cannot be changed.
                      </p>

                    </div>

                  </div>

                </div>
              ) : (
                <>

                  <div
                    className="
                      mt-4
                      flex
                      items-center
                      justify-between
                      gap-4
                      rounded-xl
                      bg-nexora-ivory
                      px-4
                      py-3
                    "
                  >

                    <span
                      className="
                        text-xs
                        font-medium
                        text-nexora-muted
                      "
                    >
                      Current status
                    </span>

                    <span
                      className="
                        text-sm
                        font-bold
                        capitalize
                        text-nexora-primary
                      "
                    >
                      {
                        orderStatus
                      }
                    </span>

                  </div>

                  <div
                    className="
                      mt-4
                      flex
                      flex-col
                      gap-3
                      sm:flex-row
                    "
                  >

                    <select
                      value={
                        selectedStatus
                      }
                      onChange={(
                        event
                      ) => {
                        setSelectedStatus(
                          event.target
                            .value
                        );

                        setUpdateError(
                          ""
                        );
                      }}
                      disabled={
                        isUpdating ||
                        isUpdatingPayment
                      }
                      className="
                        h-11
                        flex-1
                        rounded-xl
                        border
                        border-nexora-border
                        bg-nexora-ivory
                        px-4
                        text-sm
                        font-semibold
                        capitalize
                        text-nexora-text
                        outline-none
                        focus:border-nexora-primary
                        focus:ring-2
                        focus:ring-nexora-primary/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >

                      {availableStatuses.map(
                        (status) => (
                          <option
                            key={
                              status
                            }
                            value={
                              status
                            }
                          >
                            {status
                              .charAt(
                                0
                              )
                              .toUpperCase() +
                              status.slice(
                                1
                              )}
                          </option>
                        )
                      )}

                    </select>

                    <button
                      type="button"
                      onClick={
                        handleStatusUpdate
                      }
                      disabled={
                        !canUpdateStatus
                      }
                      className="
                        min-w-36
                        rounded-xl
                        bg-nexora-primary
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        hover:bg-nexora-primary-hover
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {isUpdating
                        ? "Updating..."
                        : "Update Status"}
                    </button>

                  </div>

                  <p
                    className="
                      mt-3
                      text-xs
                      leading-5
                      text-nexora-muted
                    "
                  >
                    Available next
                    status
                    {availableStatuses.length >
                    1
                      ? "es"
                      : ""}
                    :{" "}

                    <span
                      className="
                        font-semibold
                        capitalize
                        text-nexora-text
                      "
                    >
                      {availableStatuses.join(
                        " / "
                      )}
                    </span>
                  </p>

                </>
              )}

              {updateError && (
                <p
                  className="
                    mt-3
                    text-sm
                    font-medium
                    text-red-600
                  "
                >
                  {
                    updateError
                  }
                </p>
              )}

            </Section>

            {/* ================= CUSTOMER ================= */}

            <Section>

              <SectionTitle>
                Customer
              </SectionTitle>

              <div
                className="
                  mt-4
                  space-y-3
                "
              >

                <DetailRow
                  label="Name"
                  value={
                    shippingAddress.name ||
                    "—"
                  }
                />

                <DetailRow
                  label="Email"
                  value={
                    shippingAddress.email ||
                    "—"
                  }
                />

                <DetailRow
                  label="Phone"
                  value={
                    shippingAddress.phone ||
                    "—"
                  }
                />

                <DetailRow
                  label="User ID"
                  value={
                    order.userId ||
                    "—"
                  }
                />

              </div>

            </Section>

            {/* ================= SHIPPING ================= */}

            <Section>

              <SectionTitle>
                Shipping Address
              </SectionTitle>

              <div
                className="
                  mt-4
                  rounded-xl
                  bg-nexora-ivory
                  p-4
                  text-sm
                  leading-6
                  text-nexora-text
                "
              >

                <p>
                  {shippingAddress.address ||
                    "Address unavailable"}
                </p>

                {(shippingAddress.city ||
                  shippingAddress.state ||
                  shippingAddress.pincode) && (
                  <p>
                    {[
                      shippingAddress.city,
                      shippingAddress.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}

                    {(shippingAddress.city ||
                      shippingAddress.state) &&
                    shippingAddress.pincode
                      ? " - "
                      : ""}

                    {
                      shippingAddress.pincode
                    }
                  </p>
                )}

              </div>

            </Section>

            {/* ================= PRODUCTS ================= */}

            <Section>

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <SectionTitle>
                  Products
                </SectionTitle>

                <span
                  className="
                    text-xs
                    font-semibold
                    text-nexora-muted
                  "
                >
                  {items.length}{" "}
                  {items.length === 1
                    ? "product"
                    : "products"}
                </span>

              </div>

              <div
                className="
                  mt-4
                  divide-y
                  divide-nexora-border
                "
              >

                {items.map(
                  (
                    item,
                    index
                  ) => (
                    <OrderItem
                      key={`${item.id}-${index}`}
                      item={
                        item
                      }
                      formatPrice={
                        formatPrice
                      }
                    />
                  )
                )}

              </div>

            </Section>

            {/* ================= PAYMENT ================= */}

            <Section>

              <SectionTitle>
                Payment Information
              </SectionTitle>

              <div
                className="
                  mt-4
                  space-y-3
                "
              >

                <DetailRow
                  label="Method"
                  value={
                    paymentMethodLabel
                  }
                />

                <DetailRow
                  label="Status"
                  value={
                    displayPaymentStatus
                  }
                />

                <DetailRow
                  label="Payment ID"
                  value={
                    order.paymentId ||
                    "—"
                  }
                />

              </div>

              {/* COD PENDING / CANCELLED */}

              {isCOD &&
                paymentStatus ===
                  "pending" && (
                  <div
                    className={`
                      mt-4
                      rounded-xl
                      border
                      px-4
                      py-4
                      ${
                        isCancelled
                          ? "border-red-200 bg-red-50"
                          : "border-amber-200 bg-amber-50"
                      }
                    `}
                  >

                    <div
                      className="
                        flex
                        items-start
                        gap-3
                      "
                    >

                      <div
                        className={`
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          text-sm
                          font-black
                          ${
                            isCancelled
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }
                        `}
                      >

                        {isCancelled ? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        ) : (
                          "₹"
                        )}

                      </div>

                      <div className="flex-1">

                        <p
                          className={`
                            text-xs
                            font-bold
                            ${
                              isCancelled
                                ? "text-red-800"
                                : "text-amber-800"
                            }
                          `}
                        >
                          {isCancelled
                            ? "No payment collected"
                            : "COD payment is pending"}
                        </p>

                        <p
                          className={`
                            mt-1
                            text-xs
                            leading-5
                            ${
                              isCancelled
                                ? "text-red-700"
                                : "text-amber-700/80"
                            }
                          `}
                        >
                          {isCancelled
                            ? "This Cash on Delivery order was cancelled before payment was collected."
                            : orderStatus ===
                                "delivered"
                              ? "The order has been delivered. Confirm the cash was collected before marking this payment as paid."
                              : "Payment should be collected when the order is delivered."}
                        </p>

                      </div>

                    </div>

                    {canMarkCODAsPaid && (
                      <button
                        type="button"
                        onClick={
                          handleMarkAsPaid
                        }
                        disabled={
                          isUpdatingPayment
                        }
                        className="
                          mt-4
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-nexora-primary
                          px-5
                          py-3
                          text-sm
                          font-bold
                          text-white
                          transition
                          hover:bg-nexora-primary-hover
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >

                        {isUpdatingPayment ? (
                          <>
                            <span
                              className="
                                h-4
                                w-4
                                animate-spin
                                rounded-full
                                border-2
                                border-white/30
                                border-t-white
                              "
                            />

                            Updating...
                          </>
                        ) : (
                          <>
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
                                d="m5 12 4 4L19 6"
                              />
                            </svg>

                            Mark as Paid
                          </>
                        )}

                      </button>
                    )}

                  </div>
                )}

              {/* COD PAID */}

              {isCOD &&
                paymentStatus ===
                  "paid" && (
                  <div
                    className="
                      mt-4
                      rounded-xl
                      border
                      border-emerald-200
                      bg-emerald-50
                      px-4
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

                      <span
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-emerald-600
                          text-xs
                          font-bold
                          text-white
                        "
                      >
                        ✓
                      </span>

                      <div>

                        <p
                          className="
                            text-xs
                            font-bold
                            text-emerald-800
                          "
                        >
                          COD payment
                          collected
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-emerald-700
                          "
                        >
                          This order has
                          been marked as
                          paid.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

            </Section>

            {/* ================= ORDER SUMMARY ================= */}

            <Section>

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div>

                  <SectionTitle>
                    Order Summary
                  </SectionTitle>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-nexora-muted
                    "
                  >
                    Final amount charged
                    for this order.
                  </p>

                </div>

                {hasDiscount &&
                  couponCode && (
                    <span
                      className="
                        shrink-0
                        rounded-full
                        border
                        border-emerald-200
                        bg-emerald-50
                        px-3
                        py-1
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-emerald-700
                      "
                    >
                      Coupon Applied
                    </span>
                  )}

              </div>

              <div
                className="
                  mt-5
                  space-y-3
                "
              >

                {/* SUBTOTAL */}

                <PriceRow
                  label="Subtotal"
                  value={formatPrice(
                    order.subtotal
                  )}
                />

                {/* COUPON DISCOUNT */}

                {hasDiscount && (
                  <div
                    className="
                      rounded-xl
                      border
                      border-emerald-200
                      bg-emerald-50/60
                      p-4
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

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                          "
                        >

                          <div
                            className="
                              flex
                              h-6
                              w-6
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-emerald-600
                              text-[10px]
                              font-black
                              text-white
                            "
                          >
                            %
                          </div>

                          <p
                            className="
                              text-xs
                              font-bold
                              text-emerald-800
                            "
                          >
                            Coupon Discount
                          </p>

                          {couponCode && (
                            <span
                              className="
                                rounded-full
                                bg-white
                                px-2.5
                                py-1
                                text-[9px]
                                font-black
                                uppercase
                                tracking-[0.12em]
                                text-emerald-700
                              "
                            >
                              {
                                couponCode
                              }
                            </span>
                          )}

                        </div>

                        {coupon && (
                          <p
                            className="
                              mt-2
                              text-[11px]
                              leading-5
                              text-emerald-700
                            "
                          >
                            {
                              getCouponDescription()
                            }
                          </p>
                        )}

                      </div>

                      <p
                        className="
                          shrink-0
                          text-sm
                          font-black
                          text-emerald-700
                        "
                      >
                        -
                        {formatPrice(
                          discount
                        )}
                      </p>

                    </div>

                  </div>
                )}

                {/* SHIPPING */}

                <PriceRow
                  label="Shipping"
                  value={
                    Number(
                      order.shipping ||
                        0
                    ) === 0
                      ? "Free"
                      : formatPrice(
                          order.shipping
                        )
                  }
                />

                {/* TOTAL */}

                <div
                  className="
                    border-t
                    border-nexora-border
                    pt-4
                  "
                >

                  <div
                    className="
                      flex
                      items-end
                      justify-between
                      gap-4
                    "
                  >

                    <div>

                      <p
                        className="
                          text-sm
                          font-bold
                          text-nexora-text
                        "
                      >
                        Order Total
                      </p>

                      <p
                        className="
                          mt-1
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-nexora-taupe
                        "
                      >
                        INR
                      </p>

                    </div>

                    <p
                      className="
                        text-2xl
                        font-black
                        tracking-[-0.03em]
                        text-nexora-primary
                      "
                    >
                      {formatPrice(
                        order.total
                      )}
                    </p>

                  </div>

                </div>

                {/* SAVINGS */}

                {hasDiscount &&
                  couponCode && (
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-emerald-200
                        bg-emerald-50
                        px-4
                        py-3
                      "
                    >

                      <span
                        className="
                          flex
                          h-5
                          w-5
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-emerald-600
                          text-[9px]
                          font-bold
                          text-white
                        "
                      >
                        ✓
                      </span>

                      <p
                        className="
                          text-[11px]
                          font-semibold
                          text-emerald-700
                        "
                      >
                        Customer saved{" "}

                        <span className="font-black">
                          {formatPrice(
                            discount
                          )}
                        </span>{" "}
                        with{" "}

                        <span className="font-black">
                          {
                            couponCode
                          }
                        </span>
                      </p>

                    </div>
                  )}

              </div>

            </Section>

          </div>

        </div>

        {/* ================= FOOTER ================= */}

        <div
          className="
            border-t
            border-nexora-border
            bg-nexora-ivory/70
            px-6
            py-4
          "
        >

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isUpdating ||
              isUpdatingPayment
            }
            className="
              w-full
              rounded-xl
              bg-nexora-primary
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              hover:bg-nexora-primary-hover
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Close
          </button>

        </div>

      </aside>

    </div>
  );
};

/* =====================================================
   SECTION
===================================================== */

const Section = ({
  children,
}) => {
  return (
    <section
      className="
        rounded-2xl
        border
        border-nexora-border
        bg-nexora-surface
        p-5
      "
    >
      {children}
    </section>
  );
};

/* =====================================================
   SECTION TITLE
===================================================== */

const SectionTitle = ({
  children,
}) => {
  return (
    <h3
      className="
        text-sm
        font-bold
        text-nexora-text
      "
    >
      {children}
    </h3>
  );
};

/* =====================================================
   DETAIL ROW
===================================================== */

const DetailRow = ({
  label,
  value,
}) => {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-6
      "
    >

      <span
        className="
          text-sm
          text-nexora-muted
        "
      >
        {label}
      </span>

      <span
        className="
          max-w-[65%]
          break-words
          text-right
          text-sm
          font-medium
          text-nexora-text
        "
      >
        {value}
      </span>

    </div>
  );
};

/* =====================================================
   PRICE ROW
===================================================== */

const PriceRow = ({
  label,
  value,
  total = false,
}) => {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
      "
    >

      <span
        className={
          total
            ? "font-bold text-nexora-text"
            : "text-sm text-nexora-muted"
        }
      >
        {label}
      </span>

      <span
        className={
          total
            ? "text-lg font-bold text-nexora-primary"
            : "text-sm font-semibold text-nexora-text"
        }
      >
        {value}
      </span>

    </div>
  );
};

/* =====================================================
   ORDER ITEM
===================================================== */

const OrderItem = ({
  item,
  formatPrice,
}) => {
  const quantity =
    Number(
      item.quantity || 1
    );

  const price =
    Number(
      item.price || 0
    );

  return (
    <div
      className="
        flex
        gap-4
        py-4
        first:pt-0
        last:pb-0
      "
    >

      <div
        className="
          flex
          h-16
          w-16
          shrink-0
          items-center
          justify-center
          overflow-hidden
          rounded-xl
          bg-nexora-ivory
        "
      >

        {item.thumbnail ? (
          <img
            src={
              item.thumbnail
            }
            alt={
              item.name ||
              "Product"
            }
            loading="lazy"
            className="
              h-full
              w-full
              object-contain
              p-1
            "
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
            className="
              h-6
              w-6
              text-nexora-taupe
            "
          >
            <path d="M6 2h12l3 5v15H3V7l3-5Z" />
            <path d="M3 7h18" />
          </svg>
        )}

      </div>

      <div
        className="
          min-w-0
          flex-1
        "
      >

        <p
          className="
            line-clamp-2
            text-sm
            font-semibold
            text-nexora-text
          "
        >
          {item.name ||
            "Product"}
        </p>

        <p
          className="
            mt-1
            text-xs
            text-nexora-muted
          "
        >
          Qty: {quantity}
        </p>

        <p
          className="
            mt-2
            text-sm
            font-bold
            text-nexora-primary
          "
        >
          {formatPrice(
            price *
              quantity
          )}
        </p>

      </div>

    </div>
  );
};

/* =====================================================
   INFO CARD
===================================================== */

const InfoCard = ({
  label,
  value,
  type,
}) => {
  const normalizedValue =
    value
      ?.toString()
      .toLowerCase() ||
    "unknown";

  let style =
    "bg-nexora-ivory text-nexora-muted";

  /* ================= PAYMENT ================= */

  if (
    type === "payment" &&
    normalizedValue ===
      "paid"
  ) {
    style =
      "bg-emerald-50 text-emerald-700";
  }

  if (
    type === "payment" &&
    normalizedValue ===
      "pending"
  ) {
    style =
      "bg-amber-50 text-amber-700";
  }

  if (
    type === "payment" &&
    normalizedValue ===
      "failed"
  ) {
    style =
      "bg-red-50 text-red-700";
  }

  if (
    type === "payment" &&
    normalizedValue ===
      "refunded"
  ) {
    style =
      "bg-nexora-taupe-soft text-nexora-muted";
  }

  if (
    type === "payment" &&
    normalizedValue ===
      "no payment"
  ) {
    style =
      "bg-red-50 text-red-700";
  }

  /* ================= ORDER STATUS ================= */

  if (
    type === "status" &&
    normalizedValue ===
      "placed"
  ) {
    style =
      "bg-nexora-primary-soft text-nexora-primary";
  }

  if (
    type === "status" &&
    normalizedValue ===
      "processing"
  ) {
    style =
      "bg-amber-50 text-amber-700";
  }

  if (
    type === "status" &&
    normalizedValue ===
      "shipped"
  ) {
    style =
      "bg-blue-50 text-blue-700";
  }

  if (
    type === "status" &&
    normalizedValue ===
      "delivered"
  ) {
    style =
      "bg-emerald-50 text-emerald-700";
  }

  if (
    type === "status" &&
    normalizedValue ===
      "cancelled"
  ) {
    style =
      "bg-red-50 text-red-700";
  }

  return (
    <div
      className={`
        rounded-2xl
        p-4
        ${style}
      `}
    >

      <p
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.14em]
          opacity-70
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-sm
          font-bold
          capitalize
        "
      >
        {value}
      </p>

    </div>
  );
};

export default OrderDetailsDrawer;