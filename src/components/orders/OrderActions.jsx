const OrderActions = ({
  order,
  latestReturn,
  latestReplacement,
  returnableItems = [],
  replaceableItems = [],
  canCancel,
  canRequestReturn,
  canRequestReplacement,
  isCancelling,
  getReturnStatusLabel,
  getReplacementStatusLabel,
  onCancel,
  onReturn,
  onReplacement,
}) => {
  const orderStatus = (
    order?.status || "placed"
  ).toLowerCase();

  /* =====================================================
     STATUS CONTENT
  ===================================================== */

  const getStatusContent = () => {
    if (orderStatus === "cancelled") {
      return {
        eyebrow: "Order closed",
        title: "Order cancelled",
        description:
          "The ordered quantities have been returned to inventory.",
        type: "cancelled",
      };
    }

    if (orderStatus === "shipped") {
      return {
        eyebrow: "In transit",
        title: "Your order is on the way",
        description:
          "This order has already shipped and can no longer be cancelled.",
        type: "shipped",
      };
    }

    if (orderStatus === "delivered") {
      const returnCount = returnableItems.length;
      const replacementCount = replaceableItems.length;

      /* ================= BOTH AVAILABLE ================= */

      if (canRequestReturn && canRequestReplacement) {
        return {
          eyebrow: "After delivery",
          title: "Order delivered",
          description:
            "Eligible products can be returned or replaced according to their purchase policy.",
          type: "delivered",
        };
      }

      /* ================= RETURN ONLY ================= */

      if (canRequestReturn) {
        return {
          eyebrow: "After delivery",
          title: "Order delivered",
          description: `${returnCount} ${
            returnCount === 1
              ? "product remains"
              : "products remain"
          } eligible for return.`,
          type: "delivered",
        };
      }

      /* ================= REPLACEMENT ONLY ================= */

      if (canRequestReplacement) {
        return {
          eyebrow: "After delivery",
          title: "Order delivered",
          description: `${replacementCount} ${
            replacementCount === 1
              ? "product remains"
              : "products remain"
          } eligible for replacement.`,
          type: "delivered",
        };
      }

      /* ================= NO ACTIONS ================= */

      if (latestReturn || latestReplacement) {
        return {
          eyebrow: "After delivery",
          title: "Order delivered",
          description:
            "There are currently no additional products eligible for return or replacement.",
          type: "delivered",
        };
      }

      return {
        eyebrow: "After delivery",
        title: "Order delivered",
        description:
          "Return and replacement options are available only for eligible products within their applicable policy window.",
        type: "delivered",
      };
    }

    if (canCancel) {
      return {
        eyebrow: "Order options",
        title: "Need to change your order?",
        description:
          "You can cancel this order before it moves to the shipped stage.",
        type: "active",
      };
    }

    return {
      eyebrow: "Order update",
      title: "Order in progress",
      description:
        "We'll keep the tracking information updated as your order progresses.",
      type: "active",
    };
  };

  const statusContent = getStatusContent();

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-nexora-border bg-nexora-ivory/45">
      <div className="flex flex-col gap-6 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
        {/* ================= STATUS ================= */}

        <div className="flex min-w-0 items-start gap-4">
          <StatusIcon type={statusContent.type} />

          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
              {statusContent.eyebrow}
            </p>

            <h3
              className={`mt-1.5 text-sm font-black tracking-[-0.015em] ${
                orderStatus === "cancelled"
                  ? "text-red-700"
                  : "text-nexora-text"
              }`}
            >
              {statusContent.title}
            </h3>

            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-nexora-muted">
              {statusContent.description}
            </p>

            {/* =================================================
                AFTER-SALES ACTIVITY
            ================================================= */}

            {orderStatus === "delivered" &&
              (latestReturn || latestReplacement) && (
                <div className="mt-4 space-y-2.5">
                  {/* ================= RETURN ================= */}

                  {latestReturn && (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
                        Latest return
                      </span>

                      <ReturnStatusBadge
                        status={latestReturn.status}
                        label={
                          getReturnStatusLabel?.(
                            latestReturn.status
                          ) || "Return"
                        }
                      />
                    </div>
                  )}

                  {/* ================= REPLACEMENT ================= */}

                  {latestReplacement && (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
                        Latest replacement
                      </span>

                      <ReplacementStatusBadge
                        status={latestReplacement.status}
                        label={
                          getReplacementStatusLabel?.(
                            latestReplacement.status
                          ) || "Replacement"
                        }
                      />
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-nexora-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          {/* ================= CANCEL ================= */}

          {canCancel && (
            <button
              type="button"
              onClick={() => onCancel?.(order)}
              disabled={isCancelling}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-red-200 bg-nexora-surface px-5 text-xs font-bold text-red-700 transition-all duration-200 hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCancelling
                ? "Cancelling..."
                : "Cancel Order"}
            </button>
          )}

          {/* ================= RETURN ================= */}

          {canRequestReturn && (
            <button
              type="button"
              onClick={() => onReturn?.(order)}
              className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-nexora-primary bg-nexora-surface px-5 text-xs font-bold text-nexora-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-nexora-primary-soft"
            >
              Request Return

              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </button>
          )}

          {/* ================= REPLACEMENT ================= */}

          {canRequestReplacement && (
            <button
              type="button"
              onClick={() => onReplacement?.(order)}
              className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-nexora-primary px-5 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-nexora-primary-hover hover:shadow-[0_8px_20px_rgba(18,63,50,0.14)]"
            >
              Request Replacement

              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

/* =====================================================
   STATUS ICON
===================================================== */

const StatusIcon = ({ type }) => {
  const styles = {
    cancelled:
      "border-red-100 bg-red-50 text-red-600",

    shipped:
      "border-blue-100 bg-blue-50 text-blue-600",

    delivered:
      "border-nexora-primary/10 bg-nexora-primary-soft text-nexora-primary",

    active:
      "border-nexora-primary/10 bg-nexora-primary-soft text-nexora-primary",
  };

  const style = styles[type] || styles.active;

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${style}`}
    >
      {type === "cancelled" ? (
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
            d="M18 6 6 18M6 6l12 12"
          />
        </svg>
      ) : type === "delivered" ? (
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
      ) : type === "shipped" ? (
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
            d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"
          />

          <circle cx="7" cy="18" r="1.5" />
          <circle cx="18" cy="18" r="1.5" />
        </svg>
      ) : (
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
            d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4 7.5 8 4.5 8-4.5M12 12v9"
          />
        </svg>
      )}
    </div>
  );
};

/* =====================================================
   RETURN STATUS BADGE
===================================================== */

const ReturnStatusBadge = ({ status, label }) => {
  const normalizedStatus = (
    status || "requested"
  ).toLowerCase();

  const styles = {
    requested:
      "border-amber-200 bg-amber-50 text-amber-700",

    approved:
      "border-blue-200 bg-blue-50 text-blue-700",

    rejected:
      "border-red-200 bg-red-50 text-red-700",

    received:
      "border-nexora-primary/15 bg-nexora-primary-soft text-nexora-primary",

    completed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  const dotStyles = {
    requested: "bg-amber-500",
    approved: "bg-blue-500",
    rejected: "bg-red-500",
    received: "bg-nexora-primary",
    completed: "bg-emerald-500",
  };

  const style =
    styles[normalizedStatus] ||
    "border-nexora-border bg-nexora-taupe-soft text-nexora-muted";

  const dotStyle =
    dotStyles[normalizedStatus] ||
    "bg-nexora-taupe";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.11em] ${style}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotStyle}`}
      />

      {label}
    </span>
  );
};

/* =====================================================
   REPLACEMENT STATUS BADGE
===================================================== */

const ReplacementStatusBadge = ({
  status,
  label,
}) => {
  const normalizedStatus = (
    status || "requested"
  ).toLowerCase();

  const styles = {
    requested:
      "border-amber-200 bg-amber-50 text-amber-700",

    approved:
      "border-blue-200 bg-blue-50 text-blue-700",

    rejected:
      "border-red-200 bg-red-50 text-red-700",

    received:
      "border-violet-200 bg-violet-50 text-violet-700",

    inspected:
      "border-nexora-primary/15 bg-nexora-primary-soft text-nexora-primary",

    shipped:
      "border-sky-200 bg-sky-50 text-sky-700",

    delivered:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  const dotStyles = {
    requested: "bg-amber-500",
    approved: "bg-blue-500",
    rejected: "bg-red-500",
    received: "bg-violet-500",
    inspected: "bg-nexora-primary",
    shipped: "bg-sky-500",
    delivered: "bg-emerald-500",
  };

  const style =
    styles[normalizedStatus] ||
    "border-nexora-border bg-nexora-taupe-soft text-nexora-muted";

  const dotStyle =
    dotStyles[normalizedStatus] ||
    "bg-nexora-taupe";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.11em] ${style}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotStyle}`}
      />

      {label}
    </span>
  );
};

export default OrderActions;