import ProductRow from "./ProductRow";

const ProductTable = ({
  products,
  onEdit,
  onDelete,
}) => {
  /* ================= EMPTY STATE ================= */

  if (!products?.length) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-nexora-border
          bg-nexora-surface
          px-6
          py-16
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
            strokeWidth="1.6"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />

            <path d="m4 7.5 8 4.5 8-4.5" />

            <path d="M12 12v9" />
          </svg>
        </div>

        <h3
          className="
            mt-4
            text-sm
            font-bold
            text-nexora-text
          "
        >
          No products found
        </h3>

        <p
          className="
            mt-1
            text-xs
            text-nexora-muted
          "
        >
          Try changing your search
          or filter.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-nexora-border
        bg-nexora-surface
      "
    >
      <div className="overflow-x-auto">

        <table className="w-full">

          {/* ================= HEADER ================= */}

          <thead
            className="
              border-b
              border-nexora-border
              bg-nexora-ivory
            "
          >
            <tr>

              <th
                className="
                  px-5
                  py-4
                  text-left
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-nexora-muted
                  sm:px-6
                "
              >
                Product
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-left
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-nexora-muted
                  sm:px-6
                "
              >
                Category
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-left
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-nexora-muted
                  sm:px-6
                "
              >
                Price
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-left
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-nexora-muted
                  sm:px-6
                "
              >
                Stock
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-left
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-nexora-muted
                  sm:px-6
                "
              >
                Status
              </th>

              <th
                className="
                  px-5
                  py-4
                  text-right
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-nexora-muted
                  sm:px-6
                "
              >
                Actions
              </th>

            </tr>
          </thead>

          {/* ================= BODY ================= */}

          <tbody>
            {products.map(
              (product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )
            )}
          </tbody>

        </table>

      </div>
    </div>
  );
};

export default ProductTable;