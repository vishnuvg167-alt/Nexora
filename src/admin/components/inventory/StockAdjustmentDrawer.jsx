import {
  useEffect,
  useMemo,
  useState,
} from "react";

/* =====================================================
   STOCK ADJUSTMENT DRAWER
===================================================== */

const StockAdjustmentDrawer = ({
  isOpen,
  product,
  isUpdating = false,
  onConfirm,
  onClose,
}) => {
  const [
    adjustmentType,
    setAdjustmentType,
  ] = useState("add");

  const [
    quantity,
    setQuantity,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState("");

  /* =====================================================
     VARIANT DETECTION
  ===================================================== */

  const variants = useMemo(() => {
    return Array.isArray(
      product?.variants
    )
      ? product.variants
      : [];
  }, [product]);

  const hasVariants =
    variants.length > 0;

  /* =====================================================
     SELECTED VARIANT
  ===================================================== */

  const selectedVariant =
    useMemo(() => {
      if (!hasVariants) {
        return null;
      }

      return (
        variants.find(
          (variant) =>
            String(
              variant.id
            ) ===
            String(
              selectedVariantId
            )
        ) || null
      );
    }, [
      variants,
      hasVariants,
      selectedVariantId,
    ]);

  /* =====================================================
     PRODUCT STOCK
  ===================================================== */

  const currentProductStock =
    Math.max(
      Number(
        product?.stock
      ) || 0,
      0
    );

  /* =====================================================
     CURRENT ADJUSTABLE STOCK

     SIMPLE PRODUCT:
       product.stock

     VARIANT PRODUCT:
       selected variant.stock
  ===================================================== */

  const currentStock =
    hasVariants
      ? Math.max(
          Number(
            selectedVariant?.stock
          ) || 0,
          0
        )
      : currentProductStock;

  /* =====================================================
     RESET FORM
  ===================================================== */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAdjustmentType(
      "add"
    );

    setQuantity("");

    setReason("");

    setError("");

    /*
     * For variant products we intentionally
     * select the first configuration.
     *
     * The admin can immediately see which
     * configuration is being adjusted.
     */

    if (
      Array.isArray(
        product?.variants
      ) &&
      product.variants.length >
        0
    ) {
      setSelectedVariantId(
        String(
          product.variants[0]
            .id
        )
      );
    } else {
      setSelectedVariantId(
        ""
      );
    }
  }, [
    isOpen,
    product?.id,
    product?.variants,
  ]);

  /* =====================================================
     CALCULATE NEW STOCK
  ===================================================== */

  const newStock =
    useMemo(() => {
      const amount =
        Number(quantity);

      if (
        quantity === "" ||
        !Number.isFinite(
          amount
        ) ||
        amount < 0
      ) {
        return currentStock;
      }

      if (
        adjustmentType ===
        "add"
      ) {
        return (
          currentStock +
          amount
        );
      }

      if (
        adjustmentType ===
        "remove"
      ) {
        return (
          currentStock -
          amount
        );
      }

      if (
        adjustmentType ===
        "set"
      ) {
        return amount;
      }

      return currentStock;
    }, [
      adjustmentType,
      quantity,
      currentStock,
    ]);

  /* =====================================================
     NEW PARENT PRODUCT STOCK

     SIMPLE PRODUCT:
       same as newStock

     VARIANT PRODUCT:
       replace selected variant stock
       and sum every variant.
  ===================================================== */

  const newProductStock =
    useMemo(() => {
      if (!hasVariants) {
        return newStock;
      }

      if (!selectedVariant) {
        return currentProductStock;
      }

      return variants.reduce(
        (
          total,
          variant
        ) => {
          if (
            String(
              variant.id
            ) ===
            String(
              selectedVariant.id
            )
          ) {
            return (
              total +
              Math.max(
                Number(
                  newStock
                ) || 0,
                0
              )
            );
          }

          return (
            total +
            Math.max(
              Number(
                variant.stock
              ) || 0,
              0
            )
          );
        },
        0
      );
    }, [
      hasVariants,
      variants,
      selectedVariant,
      newStock,
      currentProductStock,
    ]);

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm =
    () => {
      if (
        hasVariants &&
        !selectedVariant
      ) {
        return "Select a product configuration.";
      }

      const amount =
        Number(quantity);

      if (quantity === "") {
        return "Enter a quantity.";
      }

      if (
        !Number.isFinite(
          amount
        )
      ) {
        return "Enter a valid quantity.";
      }

      if (
        !Number.isInteger(
          amount
        )
      ) {
        return "Stock quantity must be a whole number.";
      }

      if (amount < 0) {
        return "Quantity cannot be negative.";
      }

      if (
        adjustmentType !==
          "set" &&
        amount === 0
      ) {
        return "Quantity must be greater than zero.";
      }

      if (
        adjustmentType ===
          "remove" &&
        amount >
          currentStock
      ) {
        return `You cannot remove more than ${currentStock} units.`;
      }

      if (
        adjustmentType ===
          "set" &&
        amount ===
          currentStock
      ) {
        return "New stock is the same as the current stock.";
      }

      if (newStock < 0) {
        return "Stock cannot become negative.";
      }

      if (
        reason.trim()
          .length < 5
      ) {
        return "Please provide a reason of at least 5 characters.";
      }

      return "";
    };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const validationError =
        validateForm();

      if (
        validationError
      ) {
        setError(
          validationError
        );

        return;
      }

      setError("");

      try {
        await onConfirm({
          product,

          adjustmentType,

          quantity:
            Number(quantity),

          /*
           * For a simple product these
           * represent product stock.
           *
           * For a variant product these
           * represent selected variant stock.
           */

          previousStock:
            currentStock,

          newStock,

          /*
           * Parent totals are important for
           * variant products.
           */

          previousProductStock:
            currentProductStock,

          newProductStock,

          /*
           * null for simple products.
           */

          variant:
            selectedVariant
              ? {
                  ...selectedVariant,
                }
              : null,

          variantId:
            selectedVariant?.id ||
            null,

          variantLabel:
            selectedVariant?.label ||
            null,

          reason:
            reason.trim(),
        });
      } catch (
        submitError
      ) {
        setError(
          submitError?.message ||
            "Failed to update stock."
        );
      }
    };

  /* =====================================================
     CLOSE
  ===================================================== */

  const handleClose =
    () => {
      if (isUpdating) {
        return;
      }

      onClose();
    };

  /* =====================================================
     CHANGE VARIANT
  ===================================================== */

  const handleVariantChange =
    (event) => {
      setSelectedVariantId(
        event.target.value
      );

      setQuantity("");

      setError("");
    };

  /* =====================================================
     DRAWER CLOSED
  ===================================================== */

  if (
    !isOpen ||
    !product
  ) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        justify-end
      "
    >
      {/* ================= BACKDROP ================= */}

      <button
        type="button"
        aria-label="Close stock adjustment drawer"
        onClick={
          handleClose
        }
        className="
          absolute
          inset-0
          bg-black/35
          backdrop-blur-[1px]
        "
      />

      {/* ================= DRAWER ================= */}

      <aside
        className="
          relative
          z-10
          flex
          h-full
          w-full
          max-w-lg
          flex-col
          bg-nexora-surface
          shadow-2xl
        "
      >
        {/* ================= HEADER ================= */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-nexora-border
            px-6
            py-5
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.2em]
                text-nexora-copper
              "
            >
              Inventory Control
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-black
                text-nexora-text
              "
            >
              Adjust Stock
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-nexora-muted
              "
            >
              {hasVariants
                ? "Select a configuration and update its available inventory."
                : "Update the available inventory for this product."}
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleClose
            }
            disabled={
              isUpdating
            }
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-nexora-border
              text-nexora-muted
              hover:border-nexora-primary
              hover:text-nexora-primary
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
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
                d="m6 6 12 12"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m18 6-12 12"
              />
            </svg>
          </button>
        </div>

        {/* ================= CONTENT ================= */}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            flex
            min-h-0
            flex-1
            flex-col
          "
        >
          <div
            className="
              flex-1
              space-y-6
              overflow-y-auto
              px-6
              py-6
            "
          >
            {/* ================= PRODUCT ================= */}

            <section
              className="
                rounded-2xl
                border
                border-nexora-border
                bg-nexora-ivory
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    h-16
                    w-16
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-nexora-border
                    bg-white
                  "
                >
                  {product.thumbnail ? (
                    <img
                      src={
                        product.thumbnail
                      }
                      alt={
                        product.name
                      }
                      className="
                        h-full
                        w-full
                        object-contain
                        p-1.5
                      "
                    />
                  ) : (
                    <span
                      className="
                        text-[9px]
                        font-black
                        tracking-wider
                        text-nexora-muted
                      "
                    >
                      NEXORA
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-sm
                      font-black
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
                    {product.category ||
                      "Uncategorized"}
                  </p>

                  <div
                    className="
                      mt-2
                      flex
                      items-baseline
                      gap-1
                    "
                  >
                    <span
                      className="
                        text-xl
                        font-black
                        text-nexora-primary
                      "
                    >
                      {
                        currentProductStock
                      }
                    </span>

                    <span
                      className="
                        text-xs
                        font-semibold
                        text-nexora-muted
                      "
                    >
                      total units
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= VARIANT SELECTOR ================= */}

            {hasVariants && (
              <section>
                <label
                  htmlFor="inventory-variant"
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-nexora-muted
                  "
                >
                  Configuration
                </label>

                <select
                  id="inventory-variant"
                  value={
                    selectedVariantId
                  }
                  onChange={
                    handleVariantChange
                  }
                  disabled={
                    isUpdating
                  }
                  className="
                    mt-3
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-nexora-border
                    bg-white
                    px-4
                    text-sm
                    font-bold
                    text-nexora-text
                    outline-none
                    focus:border-nexora-primary
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {variants.map(
                    (variant) => (
                      <option
                        key={
                          variant.id
                        }
                        value={
                          variant.id
                        }
                      >
                        {variant.label ||
                          variant.id}{" "}
                        —{" "}
                        {Number(
                          variant.stock
                        ) || 0}{" "}
                        units
                      </option>
                    )
                  )}
                </select>

                {selectedVariant && (
                  <div
                    className="
                      mt-3
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >
                    <div
                      className="
                        rounded-xl
                        border
                        border-nexora-border
                        bg-nexora-ivory
                        p-3
                      "
                    >
                      <p
                        className="
                          text-[10px]
                          font-black
                          uppercase
                          tracking-wider
                          text-nexora-muted
                        "
                      >
                        Selected
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-black
                          text-nexora-text
                        "
                      >
                        {selectedVariant.label ||
                          selectedVariant.id}
                      </p>
                    </div>

                    <div
                      className="
                        rounded-xl
                        border
                        border-nexora-border
                        bg-nexora-ivory
                        p-3
                      "
                    >
                      <p
                        className="
                          text-[10px]
                          font-black
                          uppercase
                          tracking-wider
                          text-nexora-muted
                        "
                      >
                        Variant Stock
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-black
                          text-nexora-primary
                        "
                      >
                        {currentStock}{" "}
                        units
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ================= ADJUSTMENT TYPE ================= */}

            <section>
              <label
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-nexora-muted
                "
              >
                Adjustment Type
              </label>

              <div
                className="
                  mt-3
                  grid
                  grid-cols-3
                  gap-2
                "
              >
                {[
                  {
                    value:
                      "add",
                    label:
                      "Add Stock",
                  },
                  {
                    value:
                      "remove",
                    label:
                      "Remove",
                  },
                  {
                    value:
                      "set",
                    label:
                      "Set Stock",
                  },
                ].map(
                  (option) => {
                    const isActive =
                      adjustmentType ===
                      option.value;

                    return (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() => {
                          setAdjustmentType(
                            option.value
                          );

                          setQuantity(
                            ""
                          );

                          setError(
                            ""
                          );
                        }}
                        disabled={
                          isUpdating
                        }
                        className={`
                          rounded-xl
                          border
                          px-3
                          py-3
                          text-xs
                          font-bold

                          ${
                            isActive
                              ? `
                                border-nexora-primary
                                bg-nexora-primary
                                text-white
                              `
                              : `
                                border-nexora-border
                                bg-white
                                text-nexora-muted
                                hover:border-nexora-primary
                                hover:text-nexora-primary
                              `
                          }

                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        `}
                      >
                        {
                          option.label
                        }
                      </button>
                    );
                  }
                )}
              </div>

              <p
                className="
                  mt-3
                  text-xs
                  leading-5
                  text-nexora-muted
                "
              >
                {adjustmentType ===
                  "add" &&
                  "Increase inventory when new stock is received."}

                {adjustmentType ===
                  "remove" &&
                  "Reduce inventory for damaged, missing or unavailable units."}

                {adjustmentType ===
                  "set" &&
                  "Replace the current stock with an exact quantity after a physical count."}
              </p>
            </section>

            {/* ================= QUANTITY ================= */}

            <section>
              <label
                htmlFor="inventory-quantity"
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-nexora-muted
                "
              >
                {adjustmentType ===
                "set"
                  ? "New Stock Quantity"
                  : "Quantity"}
              </label>

              <input
                id="inventory-quantity"
                type="number"
                min="0"
                step="1"
                value={
                  quantity
                }
                onChange={(
                  event
                ) => {
                  setQuantity(
                    event.target
                      .value
                  );

                  setError("");
                }}
                disabled={
                  isUpdating
                }
                placeholder={
                  adjustmentType ===
                  "set"
                    ? "Enter final stock"
                    : "Enter quantity"
                }
                className="
                  mt-3
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-nexora-border
                  bg-white
                  px-4
                  text-sm
                  font-semibold
                  text-nexora-text
                  outline-none
                  focus:border-nexora-primary
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </section>

            {/* ================= STOCK PREVIEW ================= */}

            <section
              className="
                rounded-2xl
                border
                border-nexora-border
                bg-nexora-primary-soft
                p-5
              "
            >
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-nexora-primary
                "
              >
                {hasVariants
                  ? "Variant Stock Preview"
                  : "Stock Preview"}
              </p>

              {hasVariants &&
                selectedVariant && (
                  <p
                    className="
                      mt-2
                      text-sm
                      font-bold
                      text-nexora-text
                    "
                  >
                    {
                      selectedVariant.label
                    }
                  </p>
                )}

              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-center
                  gap-5
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
                    {currentStock}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-nexora-muted
                    "
                  >
                    Current
                  </p>
                </div>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="
                    h-6
                    w-6
                    text-nexora-primary
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

                <div className="text-center">
                  <p
                    className={`
                      text-3xl
                      font-black

                      ${
                        newStock <
                        0
                          ? "text-red-600"
                          : "text-nexora-primary"
                      }
                    `}
                  >
                    {newStock}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-nexora-muted
                    "
                  >
                    New Stock
                  </p>
                </div>
              </div>

              {/* ============= PARENT TOTAL PREVIEW ============= */}

              {hasVariants && (
                <div
                  className="
                    mt-5
                    border-t
                    border-nexora-primary/15
                    pt-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <div>
                      <p
                        className="
                          text-xs
                          font-bold
                          text-nexora-muted
                        "
                      >
                        Total product stock
                      </p>

                      <p
                        className="
                          mt-1
                          text-[11px]
                          text-nexora-muted
                        "
                      >
                        Sum of all
                        configurations
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <span
                        className="
                          text-sm
                          font-black
                          text-nexora-muted
                        "
                      >
                        {
                          currentProductStock
                        }
                      </span>

                      <span
                        className="
                          text-nexora-primary
                        "
                      >
                        →
                      </span>

                      <span
                        className="
                          text-lg
                          font-black
                          text-nexora-primary
                        "
                      >
                        {
                          newProductStock
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ================= REASON ================= */}

            <section>
              <label
                htmlFor="inventory-reason"
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-nexora-muted
                "
              >
                Adjustment Reason
              </label>

              <textarea
                id="inventory-reason"
                rows="4"
                value={reason}
                onChange={(
                  event
                ) => {
                  setReason(
                    event.target
                      .value
                  );

                  setError("");
                }}
                disabled={
                  isUpdating
                }
                placeholder={
                  adjustmentType ===
                  "add"
                    ? "Example: New supplier shipment received"
                    : adjustmentType ===
                        "remove"
                      ? "Example: Damaged during warehouse inspection"
                      : "Example: Updated after physical inventory count"
                }
                className="
                  mt-3
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-nexora-border
                  bg-white
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-nexora-text
                  outline-none
                  placeholder:text-nexora-muted/60
                  focus:border-nexora-primary
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <p
                className="
                  mt-2
                  text-xs
                  text-nexora-muted
                "
              >
                {hasVariants
                  ? "The selected configuration and reason will be stored in the inventory audit history."
                  : "This reason will be stored in the inventory audit history."}
              </p>
            </section>

            {/* ================= ERROR ================= */}

            {error && (
              <div
                className="
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
                    font-semibold
                    text-red-700
                  "
                >
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* ================= FOOTER ================= */}

          <div
            className="
              flex
              items-center
              justify-end
              gap-3
              border-t
              border-nexora-border
              bg-nexora-surface
              px-6
              py-4
            "
          >
            <button
              type="button"
              onClick={
                handleClose
              }
              disabled={
                isUpdating
              }
              className="
                rounded-xl
                border
                border-nexora-border
                bg-white
                px-4
                py-2.5
                text-sm
                font-bold
                text-nexora-muted
                hover:border-nexora-primary
                hover:text-nexora-primary
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isUpdating ||
                (hasVariants &&
                  !selectedVariant)
              }
              className="
                rounded-xl
                bg-nexora-primary
                px-5
                py-2.5
                text-sm
                font-bold
                text-white
                hover:bg-nexora-primary-hover
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isUpdating
                ? "Updating..."
                : "Confirm Adjustment"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};

export default StockAdjustmentDrawer;