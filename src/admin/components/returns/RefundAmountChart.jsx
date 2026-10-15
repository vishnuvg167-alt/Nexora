import { useMemo } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* =====================================================
   HELPERS
===================================================== */

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;

const formatCompactCurrency = (value) => {
  const amount = Number(value || 0);

  if (amount >= 10000000) {
    return `₹${(
      amount / 10000000
    ).toFixed(1)}Cr`;
  }

  if (amount >= 100000) {
    return `₹${(
      amount / 100000
    ).toFixed(1)}L`;
  }

  if (amount >= 1000) {
    return `₹${Math.round(
      amount / 1000
    )}K`;
  }

  return `₹${amount}`;
};

const formatDate = (value) => {
  if (!value) {
    return "Unknown date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown date";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
};

const formatFullDate = (
  value
) => {
  if (!value) {
    return "Unknown date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown date";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/* =====================================================
   TOOLTIP
===================================================== */

const RefundTooltip = ({
  active,
  payload,
}) => {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  const data =
    payload[0]?.payload;

  if (!data) {
    return null;
  }

  return (
    <div
      className="
        min-w-[230px]
        rounded-2xl
        border border-nexora-border
        bg-nexora-surface
        p-4
        shadow-xl
      "
    >
      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
            Refund
          </p>

          <p className="mt-1 text-sm font-black text-nexora-text">
            {data.productName}
          </p>

        </div>

        <span
          className="
            rounded-full
            bg-emerald-50
            px-2.5 py-1
            text-[9px] font-bold
            uppercase tracking-[0.08em]
            text-emerald-700
          "
        >
          Refunded
        </span>

      </div>

      <p className="mt-4 text-xl font-black text-nexora-primary">
        {formatCurrency(
          data.amount
        )}
      </p>

      <div className="mt-4 space-y-2 border-t border-nexora-border pt-3">

        <TooltipRow
          label="Date"
          value={
            formatFullDate(
              data.date
            )
          }
        />

        <TooltipRow
          label="Return"
          value={`#${data.returnId}`}
          mono
        />

        <TooltipRow
          label="Order"
          value={`#${data.orderId}`}
          mono
        />

        {data.quantity >
          0 && (
          <TooltipRow
            label="Quantity"
            value={
              data.quantity
            }
          />
        )}

      </div>

    </div>
  );
};

const TooltipRow = ({
  label,
  value,
  mono = false,
}) => (
  <div className="flex items-start justify-between gap-5">

    <span className="text-[10px] text-nexora-muted">
      {label}
    </span>

    <span
      className={`
        max-w-[145px]
        break-all text-right
        text-[10px] font-bold
        text-nexora-text
        ${
          mono
            ? "font-mono"
            : ""
        }
      `}
    >
      {value}
    </span>

  </div>
);

/* =====================================================
   COMPONENT
===================================================== */

const RefundAmountChart = ({
  returns = [],
}) => {
  /* =====================================================
     REFUNDED RETURNS
  ===================================================== */

  const refundedReturns =
    useMemo(() => {
      if (
        !Array.isArray(
          returns
        )
      ) {
        return [];
      }

      return returns
        .filter(
          (
            returnRequest
          ) =>
            (
              returnRequest.refundStatus ||
              ""
            ).toLowerCase() ===
              "refunded" &&
            Number(
              returnRequest.refundAmount
            ) > 0
        )
        .map(
          (
            returnRequest
          ) => {
            const items =
              Array.isArray(
                returnRequest.items
              )
                ? returnRequest.items
                : [];

            const firstItem =
              items[0];

            const totalQuantity =
              items.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  Number(
                    item.quantity ||
                    0
                  ),
                0
              );

            let productName =
              firstItem?.name ||
              "Returned product";

            if (
              items.length >
              1
            ) {
              productName +=
                ` +${items.length - 1} more`;
            }

            return {
              id:
                returnRequest.id,

              returnId:
                returnRequest.id,

              orderId:
                returnRequest.orderId,

              amount:
                Number(
                  returnRequest.refundAmount ||
                  0
                ),

              date:
                returnRequest.refundedAt ||
                returnRequest.refundStartedAt ||
                returnRequest.createdAt,

              productName,

              quantity:
                totalQuantity,

              variantLabel:
                firstItem?.variantLabel ||
                null,
            };
          }
        )
        .sort(
          (
            a,
            b
          ) =>
            new Date(
              a.date
            ).getTime() -
            new Date(
              b.date
            ).getTime()
        );
    }, [returns]);

  /* =====================================================
     CHART DATA
  ===================================================== */

  const chartData =
    useMemo(
      () =>
        refundedReturns.map(
          (
            refund,
            index
          ) => ({
            ...refund,

            label:
              refundedReturns.length <=
              8
                ? formatDate(
                    refund.date
                  )
                : `#${index + 1}`,
          })
        ),
      [refundedReturns]
    );

  /* =====================================================
     ANALYTICS
  ===================================================== */

  const totalRefunded =
    useMemo(
      () =>
        refundedReturns.reduce(
          (
            total,
            refund
          ) =>
            total +
            refund.amount,
          0
        ),
      [refundedReturns]
    );

  const averageRefund =
    refundedReturns.length >
    0
      ? totalRefunded /
        refundedReturns.length
      : 0;

  const largestRefund =
    useMemo(() => {
      if (
        refundedReturns.length ===
        0
      ) {
        return null;
      }

      return refundedReturns.reduce(
        (
          largest,
          current
        ) =>
          current.amount >
          largest.amount
            ? current
            : largest
      );
    }, [refundedReturns]);

  /* =====================================================
     EMPTY STATE
  ===================================================== */

  if (
    refundedReturns.length ===
    0
  ) {
    return (
      <section
        className="
          overflow-hidden
          rounded-[2rem]
          border border-nexora-border
          bg-nexora-surface
        "
      >

        <div className="px-6 py-6 sm:px-7">

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexora-taupe">
            Refund Analytics
          </p>

          <h2 className="mt-1 text-lg font-black text-nexora-text">
            Refund Activity
          </h2>

          <p className="mt-1 text-xs text-nexora-muted">
            Completed customer refunds will appear here.
          </p>

        </div>

        <div className="border-t border-nexora-border px-6 py-16 text-center">

          <div
            className="
              mx-auto flex h-14 w-14
              items-center justify-center
              rounded-full
              bg-nexora-primary-soft
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-6 w-6 text-nexora-primary"
            >
              <path d="M4 19V9" />
              <path d="M10 19V5" />
              <path d="M16 19v-7" />
              <path d="M22 19H2" />
            </svg>
          </div>

          <h3 className="mt-4 text-sm font-black text-nexora-text">
            No completed refunds
          </h3>

          <p className="mt-1 text-xs text-nexora-muted">
            Refund analytics will become available after the first refund is completed.
          </p>

        </div>

      </section>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section
      className="
        overflow-hidden
        rounded-[2rem]
        border border-nexora-border
        bg-nexora-surface
      "
    >

      {/* ================= HEADER ================= */}

      <div
        className="
          flex flex-col gap-6
          border-b border-nexora-border
          px-6 py-6
          sm:px-7
          xl:flex-row
          xl:items-center
          xl:justify-between
        "
      >

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexora-taupe">
            Refund Analytics
          </p>

          <h2 className="mt-1 text-lg font-black text-nexora-text">
            Refund Activity
          </h2>

          <p className="mt-1 text-xs text-nexora-muted">
            Completed refunds and their financial impact.
          </p>

        </div>

        {/* ================= KPI SUMMARY ================= */}

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">

          <Metric
            label="Total Refunded"
            value={
              formatCurrency(
                totalRefunded
              )
            }
          />

          <Metric
            label="Average Refund"
            value={
              formatCurrency(
                averageRefund
              )
            }
          />

          <Metric
            label="Refunds"
            value={
              refundedReturns.length
            }
          />

        </div>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="grid xl:grid-cols-[minmax(0,1fr)_270px]">

        {/* ================= CHART ================= */}

        <div className="min-w-0 px-4 py-6 sm:px-6">

          <div className="mb-5 flex items-center justify-between gap-4">

            <div>

              <p className="text-xs font-black text-nexora-text">
                Completed refunds
              </p>

              <p className="mt-1 text-[11px] text-nexora-muted">
                Each bar represents one completed refund.
              </p>

            </div>

            <div className="flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-nexora-primary" />

              <span className="text-[10px] font-semibold text-nexora-muted">
                Refunded amount
              </span>

            </div>

          </div>

          <div className="h-[320px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={
                  chartData
                }
                margin={{
                  top: 10,
                  right: 10,
                  left: 5,
                  bottom: 5,
                }}
                barCategoryGap="30%"
              >

                <CartesianGrid
                  vertical={
                    false
                  }
                  stroke="#E3DED5"
                  strokeDasharray="4 4"
                />

                <XAxis
                  dataKey="label"
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  tick={{
                    fill:
                      "#6F7772",

                    fontSize:
                      10,
                  }}
                  dy={
                    10
                  }
                />

                <YAxis
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  tickFormatter={
                    formatCompactCurrency
                  }
                  tick={{
                    fill:
                      "#6F7772",

                    fontSize:
                      10,
                  }}
                  width={
                    65
                  }
                />

                <Tooltip
                  cursor={{
                    fill:
                      "#FAF7F0",
                  }}
                  content={
                    <RefundTooltip />
                  }
                />

                <Bar
                  dataKey="amount"
                  radius={[
                    8,
                    8,
                    3,
                    3,
                  ]}
                  maxBarSize={
                    70
                  }
                >

                  {chartData.map(
                    (
                      entry
                    ) => (
                      <Cell
                        key={
                          entry.id
                        }
                        fill="#123F32"
                      />
                    )
                  )}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* ================= SIDE SUMMARY ================= */}

        <div
          className="
            border-t border-nexora-border
            bg-nexora-ivory/45
            p-6
            xl:border-l
            xl:border-t-0
          "
        >

          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
            Refund Summary
          </p>

          {/* LARGEST REFUND */}

          <div className="mt-5">

            <p className="text-[10px] font-semibold text-nexora-muted">
              Largest refund
            </p>

            <p className="mt-1 text-xl font-black text-nexora-primary">
              {formatCurrency(
                largestRefund?.amount
              )}
            </p>

            <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-5 text-nexora-text">
              {
                largestRefund?.productName
              }
            </p>

            <p className="mt-1 text-[10px] text-nexora-muted">
              {formatFullDate(
                largestRefund?.date
              )}
            </p>

          </div>

          <div className="my-5 border-t border-nexora-border" />

          {/* TOTAL */}

          <SummaryRow
            label="Completed refunds"
            value={
              refundedReturns.length
            }
          />

          <SummaryRow
            label="Total refunded"
            value={
              formatCurrency(
                totalRefunded
              )
            }
          />

          <SummaryRow
            label="Average"
            value={
              formatCurrency(
                averageRefund
              )
            }
          />

          <div
            className="
              mt-6 rounded-2xl
              border border-nexora-primary/10
              bg-nexora-primary-soft/50
              p-4
            "
          >

            <p className="text-[10px] font-black text-nexora-primary">
              Financial impact
            </p>

            <p className="mt-1 text-[10px] leading-5 text-nexora-muted">
              These figures include only refunds marked as completed.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
};

/* =====================================================
   METRIC
===================================================== */

const Metric = ({
  label,
  value,
}) => (
  <div>

    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-nexora-taupe">
      {label}
    </p>

    <p className="mt-1 whitespace-nowrap text-sm font-black text-nexora-primary">
      {value}
    </p>

  </div>
);

/* =====================================================
   SUMMARY ROW
===================================================== */

const SummaryRow = ({
  label,
  value,
}) => (
  <div className="mb-4 flex items-start justify-between gap-4">

    <p className="text-[10px] text-nexora-muted">
      {label}
    </p>

    <p className="text-right text-[11px] font-black text-nexora-text">
      {value}
    </p>

  </div>
);

export default RefundAmountChart;