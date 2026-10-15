import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#123F32",
  "#A65E3B",
  "#A18D80",
  "#5B7FA3",
  "#4F8A68",
  "#D6A84B",
  "#765D69",
  "#668C8C",
];

const ProductCategoryChart = ({
  products = [],
}) => {
  /* ================= CATEGORY COUNTS ================= */

  const categoryCounts =
    products.reduce(
      (
        result,
        product
      ) => {
        const category =
          product.category ||
          "Other";

        result[category] =
          (result[category] ||
            0) + 1;

        return result;
      },
      {}
    );

  /* ================= CHART DATA ================= */

  const data =
    Object.entries(
      categoryCounts
    )
      .map(
        ([
          name,
          value,
        ]) => ({
          name,
          value,
        })
      )
      .sort(
        (a, b) =>
          b.value - a.value
      );

  /* ================= EMPTY ================= */

  if (data.length === 0) {
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
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.18em]
            text-nexora-taupe
          "
        >
          Catalog
        </p>

        <h2
          className="
            mt-2
            text-lg
            font-bold
            text-nexora-text
          "
        >
          Product Categories
        </h2>

        <div
          className="
            flex
            h-64
            items-center
            justify-center
          "
        >
          <p
            className="
              text-sm
              text-nexora-muted
            "
          >
            No product data available.
          </p>
        </div>
      </section>
    );
  }

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
          Catalog
        </p>

        <h2
          className="
            mt-2
            text-lg
            font-bold
            text-nexora-text
          "
        >
          Product Categories
        </h2>

        <p
          className="
            mt-1
            text-xs
            text-nexora-muted
          "
        >
          Distribution of products
          across your catalog.
        </p>
      </div>

      {/* ================= PIE CHART ================= */}

      <div
        className="
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
              outerRadius={100}
              paddingAngle={2}
              stroke="#FFFDF8"
              strokeWidth={3}
            >
              {data.map(
                (
                  entry,
                  index
                ) => (
                  <Cell
                    key={
                      entry.name
                    }
                    fill={
                      COLORS[
                        index %
                          COLORS.length
                      ]
                    }
                  />
                )
              )}
            </Pie>

            <Tooltip
              content={
                <CategoryTooltip />
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ================= LEGEND ================= */}

      <div
        className="
          grid
          grid-cols-2
          gap-x-4
          gap-y-3
        "
      >
        {data.map(
          (
            item,
            index
          ) => (
            <div
              key={item.name}
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div
                className="
                  flex
                  min-w-0
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
                      COLORS[
                        index %
                          COLORS.length
                      ],
                  }}
                />

                <span
                  className="
                    truncate
                    text-xs
                    text-nexora-muted
                  "
                >
                  {item.name}
                </span>
              </div>

              <span
                className="
                  text-xs
                  font-bold
                  text-nexora-text
                "
              >
                {item.value}
              </span>
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

const CategoryTooltip = ({
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
      <p
        className="
          text-xs
          font-semibold
          text-nexora-muted
        "
      >
        {data.name}
      </p>

      <p
        className="
          mt-1
          text-lg
          font-bold
          text-nexora-text
        "
      >
        {data.value}{" "}
        {data.value === 1
          ? "product"
          : "products"}
      </p>
    </div>
  );
};

export default ProductCategoryChart;