import {
  useEffect,
  useMemo,
  useState,
} from "react";

import productImages from "../../constants/productImages";

/* =====================================================
   RETURN REASONS
===================================================== */

const RETURN_REASONS = [
  {
    value: "damaged",
    label: "Product arrived damaged",
  },
  {
    value: "defective",
    label: "Product is defective",
  },
  {
    value: "wrong_item",
    label: "Wrong product received",
  },
  {
    value: "missing_parts",
    label: "Missing parts or accessories",
  },
  {
    value: "not_as_described",
    label: "Product not as described",
  },
  {
    value: "other",
    label: "Other reason",
  },
];

/* =====================================================
   COMPONENT
===================================================== */

const ReturnRequestDrawer = ({
  isOpen,
  order,
  getReturnableQuantity,
  isSubmitting,
  onSubmit,
  onClose,
}) => {
  /* =====================================================
     LOCAL STATE
  ===================================================== */

  const [
    selectedItems,
    setSelectedItems,
  ] = useState({});

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    details,
    setDetails,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  /* =====================================================
     RESET DRAWER
  ===================================================== */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedItems({});
    setReason("");
    setDetails("");
    setError("");
  }, [
    isOpen,
    order?.id,
  ]);

  /* =====================================================
     ITEM KEY

     Simple product:
     productId::simple

     Variant product:
     productId::variantId

     This prevents two variants of the same product
     from being treated as the same return item.
  ===================================================== */

  const getItemKey = (
    item
  ) => {
    return `${String(
      item?.id
    )}::${String(
      item?.variantId ||
        "simple"
    )}`;
  };

  /* =====================================================
     ELIGIBLE ITEMS

     Orders.jsx calculates how many units of each
     order line can still be returned.

     Items with zero remaining quantity are hidden
     from the selectable return list.
  ===================================================== */

  const eligibleItems =
    useMemo(() => {
      if (
        !order ||
        !Array.isArray(
          order.items
        )
      ) {
        return [];
      }

      return order.items
        .map((item) => {
          const returnableQuantity =
            typeof getReturnableQuantity ===
            "function"
              ? Number(
                  getReturnableQuantity(
                    item
                  )
                )
              : Number(
                  item.quantity ||
                    0
                );

          return {
            ...item,

            returnableQuantity:
              Number.isFinite(
                returnableQuantity
              )
                ? Math.max(
                    0,
                    returnableQuantity
                  )
                : 0,
          };
        })
        .filter(
          (item) =>
            item.returnableQuantity >
            0
        );
    }, [
      order,
      getReturnableQuantity,
    ]);

  /* =====================================================
     SELECTED COUNT
  ===================================================== */

  const selectedCount =
    useMemo(() => {
      return Object.values(
        selectedItems
      ).filter(
        (item) =>
          item?.selected
      ).length;
    }, [
      selectedItems,
    ]);

  /* =====================================================
     TOTAL SELECTED QUANTITY
  ===================================================== */

  const selectedQuantity =
    useMemo(() => {
      return Object.values(
        selectedItems
      ).reduce(
        (
          total,
          item
        ) => {
          if (
            !item?.selected
          ) {
            return total;
          }

          return (
            total +
            Number(
              item.quantity ||
                0
            )
          );
        },
        0
      );
    }, [
      selectedItems,
    ]);

  /* =====================================================
     TOGGLE PRODUCT
  ===================================================== */

  const toggleItem = (
    item
  ) => {
    const key =
      getItemKey(
        item
      );

    setSelectedItems(
      (previous) => {
        const current =
          previous[key];

        return {
          ...previous,

          [key]: {
            selected:
              !current?.selected,

            quantity:
              current?.quantity ||
              1,
          },
        };
      }
    );

    setError("");
  };

  /* =====================================================
     UPDATE RETURN QUANTITY
  ===================================================== */

  const updateQuantity = (
    item,
    quantity
  ) => {
    const key =
      getItemKey(
        item
      );

    const maxQuantity =
      Math.max(
        1,
        Number(
          item.returnableQuantity ||
            1
        )
      );

    const numericQuantity =
      Number(
        quantity
      );

    const safeQuantity =
      Math.min(
        maxQuantity,
        Math.max(
          1,
          Number.isFinite(
            numericQuantity
          )
            ? numericQuantity
            : 1
        )
      );

    setSelectedItems(
      (previous) => ({
        ...previous,

        [key]: {
          selected:
            true,

          quantity:
            safeQuantity,
        },
      })
    );

    setError("");
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      /* =============================================
         BUILD SELECTED ITEMS
      ============================================= */

      const itemsToReturn =
        eligibleItems
          .filter(
            (item) => {
              const key =
                getItemKey(
                  item
                );

              return Boolean(
                selectedItems[
                  key
                ]?.selected
              );
            }
          )
          .map(
            (item) => {
              const key =
                getItemKey(
                  item
                );

              const quantity =
                Number(
                  selectedItems[
                    key
                  ]?.quantity
                ) || 1;

              return {
                id:
                  item.id,

                name:
                  item.name,

                brand:
                  item.brand ||
                  "NEXORA",

                price:
                  Number(
                    item.price
                  ) || 0,

                quantity,

                thumbnail:
                  item.thumbnail ||
                  "",

                variantId:
                  item.variantId ||
                  null,

                variantLabel:
                  item.variantLabel ||
                  null,

                variantAttributes:
                  item.variantAttributes ||
                  null,
              };
            }
          );

      /* =============================================
         VALIDATE PRODUCTS
      ============================================= */

      if (
        itemsToReturn.length ===
        0
      ) {
        setError(
          "Please select at least one product to return."
        );

        return;
      }

      /* =============================================
         VALIDATE QUANTITIES AGAIN
      ============================================= */

      for (
        const selectedItem of
        itemsToReturn
      ) {
        const eligibleItem =
          eligibleItems.find(
            (item) =>
              getItemKey(
                item
              ) ===
              getItemKey(
                selectedItem
              )
          );

        if (
          !eligibleItem
        ) {
          setError(
            "One of the selected products is no longer eligible for return."
          );

          return;
        }

        const quantity =
          Number(
            selectedItem.quantity
          );

        const maxQuantity =
          Number(
            eligibleItem.returnableQuantity
          );

        if (
          !Number.isInteger(
            quantity
          ) ||
          quantity <= 0 ||
          quantity >
            maxQuantity
        ) {
          setError(
            `Invalid return quantity for ${
              eligibleItem.name ||
              "product"
            }.`
          );

          return;
        }
      }

      /* =============================================
         VALIDATE REASON
      ============================================= */

      if (!reason) {
        setError(
          "Please select a reason for the return."
        );

        return;
      }

      /* =============================================
         VALIDATE OTHER REASON
      ============================================= */

      if (
        reason ===
          "other" &&
        details.trim()
          .length < 10
      ) {
        setError(
          "Please provide at least 10 characters explaining the return."
        );

        return;
      }

      /* =============================================
         SUBMIT
      ============================================= */

      try {
        await onSubmit({
          items:
            itemsToReturn,

          reason,

          details:
            details.trim(),
        });
      } catch (submitError) {
        setError(
          typeof submitError ===
            "string"
            ? submitError
            : submitError?.message ||
                "Failed to submit return request."
        );
      }
    };

  /* =====================================================
     CLOSED
  ===================================================== */

  if (
    !isOpen ||
    !order
  ) {
    return null;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="fixed inset-0 z-50">

      {/* =================================================
          OVERLAY
      ================================================= */}

      <button
        type="button"
        aria-label="Close return request"
        onClick={
          isSubmitting
            ? undefined
            : onClose
        }
        className="
          absolute
          inset-0
          h-full
          w-full
          cursor-default
          bg-black/30
          backdrop-blur-[2px]
        "
      />

      {/* =================================================
          DRAWER
      ================================================= */}

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-request-title"
        className="
          absolute
          right-0
          top-0
          flex
          h-full
          w-full
          max-w-xl
          flex-col
          border-l
          border-nexora-border
          bg-nexora-surface
          shadow-2xl
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-nexora-border
            px-6
            py-6
          "
        >
          <div>

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-nexora-taupe
              "
            >
              Returns
            </p>

            <h2
              id="return-request-title"
              className="
                mt-2
                text-2xl
                font-black
                tracking-[-0.03em]
                text-nexora-text
              "
            >
              Request Return
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-nexora-muted
              "
            >
              Select the products you
              want to return from
              order{" "}

              <span className="font-bold text-nexora-text">
                #{order.id}
              </span>
              .
            </p>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isSubmitting
            }
            aria-label="Close"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-nexora-border
              text-nexora-muted
              transition
              hover:border-nexora-primary
              hover:bg-nexora-primary
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

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
              space-y-7
              overflow-y-auto
              px-6
              py-6
            "
          >

            {/* =============================================
                PRODUCTS
            ============================================= */}

            <div>

              <div
                className="
                  mb-3
                  flex
                  items-end
                  justify-between
                  gap-4
                "
              >

                <div>

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-nexora-taupe
                    "
                  >
                    Products
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-nexora-muted
                    "
                  >
                    Choose only the
                    products you want
                    to return.
                  </p>

                </div>

                {selectedCount >
                  0 && (
                  <div className="text-right">

                    <span
                      className="
                        inline-flex
                        rounded-full
                        bg-nexora-primary-soft
                        px-3
                        py-1
                        text-[10px]
                        font-bold
                        text-nexora-primary
                      "
                    >
                      {selectedCount}{" "}
                      {selectedCount ===
                      1
                        ? "product"
                        : "products"}
                    </span>

                    <p className="mt-1 text-[10px] font-semibold text-nexora-muted">
                      {selectedQuantity}{" "}
                      {selectedQuantity ===
                      1
                        ? "unit"
                        : "units"}
                    </p>

                  </div>
                )}

              </div>

              <div className="space-y-3">

                {eligibleItems.map(
                  (item) => {
                    const key =
                      getItemKey(
                        item
                      );

                    const selected =
                      Boolean(
                        selectedItems[
                          key
                        ]?.selected
                      );

                    const quantity =
                      Number(
                        selectedItems[
                          key
                        ]?.quantity
                      ) || 1;

                    const maxQuantity =
                      Number(
                        item.returnableQuantity ||
                          1
                      );

                    const purchasedQuantity =
                      Number(
                        item.quantity ||
                          1
                      );

                    const productImage =
                      productImages[
                        String(
                          item.id
                        )
                      ] ||
                      item.thumbnail ||
                      "";

                    return (
                      <div
                        key={
                          key
                        }
                        className={`
                          rounded-2xl
                          border
                          p-4
                          transition
                          ${
                            selected
                              ? "border-nexora-primary bg-nexora-primary-soft/40"
                              : "border-nexora-border bg-nexora-ivory"
                          }
                        `}
                      >

                        <div
                          className="
                            flex
                            items-start
                            gap-4
                          "
                        >

                          {/* CHECKBOX */}

                          <button
                            type="button"
                            onClick={() =>
                              toggleItem(
                                item
                              )
                            }
                            className={`
                              mt-1
                              flex
                              h-5
                              w-5
                              shrink-0
                              items-center
                              justify-center
                              rounded-md
                              border
                              text-[11px]
                              font-black
                              transition
                              ${
                                selected
                                  ? "border-nexora-primary bg-nexora-primary text-white"
                                  : "border-nexora-taupe bg-nexora-surface"
                              }
                            `}
                            aria-pressed={
                              selected
                            }
                            aria-label={`Select ${item.name}`}
                          >
                            {selected
                              ? "✓"
                              : ""}
                          </button>

                          {/* IMAGE */}

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
                              bg-nexora-surface
                            "
                          >
                            {productImage ? (
                              <img
                                src={
                                  productImage
                                }
                                alt={
                                  item.name ||
                                  "Product"
                                }
                                className="
                                  h-full
                                  w-full
                                  object-contain
                                  p-2
                                "
                              />
                            ) : (
                              <span
                                className="
                                  text-[9px]
                                  font-bold
                                  text-nexora-taupe
                                "
                              >
                                NEXORA
                              </span>
                            )}
                          </div>

                          {/* PRODUCT */}

                          <button
                            type="button"
                            onClick={() =>
                              toggleItem(
                                item
                              )
                            }
                            className="
                              min-w-0
                              flex-1
                              text-left
                            "
                          >

                            <p
                              className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.15em]
                                text-nexora-taupe
                              "
                            >
                              {item.brand ||
                                "NEXORA"}
                            </p>

                            <p
                              className="
                                mt-1
                                text-sm
                                font-bold
                                leading-5
                                text-nexora-text
                              "
                            >
                              {
                                item.name
                              }
                            </p>

                            {/* VARIANT */}

                            {item.variantLabel && (
                              <div
                                className="
                                  mt-2
                                  inline-flex
                                  rounded-lg
                                  border
                                  border-nexora-primary/10
                                  bg-nexora-primary-soft
                                  px-2.5
                                  py-1
                                "
                              >
                                <span
                                  className="
                                    text-[10px]
                                    font-bold
                                    text-nexora-primary
                                  "
                                >
                                  {
                                    item.variantLabel
                                  }
                                </span>
                              </div>
                            )}

                            <div
                              className="
                                mt-2
                                flex
                                flex-wrap
                                gap-x-3
                                gap-y-1
                                text-xs
                                text-nexora-muted
                              "
                            >

                              <span>
                                ₹
                                {Number(
                                  item.price ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>

                              <span>
                                Purchased:{" "}
                                {
                                  purchasedQuantity
                                }
                              </span>

                              <span className="font-semibold text-nexora-primary">
                                Returnable:{" "}
                                {
                                  maxQuantity
                                }
                              </span>

                            </div>

                          </button>

                        </div>

                        {/* =================================
                            QUANTITY
                        ================================= */}

                        {selected && (
                          <div
                            className="
                              mt-4
                              flex
                              items-center
                              justify-between
                              gap-4
                              border-t
                              border-nexora-primary/10
                              pt-4
                            "
                          >

                            <div>

                              <p
                                className="
                                  text-[9px]
                                  font-bold
                                  uppercase
                                  tracking-[0.14em]
                                  text-nexora-taupe
                                "
                              >
                                Return Quantity
                              </p>

                              <p
                                className="
                                  mt-1
                                  text-xs
                                  text-nexora-muted
                                "
                              >
                                Up to{" "}
                                {
                                  maxQuantity
                                }{" "}
                                {maxQuantity ===
                                1
                                  ? "unit"
                                  : "units"}
                              </p>

                            </div>

                            <div
                              className="
                                flex
                                items-center
                                overflow-hidden
                                rounded-xl
                                border
                                border-nexora-border
                                bg-nexora-surface
                              "
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item,
                                    quantity -
                                      1
                                  )
                                }
                                disabled={
                                  quantity <=
                                  1
                                }
                                aria-label={`Decrease return quantity for ${item.name}`}
                                className="
                                  flex
                                  h-10
                                  w-10
                                  items-center
                                  justify-center
                                  text-lg
                                  font-bold
                                  text-nexora-primary
                                  transition
                                  hover:bg-nexora-primary-soft
                                  disabled:cursor-not-allowed
                                  disabled:opacity-30
                                "
                              >
                                −
                              </button>

                              <span
                                className="
                                  flex
                                  h-10
                                  min-w-10
                                  items-center
                                  justify-center
                                  border-x
                                  border-nexora-border
                                  px-3
                                  text-sm
                                  font-bold
                                  text-nexora-text
                                "
                              >
                                {
                                  quantity
                                }
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item,
                                    quantity +
                                      1
                                  )
                                }
                                disabled={
                                  quantity >=
                                  maxQuantity
                                }
                                aria-label={`Increase return quantity for ${item.name}`}
                                className="
                                  flex
                                  h-10
                                  w-10
                                  items-center
                                  justify-center
                                  text-lg
                                  font-bold
                                  text-nexora-primary
                                  transition
                                  hover:bg-nexora-primary-soft
                                  disabled:cursor-not-allowed
                                  disabled:opacity-30
                                "
                              >
                                +
                              </button>

                            </div>

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

                {/* =========================================
                    NO ELIGIBLE ITEMS
                ========================================= */}

                {eligibleItems.length ===
                  0 && (
                  <div
                    className="
                      rounded-2xl
                      border
                      border-nexora-border
                      bg-nexora-ivory
                      p-5
                    "
                  >

                    <p className="text-sm font-bold text-nexora-text">
                      No products available
                      for return
                    </p>

                    <p className="mt-2 text-xs leading-5 text-nexora-muted">
                      The products in this
                      order either already
                      have an active return,
                      have already been
                      returned, or have no
                      remaining returnable
                      quantity.
                    </p>

                  </div>
                )}

              </div>

            </div>

            {/* =============================================
                REASON
            ============================================= */}

            <div>

              <label
                htmlFor="return-reason"
                className="
                  mb-2
                  block
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-nexora-taupe
                "
              >
                Return Reason

                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <select
                id="return-reason"
                value={
                  reason
                }
                disabled={
                  isSubmitting
                }
                onChange={(
                  event
                ) => {
                  setReason(
                    event.target
                      .value
                  );

                  setError("");
                }}
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-nexora-border
                  bg-nexora-ivory
                  px-4
                  text-sm
                  font-medium
                  text-nexora-text
                  outline-none
                  transition
                  focus:border-nexora-primary
                  focus:ring-2
                  focus:ring-nexora-primary/10
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <option value="">
                  Select a reason
                </option>

                {RETURN_REASONS.map(
                  (
                    option
                  ) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* =============================================
                DETAILS
            ============================================= */}

            <div>

              <label
                htmlFor="return-details"
                className="
                  mb-2
                  block
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-nexora-taupe
                "
              >
                Additional Details

                {reason ===
                  "other" && (
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                )}
              </label>

              <textarea
                id="return-details"
                value={
                  details
                }
                disabled={
                  isSubmitting
                }
                onChange={(
                  event
                ) => {
                  setDetails(
                    event.target
                      .value
                  );

                  setError("");
                }}
                rows="6"
                maxLength="500"
                placeholder="Describe the issue with the selected product..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-nexora-border
                  bg-nexora-ivory
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-nexora-text
                  outline-none
                  transition
                  placeholder:text-nexora-muted/60
                  focus:border-nexora-primary
                  focus:ring-2
                  focus:ring-nexora-primary/10
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <div
                className="
                  mt-2
                  flex
                  justify-between
                  gap-4
                  text-[11px]
                  text-nexora-muted
                "
              >

                <span>
                  {reason ===
                  "other"
                    ? "At least 10 characters are required."
                    : "Provide useful information for the return review."}
                </span>

                <span>
                  {
                    details.length
                  }
                  /500
                </span>

              </div>

            </div>

            {/* =============================================
                INFORMATION
            ============================================= */}

            <div
              className="
                rounded-2xl
                border
                border-nexora-primary/15
                bg-nexora-primary-soft/60
                p-4
              "
            >

              <p className="text-sm font-bold text-nexora-primary">
                What happens next?
              </p>

              <p className="mt-2 text-xs leading-5 text-nexora-muted">
                Only the selected
                products and quantities
                will be included in this
                return request. If a
                request is rejected, that
                quantity becomes
                available to request
                again.
              </p>

              <p className="mt-2 text-xs leading-5 text-nexora-muted">
                If the return is
                approved, the product
                must still be received
                and inspected before the
                return is completed.
              </p>

            </div>

            {/* =============================================
                ERROR
            ============================================= */}

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
                <p className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              </div>
            )}

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              flex
              gap-3
              border-t
              border-nexora-border
              bg-nexora-ivory/70
              px-6
              py-5
            "
          >

            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                isSubmitting
              }
              className="
                flex-1
                rounded-xl
                border
                border-nexora-border
                bg-nexora-surface
                px-5
                py-3
                text-sm
                font-bold
                text-nexora-text
                transition
                hover:border-nexora-taupe
                hover:bg-nexora-ivory
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                eligibleItems.length ===
                  0
              }
              className="
                flex-1
                rounded-xl
                bg-nexora-primary
                px-5
                py-3
                text-sm
                font-bold
                text-white
                transition
                hover:bg-nexora-primary-hover
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isSubmitting
                ? "Submitting..."
                : selectedCount > 0
                  ? `Return ${selectedQuantity} ${
                      selectedQuantity ===
                      1
                        ? "Item"
                        : "Items"
                    }`
                  : "Submit Request"}
            </button>

          </div>

        </form>

      </aside>

    </div>
  );
};

export default ReturnRequestDrawer;