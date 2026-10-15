import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const STATUS_CONFIG = {
  placed: {
    label: "Placed",
    color: "#123F32",
  },

  processing: {
    label: "Processing",
    color: "#D6A84B",
  },

  shipped: {
    label: "Shipped",
    color: "#5B7FA3",
  },

  delivered: {
    label: "Delivered",
    color: "#4F8A68",
  },

  cancelled: {
    label: "Cancelled",
    color: "#B85C5C",
  },
};

const OrderStatusChart = ({
  counts = {},
}) => {
  /* ================= CHART DATA ================= */

  const data = Object.entries(
    STATUS_CONFIG
  ).map(
    ([
      status,
      config,
    ]) => ({
      name: config.label,

      value:
        counts[status] || 0,

      color:
        config.color,
    })
  );

  const totalOrders =
    data.reduce(
      (total, item) =>
        total + item.value,
      0
    );

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
          Fulfilment
        </p>

        <h2
          className="
            mt-2
            text-lg
            font-bold
            text-nexora-text
          "
        >
          Order Distribution
        </h2>

        <p
          className="
            mt-1
            text-xs
            text-nexora-muted
          "
        >
          Orders grouped by
          fulfilment status.
        </p>
      </div>

      {/* ================= CHART ================= */}

      <div
        className="
          relative
          mt-5
          h-[250px]
          w-full
        "
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={100}
              paddingAngle={3}
              stroke="none"
            >
              {data.map(
                (entry) => (
                  <Cell
                    key={
                      entry.name
                    }
                    fill={
                      entry.color
                    }
                  />
                )
              )}
            </Pie>

            <Tooltip
              content={
                <StatusTooltip />
              }
            />
          </PieChart>
        </ResponsiveContainer>

        {/* ================= CENTER VALUE ================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            flex
            items-center
            justify-center
          "
        >
          <div className="text-center">
            <p
              className="
                text-3xl
                font-black
                text-nexora-text
              "
            >
              {totalOrders}
            </p>

            <p
              className="
                mt-1
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-nexora-muted
              "
            >
              Orders
            </p>
          </div>
        </div>
      </div>

      {/* ================= LEGEND ================= */}

      <div
        className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-3
        "
      >
        {data.map(
          (item) => (
            <div
              key={item.name}
              className="
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  h-2.5
                  w-2.5
                  shrink-0
                  rounded-full
                "
                style={{
                  backgroundColor:
                    item.color,
                }}
              />

              <div
                className="
                  min-w-0
                "
              >
                <p
                  className="
                    truncate
                    text-xs
                    text-nexora-muted
                  "
                >
                  {item.name}
                </p>

                <p
                  className="
                    text-sm
                    font-bold
                    text-nexora-text
                  "
                >
                  {item.value}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

/* =====================================================
   TOOLTIP
===================================================== */

const StatusTooltip = ({
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
    payload[0].payload;

  return (
    <div
      className="
        rounded-xl
        border
        border-nexora-border
        bg-nexora-surface
        px-4
        py-3
        shadow-xl
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <span
          className="
            h-2
            w-2
            rounded-full
          "
          style={{
            backgroundColor:
              data.color,
          }}
        />

        <p
          className="
            text-xs
            font-semibold
            text-nexora-muted
          "
        >
          {data.name}
        </p>
      </div>

      <p
        className="
          mt-2
          text-lg
          font-bold
          text-nexora-text
        "
      >
        {data.value}
      </p>
    </div>
  );
};

export default OrderStatusChart;