const OrderRow = ({
  order,
  onViewOrder,
}) => {
  /* =====================================================
     ORDER DATA
  ===================================================== */

  const shippingAddress =
    order.shippingAddress || {};

  const items =
    Array.isArray(order.items)
      ? order.items
      : [];

  const orderStatus = (
    order.status || "placed"
  ).toLowerCase();

  const paymentStatus = (
    order.paymentStatus || "unknown"
  ).toLowerCase();

  const paymentMethod = (
    order.paymentMethod || "unknown"
  ).toLowerCase();

  /* =====================================================
     PAYMENT DISPLAY STATUS

     IMPORTANT:
     We do NOT change the database paymentStatus.

     JSON Server can still contain:
     paymentStatus: "pending"

     But when:
     - payment method = COD
     - order = cancelled
     - payment was pending

     the UI displays "No Payment".
  ===================================================== */

  const isCancelledCODWithoutPayment =
    paymentMethod === "cod" &&
    orderStatus === "cancelled" &&
    paymentStatus === "pending";

  const displayPaymentStatus =
    isCancelledCODWithoutPayment
      ? "no-payment"
      : paymentStatus;

  /* =====================================================
     ITEM COUNT
  ===================================================== */

  const itemCount =
    items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );

  /* =====================================================
     DATE
  ===================================================== */

  const formattedDate =
    order.createdAt
      ? new Date(
          order.createdAt
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )
      : "—";

  /* =====================================================
     PAYMENT METHOD LABEL
  ===================================================== */

  const getPaymentMethodLabel =
    () => {
      switch (paymentMethod) {
        case "razorpay":
          return "Razorpay";

        case "cod":
          return "Cash on Delivery";

        default:
          return "Unknown";
      }
    };

  /* =====================================================
     PAYMENT STATUS LABEL
  ===================================================== */

  const getPaymentStatusLabel =
    () => {
      switch (
        displayPaymentStatus
      ) {
        case "paid":
          return "Paid";

        case "pending":
          return "Pending";

        case "failed":
          return "Failed";

        case "refunded":
          return "Refunded";

        case "no-payment":
          return "No Payment";

        default:
          return "Unknown";
      }
    };

  /* =====================================================
     PAYMENT STATUS STYLE
  ===================================================== */

  const getPaymentStatusStyle =
    () => {
      switch (
        displayPaymentStatus
      ) {
        case "paid":
          return `
            border-emerald-200
            bg-emerald-50
            text-emerald-700
          `;

        case "pending":
          return `
            border-amber-200
            bg-amber-50
            text-amber-700
          `;

        case "failed":
          return `
            border-red-200
            bg-red-50
            text-red-700
          `;

        case "refunded":
          return `
            border-nexora-border
            bg-nexora-taupe-soft
            text-nexora-muted
          `;

        case "no-payment":
          return `
            border-red-200
            bg-red-50
            text-red-700
          `;

        default:
          return `
            border-nexora-border
            bg-nexora-ivory
            text-nexora-muted
          `;
      }
    };

  /* =====================================================
     ORDER STATUS STYLE
  ===================================================== */

  const getOrderStatusStyle =
    () => {
      switch (orderStatus) {
        case "placed":
          return `
            border-nexora-primary/15
            bg-nexora-primary-soft
            text-nexora-primary
          `;

        case "processing":
          return `
            border-amber-200
            bg-amber-50
            text-amber-700
          `;

        case "shipped":
          return `
            border-blue-200
            bg-blue-50
            text-blue-700
          `;

        case "delivered":
          return `
            border-emerald-200
            bg-emerald-50
            text-emerald-700
          `;

        case "cancelled":
          return `
            border-red-200
            bg-red-50
            text-red-700
          `;

        default:
          return `
            border-nexora-border
            bg-nexora-ivory
            text-nexora-muted
          `;
      }
    };

  /* =====================================================
     PAYMENT DOT STYLE
  ===================================================== */

  const getPaymentDotStyle =
    () => {
      switch (
        displayPaymentStatus
      ) {
        case "paid":
          return "bg-emerald-500";

        case "pending":
          return "bg-amber-500";

        case "failed":
          return "bg-red-500";

        case "refunded":
          return "bg-nexora-taupe";

        case "no-payment":
          return "bg-red-500";

        default:
          return "bg-nexora-muted";
      }
    };

  /* =====================================================
     ORDER STATUS DOT STYLE
  ===================================================== */

  const getOrderStatusDotStyle =
    () => {
      switch (orderStatus) {
        case "placed":
          return "bg-nexora-primary";

        case "processing":
          return "bg-amber-500";

        case "shipped":
          return "bg-blue-500";

        case "delivered":
          return "bg-emerald-500";

        case "cancelled":
          return "bg-red-500";

        default:
          return "bg-nexora-muted";
      }
    };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <tr
      className="
        border-b
        border-nexora-border
        transition
        last:border-b-0
        hover:bg-nexora-ivory/70
      "
    >
      {/* =================================================
          ORDER
      ================================================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-5
          align-middle
          sm:px-6
        "
      >
        <p
          className="
            text-sm
            font-bold
            text-nexora-primary
          "
        >
          #{order.id}
        </p>

        <p
          className="
            mt-1
            text-xs
            text-nexora-muted
          "
        >
          {formattedDate}
        </p>
      </td>

      {/* =================================================
          CUSTOMER
      ================================================= */}

      <td
        className="
          min-w-[190px]
          px-5
          py-5
          align-middle
          sm:px-6
        "
      >
        <p
          className="
            max-w-[190px]
            truncate
            text-sm
            font-semibold
            text-nexora-text
          "
          title={
            shippingAddress.name
          }
        >
          {shippingAddress.name ||
            "Unknown customer"}
        </p>

        <p
          className="
            mt-1
            max-w-[190px]
            truncate
            text-xs
            text-nexora-muted
          "
          title={
            shippingAddress.email
          }
        >
          {shippingAddress.email ||
            "No email"}
        </p>
      </td>

      {/* =================================================
          ITEMS
      ================================================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-5
          align-middle
          sm:px-6
        "
      >
        <div
          className="
            inline-flex
            items-center
            gap-2
          "
        >
          <span
            className="
              flex
              h-8
              min-w-8
              items-center
              justify-center
              rounded-lg
              bg-nexora-primary-soft
              px-2
              text-xs
              font-bold
              text-nexora-primary
            "
          >
            {itemCount}
          </span>

          <span
            className="
              text-xs
              text-nexora-muted
            "
          >
            {itemCount === 1
              ? "item"
              : "items"}
          </span>
        </div>
      </td>

      {/* =================================================
          TOTAL
      ================================================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-5
          align-middle
          sm:px-6
        "
      >
        <p
          className="
            text-sm
            font-bold
            text-nexora-text
          "
        >
          ₹
          {Number(
            order.total || 0
          ).toLocaleString(
            "en-IN"
          )}
        </p>

        <p
          className="
            mt-1
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.12em]
            text-nexora-taupe
          "
        >
          INR
        </p>
      </td>

      {/* =================================================
          PAYMENT
      ================================================= */}

      <td
        className="
          min-w-[180px]
          px-5
          py-5
          align-middle
          sm:px-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          {/* PAYMENT ICON */}

          <div
            className={`
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              ${
                paymentMethod === "cod"
                  ? isCancelledCODWithoutPayment
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
                  : paymentMethod ===
                      "razorpay"
                    ? "bg-nexora-primary-soft text-nexora-primary"
                    : "bg-nexora-ivory text-nexora-muted"
              }
            `}
          >
            {paymentMethod ===
            "cod" ? (
              isCancelledCODWithoutPayment ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <span
                  className="
                    text-sm
                    font-black
                  "
                >
                  ₹
                </span>
              )
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
                className="h-4 w-4"
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

          {/* PAYMENT DETAILS */}

          <div>
            <p
              className="
                text-xs
                font-semibold
                text-nexora-text
              "
            >
              {getPaymentMethodLabel()}
            </p>

            <div
              className={`
                mt-1
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-2
                py-0.5
                ${getPaymentStatusStyle()}
              `}
            >
              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${getPaymentDotStyle()}
                `}
              />

              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.1em]
                "
              >
                {getPaymentStatusLabel()}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* =================================================
          ORDER STATUS
      ================================================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-5
          align-middle
          sm:px-6
        "
      >
        <div
          className={`
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            px-3
            py-1.5
            ${getOrderStatusStyle()}
          `}
        >
          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${getOrderStatusDotStyle()}
            `}
          />

          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.1em]
            "
          >
            {orderStatus}
          </span>
        </div>
      </td>

      {/* =================================================
          ACTION
      ================================================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-5
          text-right
          align-middle
          sm:px-6
        "
      >
        <button
          type="button"
          onClick={() =>
            onViewOrder(order)
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-nexora-border
            bg-nexora-surface
            px-4
            py-2.5
            text-xs
            font-bold
            text-nexora-text
            transition
            hover:border-nexora-primary
            hover:bg-nexora-primary
            hover:text-white
          "
        >
          View

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            className="h-3.5 w-3.5"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </td>
    </tr>
  );
};

export default OrderRow;