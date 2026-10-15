import {
  useMemo,
} from "react";

/* =====================================================
   HELPERS
===================================================== */

const formatAdjustmentType = (
  type
) => {
  if (type === "add") {
    return "Add Stock";
  }

  if (type === "remove") {
    return "Remove Stock";
  }

  if (type === "set") {
    return "Set Stock";
  }

  return "Adjustment";
};

const formatDate = (
  date
) => {
  if (!date) {
    return "—";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "—";
  }

  return parsedDate.toLocaleString(
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
   QUANTITY LABEL
===================================================== */

const getQuantityLabel = (
  adjustment
) => {
  const quantity =
    Number(
      adjustment.quantity
    ) || 0;

  if (
    adjustment.type ===
    "add"
  ) {
    return `+${quantity}`;
  }

  if (
    adjustment.type ===
    "remove"
  ) {
    return `-${quantity}`;
  }

  const difference =
    Number(
      adjustment.newStock
    ) -
    Number(
      adjustment.previousStock
    );

  if (difference > 0) {
    return `+${difference}`;
  }

  if (difference < 0) {
    return `${difference}`;
  }

  return "0";
};

/* =====================================================
   VARIANT DETECTION

   Old/simple adjustment records either:
   - do not contain variantId
   - contain variantId: null

   Both are treated as simple-product records.
===================================================== */

const isVariantAdjustment = (
  adjustment
) => {
  return Boolean(
    adjustment?.variantId
  );
};

/* =====================================================
   STOCK VALUE

   Prevent undefined/null values from appearing
   in the audit UI.
===================================================== */

const formatStock = (
  stock
) => {
  const value =
    Number(stock);

  if (
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return value;
};

/* =====================================================
   TYPE BADGE
===================================================== */

const TypeBadge = ({
  type,
}) => {
  const styles = {
    add: `
      bg-emerald-50
      text-emerald-700
      ring-emerald-600/20
    `,

    remove: `
      bg-red-50
      text-red-700
      ring-red-600/20
    `,

    set: `
      bg-blue-50
      text-blue-700
      ring-blue-600/20
    `,
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-black
        uppercase
        tracking-[0.08em]
        ring-1
        ring-inset

        ${
          styles[type] ||
          `
            bg-nexora-taupe-soft
            text-nexora-muted
            ring-nexora-border
          `
        }
      `}
    >
      {formatAdjustmentType(
        type
      )}
    </span>
  );
};

/* =====================================================
   VARIANT BADGE
===================================================== */

const VariantBadge = ({
  label,
}) => {
  if (!label) {
    return null;
  }

  return (
    <span
      className="
        inline-flex
        items-center
        rounded-full
        bg-nexora-primary-soft
        px-2.5
        py-1
        text-[10px]
        font-black
        text-nexora-primary
        ring-1
        ring-inset
        ring-nexora-primary/10
      "
    >
      {label}
    </span>
  );
};

/* =====================================================
   STOCK CHANGE CARD
===================================================== */

const StockChangeCard = ({
  previousStock,
  newStock,
  label,
}) => {
  return (
    <div
      className="
        rounded-xl
        border
        border-nexora-border
        bg-white
        px-4
        py-3
      "
    >
      {label && (
        <p
          className="
            mb-3
            text-[9px]
            font-black
            uppercase
            tracking-[0.12em]
            text-nexora-muted
          "
        >
          {label}
        </p>
      )}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        {/* PREVIOUS */}

        <div>
          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-wider
              text-nexora-muted
            "
          >
            Previous
          </p>

          <p
            className="
              mt-0.5
              text-lg
              font-black
              text-nexora-text
            "
          >
            {formatStock(
              previousStock
            )}
          </p>
        </div>

        {/* ARROW */}

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="
            h-4
            w-4
            text-nexora-muted
          "
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 12h14"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15 8 4 4-4 4"
          />
        </svg>

        {/* NEW */}

        <div>
          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-wider
              text-nexora-muted
            "
          >
            New
          </p>

          <p
            className="
              mt-0.5
              text-lg
              font-black
              text-nexora-primary
            "
          >
            {formatStock(
              newStock
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   HISTORY COMPONENT
===================================================== */

const InventoryAdjustmentHistory = ({
  adjustments = [],
  loading = false,
}) => {
  /* =====================================================
     SORT NEWEST FIRST
  ===================================================== */

  const sortedAdjustments =
    useMemo(() => {
      return [
        ...adjustments,
      ].sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );
    }, [adjustments]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
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
        <div
          className="
            flex
            min-h-40
            items-center
            justify-center
          "
        >
          <div className="text-center">
            <div
              className="
                mx-auto
                h-7
                w-7
                animate-spin
                rounded-full
                border-4
                border-nexora-primary-soft
                border-t-nexora-primary
              "
            />

            <p
              className="
                mt-3
                text-xs
                font-semibold
                text-nexora-muted
              "
            >
              Loading adjustment
              history...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-nexora-border
        bg-nexora-surface
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex
          flex-col
          gap-2
          border-b
          border-nexora-border
          px-5
          py-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.18em]
              text-nexora-copper
            "
          >
            Audit Trail
          </p>

          <h2
            className="
              mt-1
              text-lg
              font-black
              text-nexora-text
            "
          >
            Recent Stock
            Adjustments
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-nexora-muted
            "
          >
            Manual product and
            variant inventory
            changes made through
            the admin console.
          </p>
        </div>

        <div
          className="
            rounded-xl
            bg-nexora-primary-soft
            px-3
            py-2
            text-xs
            font-black
            text-nexora-primary
          "
        >
          {
            sortedAdjustments.length
          }{" "}
          {sortedAdjustments.length ===
          1
            ? "record"
            : "records"}
        </div>
      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {sortedAdjustments.length ===
      0 ? (
        <div
          className="
            flex
            min-h-[220px]
            items-center
            justify-center
            px-6
            py-10
          "
        >
          <div
            className="
              max-w-sm
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-nexora-primary-soft
                text-nexora-primary
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 4h14v16H5z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 8h8"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h8"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16h5"
                />
              </svg>
            </div>

            <h3
              className="
                mt-4
                text-sm
                font-black
                text-nexora-text
              "
            >
              No stock
              adjustments yet
            </h3>

            <p
              className="
                mt-2
                text-xs
                leading-5
                text-nexora-muted
              "
            >
              Manual stock changes
              will appear here after
              an administrator
              adjusts inventory.
            </p>
          </div>
        </div>
      ) : (
        /* =================================================
           HISTORY LIST
        ================================================= */

        <div
          className="
            divide-y
            divide-nexora-border
          "
        >
          {sortedAdjustments.map(
            (adjustment) => {
              const quantityLabel =
                getQuantityLabel(
                  adjustment
                );

              const previousStock =
                Number(
                  adjustment.previousStock
                );

              const newStock =
                Number(
                  adjustment.newStock
                );

              const isIncrease =
                newStock >
                previousStock;

              const isDecrease =
                newStock <
                previousStock;

              const variantAdjustment =
                isVariantAdjustment(
                  adjustment
                );

              /*
               * New variant records contain
               * parent-stock snapshots.
               *
               * Old records do not, so we
               * only render this section when
               * those values are actually
               * available.
               */

              const hasProductStockSnapshot =
                adjustment.previousProductStock !==
                  undefined &&
                adjustment.previousProductStock !==
                  null &&
                adjustment.newProductStock !==
                  undefined &&
                adjustment.newProductStock !==
                  null;

              return (
                <article
                  key={
                    adjustment.id
                  }
                  className="
                    px-5
                    py-5
                    transition
                    hover:bg-nexora-ivory/60
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-4
                      lg:flex-row
                      lg:items-start
                      lg:justify-between
                    "
                  >
                    {/* ================= PRODUCT ================= */}

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
                        <h3
                          className="
                            text-sm
                            font-black
                            text-nexora-text
                          "
                        >
                          {adjustment.productName ||
                            "Unknown Product"}
                        </h3>

                        <TypeBadge
                          type={
                            adjustment.type
                          }
                        />

                        {variantAdjustment && (
                          <VariantBadge
                            label={
                              adjustment.variantLabel ||
                              adjustment.variantId
                            }
                          />
                        )}
                      </div>

                      <div
                        className="
                          mt-1
                          flex
                          flex-wrap
                          items-center
                          gap-x-3
                          gap-y-1
                        "
                      >
                        <p
                          className="
                            text-xs
                            text-nexora-muted
                          "
                        >
                          {adjustment.productCategory ||
                            "Uncategorized"}
                        </p>

                        {variantAdjustment && (
                          <p
                            className="
                              text-[10px]
                              font-semibold
                              text-nexora-muted
                            "
                          >
                            Variant ID:{" "}
                            {
                              adjustment.variantId
                            }
                          </p>
                        )}
                      </div>

                      {/* ================= STOCK CHANGE ================= */}

                      <div
                        className="
                          mt-4
                          flex
                          flex-wrap
                          items-center
                          gap-3
                        "
                      >
                        <StockChangeCard
                          previousStock={
                            adjustment.previousStock
                          }
                          newStock={
                            adjustment.newStock
                          }
                          label={
                            variantAdjustment
                              ? "Variant Stock"
                              : "Product Stock"
                          }
                        />

                        {/* CHANGE AMOUNT */}

                        <span
                          className={`
                            rounded-full
                            px-3
                            py-1.5
                            text-xs
                            font-black

                            ${
                              isIncrease
                                ? `
                                  bg-emerald-50
                                  text-emerald-700
                                `
                                : isDecrease
                                  ? `
                                    bg-red-50
                                    text-red-700
                                  `
                                  : `
                                    bg-nexora-taupe-soft
                                    text-nexora-muted
                                  `
                            }
                          `}
                        >
                          {
                            quantityLabel
                          }
                        </span>
                      </div>

                      {/* ================= PARENT PRODUCT STOCK ================= */}

                      {variantAdjustment &&
                        hasProductStockSnapshot && (
                          <div
                            className="
                              mt-3
                              max-w-sm
                            "
                          >
                            <StockChangeCard
                              previousStock={
                                adjustment.previousProductStock
                              }
                              newStock={
                                adjustment.newProductStock
                              }
                              label="Total Product Stock"
                            />

                            <p
                              className="
                                mt-2
                                text-[10px]
                                leading-4
                                text-nexora-muted
                              "
                            >
                              Total stock is
                              recalculated from
                              all product
                              configurations.
                            </p>
                          </div>
                        )}

                      {/* ================= REASON ================= */}

                      <div
                        className="
                          mt-4
                          rounded-xl
                          bg-nexora-ivory
                          px-4
                          py-3
                        "
                      >
                        <p
                          className="
                            text-[9px]
                            font-black
                            uppercase
                            tracking-[0.12em]
                            text-nexora-muted
                          "
                        >
                          Reason
                        </p>

                        <p
                          className="
                            mt-1
                            text-sm
                            leading-5
                            text-nexora-text
                          "
                        >
                          {adjustment.reason ||
                            "No reason provided"}
                        </p>
                      </div>
                    </div>

                    {/* ================= DATE ================= */}

                    <div
                      className="
                        shrink-0
                        lg:text-right
                      "
                    >
                      <p
                        className="
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.12em]
                          text-nexora-muted
                        "
                      >
                        Adjusted
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          font-semibold
                          text-nexora-text
                        "
                      >
                        {formatDate(
                          adjustment.createdAt
                        )}
                      </p>

                      <p
                        className="
                          mt-2
                          text-[10px]
                          text-nexora-muted
                        "
                      >
                        ID:{" "}
                        {adjustment.id}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          text-nexora-muted
                        "
                      >
                        {variantAdjustment
                          ? "Variant adjustment"
                          : "Product adjustment"}
                      </p>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </section>
  );
};

export default InventoryAdjustmentHistory;