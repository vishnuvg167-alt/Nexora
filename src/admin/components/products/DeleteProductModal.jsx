const DeleteProductModal = ({
  product,
  isOpen,
  isDeleting,
  error,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !product) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[60]
        flex
        items-center
        justify-center
        p-4
      "
    >
      {/* OVERLAY */}

      <button
        type="button"
        aria-label="Close delete confirmation"
        onClick={onClose}
        disabled={isDeleting}
        className="
          absolute
          inset-0
          h-full
          w-full
          bg-black/40
          backdrop-blur-[2px]
        "
      />

      {/* MODAL */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-2xl
          border
          border-nexora-border
          bg-nexora-surface
          shadow-2xl
        "
      >
        {/* CONTENT */}

        <div className="p-6">

          {/* ICON */}

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-red-50
              text-red-600
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
              <path d="M3 6h18" />

              <path d="M8 6V4h8v2" />

              <path d="M19 6 18 20H6L5 6" />

              <path d="M10 11v5M14 11v5" />
            </svg>
          </div>

          {/* TEXT */}

          <h2
            id="delete-product-title"
            className="
              mt-5
              text-xl
              font-bold
              text-nexora-text
            "
          >
            Delete product?
          </h2>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-nexora-muted
            "
          >
            You are about to permanently
            delete{" "}
            <span
              className="
                font-semibold
                text-nexora-text
              "
            >
              {product.name}
            </span>
            . This action cannot be
            undone.
          </p>

          {/* PRODUCT PREVIEW */}

          <div
            className="
              mt-5
              flex
              items-center
              gap-4
              rounded-xl
              border
              border-nexora-border
              bg-nexora-ivory
              p-4
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-lg
                bg-nexora-surface
              "
            >
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.name}
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
                  strokeWidth="1.6"
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

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-sm
                  font-bold
                  text-nexora-text
                "
              >
                {product.name}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-nexora-muted
                "
              >
                #{product.id}
                {product.category
                  ? ` • ${product.category}`
                  : ""}
              </p>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div
              className="
                mt-4
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
              "
            >
              <p
                className="
                  text-sm
                  font-medium
                  text-red-700
                "
              >
                {error}
              </p>
            </div>
          )}

        </div>

        {/* ACTIONS */}

        <div
          className="
            flex
            justify-end
            gap-3
            border-t
            border-nexora-border
            bg-nexora-ivory/70
            px-6
            py-4
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="
              rounded-xl
              border
              border-nexora-border
              bg-nexora-surface
              px-5
              py-2.5
              text-sm
              font-semibold
              text-nexora-text
              hover:bg-nexora-ivory
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="
              min-w-32
              rounded-xl
              bg-red-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isDeleting
              ? "Deleting..."
              : "Delete Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;