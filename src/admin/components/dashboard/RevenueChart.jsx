import { useMemo } from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* =====================================================
   CONSTANTS
===================================================== */

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/* =====================================================
   COMPONENT
===================================================== */

const RevenueChart = ({
  orders = [],
}) => {
  /* ================= CHART DATA ================= */

  const chartData = useMemo(() => {
    const monthlyRevenue = Array.from(
      { length: 12 },
      (_, index) => ({
        month: MONTH_NAMES[index],
        revenue: 0,
        orders: 0,
      })
    );

    orders.forEach((order) => {
      /*
        Do not count cancelled orders
        as revenue.
      */

      if (
        order.status ===
        "cancelled"
      ) {
        return;
      }

      if (!order.createdAt) {
        return;
      }

      const date = new Date(
        order.createdAt
      );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }

      const monthIndex =
        date.getMonth();

      monthlyRevenue[
        monthIndex
      ].revenue += Number(
        order.total || 0
      );

      monthlyRevenue[
        monthIndex
      ].orders += 1;
    });

    return monthlyRevenue;
  }, [orders]);

  /* ================= FORMAT PRICE ================= */

  const formatCurrency = (
    value
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(
      Number(value || 0)
    );
  };

  /* ================= AXIS FORMAT ================= */

  const formatYAxis = (
    value
  ) => {
    const amount =
      Number(value || 0);

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

  /* ================= UI ================= */

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
          flex-col
          gap-2
          sm:flex-row
          sm:items-start
          sm:justify-between
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
            Performance
          </p>

          <h2
            className="
              mt-2
              text-lg
              font-bold
              text-nexora-text
            "
          >
            Revenue Overview
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-nexora-muted
            "
          >
            Monthly revenue from
            non-cancelled orders.
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            text-xs
            font-medium
            text-nexora-muted
          "
        >
          <span
            className="
              h-2
              w-2
              rounded-full
              bg-nexora-primary
            "
          />

          Revenue
        </div>
      </div>

      {/* ================= CHART ================= */}

      <div
        className="
          mt-8
          h-[320px]
          w-full
        "
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            {/* GRID */}

            <CartesianGrid
              stroke="#E3DED5"
              strokeDasharray="4 4"
              vertical={false}
            />

            {/* X AXIS */}

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#6F7772",
                fontSize: 12,
              }}
              dy={10}
            />

            {/* Y AXIS */}

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#6F7772",
                fontSize: 12,
              }}
              tickFormatter={
                formatYAxis
              }
              width={65}
            />

            {/* TOOLTIP */}

            <Tooltip
              cursor={{
                stroke: "#A18D80",
                strokeDasharray:
                  "4 4",
              }}
              content={
                <RevenueTooltip
                  formatCurrency={
                    formatCurrency
                  }
                />
              }
            />

            {/* REVENUE LINE */}

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#123F32"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#FAF7F0",
                stroke: "#123F32",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "#123F32",
                stroke: "#FFFDF8",
                strokeWidth: 3,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

/* =====================================================
   CUSTOM TOOLTIP
===================================================== */

const RevenueTooltip = ({
  active,
  payload,
  label,
  formatCurrency,
}) => {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  const data =
    payload[0]?.payload;

  return (
    <div
      className="
        min-w-40
        rounded-xl
        border
        border-nexora-border
        bg-nexora-surface
        p-4
        shadow-xl
      "
    >
      <p
        className="
          text-xs
          font-bold
          text-nexora-muted
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-base
          font-bold
          text-nexora-primary
        "
      >
        {formatCurrency(
          data?.revenue
        )}
      </p>

      <p
        className="
          mt-1
          text-xs
          text-nexora-muted
        "
      >
        {data?.orders || 0}{" "}
        {(data?.orders || 0) === 1
          ? "order"
          : "orders"}
      </p>
    </div>
  );
};

export default RevenueChart;