const ORDER_STEPS = [
  {
    key: "placed",
    label: "Order Placed",
    shortLabel: "Placed",
    description: "Order received",
  },
  {
    key: "processing",
    label: "Processing",
    shortLabel: "Processing",
    description: "Being prepared",
  },
  {
    key: "shipped",
    label: "Shipped",
    shortLabel: "Shipped",
    description: "On the way",
  },
  {
    key: "delivered",
    label: "Delivered",
    shortLabel: "Delivered",
    description: "Order delivered",
  },
];

const STATUS_INDEX = {
  placed: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
};

const OrderTrackingTimeline = ({ status }) => {
  const normalizedStatus = (status || "placed").toLowerCase();

  const isCancelled = normalizedStatus === "cancelled";
  const currentIndex = STATUS_INDEX[normalizedStatus] ?? 0;

  /* ================= CANCELLED ================= */

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-bold text-red-700">
              Order Cancelled
            </p>

            <p className="mt-1 text-xs leading-5 text-red-600">
              This order has been cancelled and will not continue
              through the delivery process.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ================= NORMAL TIMELINE ================= */

  return (
    <div className="rounded-2xl border border-nexora-border bg-nexora-surface px-5 py-6 sm:px-6 lg:px-8">
      {/* ================= HEADER ================= */}

      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-nexora-text">
            Order Tracking
          </p>

          <p className="mt-1 text-xs text-nexora-muted">
            Follow the progress of your order.
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-nexora-primary" />

          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-primary">
            {ORDER_STEPS[currentIndex].label}
          </span>
        </div>
      </div>

      {/* =====================================================
          DESKTOP / TABLET HORIZONTAL TIMELINE
      ===================================================== */}

      <div className="hidden sm:block">
        {/* ================= PROGRESS ================= */}

        <div className="relative mx-auto max-w-5xl">
          {/* BACKGROUND LINE */}

          <div className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-nexora-border" />

          {/* ACTIVE LINE */}

          <div
            className="absolute left-[12.5%] top-5 h-px bg-nexora-primary transition-all duration-500"
            style={{
              width:
                currentIndex === 0
                  ? "0%"
                  : `${(currentIndex / (ORDER_STEPS.length - 1)) * 75}%`,
            }}
          />

          {/* ================= STEPS ================= */}

          <div className="relative grid grid-cols-4">
            {ORDER_STEPS.map((step, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isReached = index <= currentIndex;

              return (
                <div
                  key={step.key}
                  className="flex flex-col items-center px-2 text-center"
                >
                  {/* ================= INDICATOR ================= */}

                  <div className="relative z-10 flex h-10 items-center justify-center">
                    {isCurrent && (
                      <span className="absolute h-12 w-12 rounded-full bg-nexora-primary/10" />
                    )}

                    <div
                      className={`
                        relative
                        z-10
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        transition-all
                        duration-300
                        ${
                          isReached
                            ? "border-nexora-primary bg-nexora-primary text-white shadow-[0_6px_18px_rgba(18,63,50,0.18)]"
                            : "border-nexora-border bg-nexora-surface text-nexora-taupe"
                        }
                      `}
                    >
                      {isCompleted ||
                      (isCurrent && step.key === "delivered") ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m5 12 4 4L19 6"
                          />
                        </svg>
                      ) : isCurrent ? (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-nexora-border" />
                      )}
                    </div>
                  </div>

                  {/* ================= LABEL ================= */}

                  <div className="mt-4">
                    <div className="flex min-h-6 flex-wrap items-center justify-center gap-1.5">
                      <p
                        className={`text-xs font-bold sm:text-sm ${
                          isReached
                            ? "text-nexora-text"
                            : "text-nexora-muted"
                        }`}
                      >
                        {step.label}
                      </p>

                      {isCurrent && (
                        <span className="rounded-full bg-nexora-primary-soft px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-nexora-primary">
                          Current
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-1.5 text-[11px] ${
                        isReached
                          ? "text-nexora-muted"
                          : "text-nexora-taupe"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE VERTICAL TIMELINE
      ===================================================== */}

      <div className="sm:hidden">
        {ORDER_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isReached = index <= currentIndex;
          const isLast = index === ORDER_STEPS.length - 1;

          return (
            <div key={step.key} className="relative flex gap-4">
              {/* ================= INDICATOR ================= */}

              <div className="relative flex flex-col items-center">
                <div
                  className={`
                    relative
                    z-10
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    ${
                      isReached
                        ? "border-nexora-primary bg-nexora-primary text-white"
                        : "border-nexora-border bg-nexora-surface text-nexora-taupe"
                    }
                  `}
                >
                  {isCompleted ||
                  (isCurrent && step.key === "delivered") ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m5 12 4 4L19 6"
                      />
                    </svg>
                  ) : isCurrent ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-nexora-border" />
                  )}
                </div>

                {!isLast && (
                  <div
                    className={`min-h-10 w-px flex-1 ${
                      index < currentIndex
                        ? "bg-nexora-primary"
                        : "bg-nexora-border"
                    }`}
                  />
                )}
              </div>

              {/* ================= CONTENT ================= */}

              <div className={isLast ? "pb-0" : "pb-5"}>
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-sm font-bold ${
                      isReached
                        ? "text-nexora-text"
                        : "text-nexora-muted"
                    }`}
                  >
                    {step.label}
                  </p>

                  {isCurrent && (
                    <span className="rounded-full bg-nexora-primary-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-nexora-primary">
                      Current
                    </span>
                  )}
                </div>

                <p
                  className={`mt-1 text-xs ${
                    isReached
                      ? "text-nexora-muted"
                      : "text-nexora-taupe"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTrackingTimeline;