import productImages from "../../../constants/productImages";

const ProductRow = ({
  product,
  onEdit,
  onDelete,
}) => {
  /* ================= PRODUCT IMAGE ================= */

  const productImage =
    productImages[String(product.id)] ||
    product.thumbnail ||
    "";

  /* ================= STOCK ================= */

  const stock = Number(
    product.stock || 0
  );

  const isOutOfStock =
    stock === 0;

  const isLowStock =
    stock > 0 &&
    stock <= 5;

  /* ================= STOCK STATUS ================= */

  const getStockStatus = () => {
    if (isOutOfStock) {
      return {
        label: "Out of stock",

        className:
          "bg-red-50 text-red-700 ring-red-200",

        dotClass:
          "bg-red-500",
      };
    }

    if (isLowStock) {
      return {
        label: "Low stock",

        className:
          "bg-amber-50 text-amber-700 ring-amber-200",

        dotClass:
          "bg-amber-500",
      };
    }

    return {
      label: "In stock",

      className:
        "bg-emerald-50 text-emerald-700 ring-emerald-200",

      dotClass:
        "bg-emerald-500",
    };
  };

  const stockStatus =
    getStockStatus();

  return (
    <tr
      className="
        group
        border-b
        border-nexora-border
        transition-colors
        duration-200
        last:border-b-0
        hover:bg-nexora-ivory/60
      "
    >
      {/* ================= PRODUCT ================= */}

      <td className="px-5 py-4 sm:px-6">
        <div
          className="
            flex
            min-w-60
            items-center
            gap-4
          "
        >
          {/* IMAGE */}

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              border
              border-nexora-border
              bg-nexora-ivory
            "
          >
            {productImage ? (
              <img
                src={productImage}
                alt={
                  product.name ||
                  "Product"
                }
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
                strokeWidth="1.5"
                className="
                  h-5
                  w-5
                  text-nexora-taupe
                "
                aria-hidden="true"
              >
                <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />

                <path d="m4 7.5 8 4.5 8-4.5" />

                <path d="M12 12v9" />
              </svg>
            )}
          </div>

          {/* PRODUCT INFO */}

          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm
                font-bold
                text-nexora-text
                transition-colors
                group-hover:text-nexora-primary
              "
            >
              {product.name}
            </p>

            <div
              className="
                mt-1
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  text-[11px]
                  text-nexora-muted
                "
              >
                #{product.id}
              </span>

              {product.brand && (
                <>
                  <span
                    className="
                      h-1
                      w-1
                      rounded-full
                      bg-nexora-taupe
                    "
                  />

                  <span
                    className="
                      text-[11px]
                      text-nexora-muted
                    "
                  >
                    {product.brand}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* ================= CATEGORY ================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-4
          sm:px-6
        "
      >
        <span
          className="
            inline-flex
            rounded-lg
            border
            border-nexora-border
            bg-nexora-ivory
            px-2.5
            py-1.5
            text-xs
            font-medium
            text-nexora-muted
          "
        >
          {product.category ||
            "Uncategorized"}
        </span>
      </td>

      {/* ================= PRICE ================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-4
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
            product.price || 0
          ).toLocaleString(
            "en-IN"
          )}
        </p>
      </td>

      {/* ================= STOCK ================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-4
          sm:px-6
        "
      >
        <p
          className={`
            text-sm
            font-bold

            ${
              isOutOfStock
                ? "text-red-600"
                : isLowStock
                  ? "text-amber-600"
                  : "text-nexora-text"
            }
          `}
        >
          {stock}
        </p>

        <p
          className="
            mt-0.5
            text-[10px]
            text-nexora-muted
          "
        >
          units
        </p>
      </td>

      {/* ================= STATUS ================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-4
          sm:px-6
        "
      >
        <span
          className={`
            inline-flex
            items-center
            gap-2
            rounded-full
            px-2.5
            py-1.5
            text-[11px]
            font-semibold
            ring-1
            ring-inset

            ${stockStatus.className}
          `}
        >
          <span
            className={`
              h-1.5
              w-1.5
              rounded-full

              ${stockStatus.dotClass}
            `}
          />

          {stockStatus.label}
        </span>
      </td>

      {/* ================= ACTIONS ================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-4
          text-right
          sm:px-6
        "
      >
        <div
          className="
            flex
            items-center
            justify-end
            gap-2
          "
        >
          {/* EDIT */}

          <button
            type="button"
            onClick={() =>
              onEdit(product)
            }
            aria-label={`Edit ${product.name}`}
            title="Edit product"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-nexora-border
              bg-nexora-surface
              text-nexora-muted
              transition
              hover:border-nexora-primary/30
              hover:bg-nexora-primary-soft
              hover:text-nexora-primary
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 20h9" />

              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
            </svg>
          </button>

          {/* DELETE */}

          <button
            type="button"
            onClick={() =>
              onDelete(product)
            }
            aria-label={`Delete ${product.name}`}
            title="Delete product"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-nexora-border
              bg-nexora-surface
              text-nexora-muted
              transition
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M3 6h18" />

              <path d="M8 6V4h8v2" />

              <path d="M19 6 18 20H6L5 6" />

              <path d="M10 11v5M14 11v5" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;