import { useEffect, useMemo, useState } from "react";

/* ================= CONSTANTS ================= */

const REPLACEMENT_REASONS = [
  {
    value: "defective",
    label: "Product is defective",
  },
  {
    value: "damaged",
    label: "Product arrived damaged",
  },
  {
    value: "wrong_item",
    label: "Wrong item received",
  },
  {
    value: "not_working",
    label: "Product is not working",
  },
  {
    value: "missing_parts",
    label: "Missing parts or accessories",
  },
  {
    value: "other",
    label: "Other",
  },
];

/* ================= ITEM KEY ================= */

const getItemKey = (item) => {
  return `${String(item?.id)}::${String(
    item?.variantId || "simple"
  )}`;
};

/* ================= COMPONENT ================= */

const ReplacementRequestDrawer = ({
  isOpen,
  order,
  items = [],
  isSubmitting = false,
  error = "",
  onClose,
  onSubmit,
}) => {
  /* ================= STATE ================= */

  const [selectedItems, setSelectedItems] = useState({});
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [validationError, setValidationError] = useState("");

  /* ================= RESET FORM ================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedItems({});
    setReason("");
    setDetails("");
    setValidationError("");
  }, [isOpen, order?.id]);

  /* ================= SELECTED COUNT ================= */

  const selectedCount = useMemo(() => {
    return Object.values(selectedItems).filter(
      (item) => item.selected && Number(item.quantity) > 0
    ).length;
  }, [selectedItems]);

  /* ================= TOGGLE ITEM ================= */

  const handleToggleItem = (item) => {
    const itemKey = getItemKey(item);

    setSelectedItems((current) => {
      const existing = current[itemKey];

      if (existing?.selected) {
        return {
          ...current,
          [itemKey]: {
            ...existing,
            selected: false,
          },
        };
      }

      return {
        ...current,
        [itemKey]: {
          selected: true,
          quantity: 1,
        },
      };
    });

    setValidationError("");
  };

  /* ================= CHANGE QUANTITY ================= */

  const handleQuantityChange = (item, value) => {
    const itemKey = getItemKey(item);

    const maxQuantity = Math.max(
      1,
      Number(item.replacementableQuantity || 1)
    );

    const nextQuantity = Math.min(
      maxQuantity,
      Math.max(1, Number(value) || 1)
    );

    setSelectedItems((current) => ({
      ...current,
      [itemKey]: {
        selected: true,
        quantity: nextQuantity,
      },
    }));

    setValidationError("");
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setValidationError("");

    const replacementItems = items
      .filter((item) => {
        const selected = selectedItems[getItemKey(item)];

        return (
          selected?.selected &&
          Number(selected.quantity) > 0
        );
      })
      .map((item) => {
        const selected = selectedItems[getItemKey(item)];

        return {
          ...item,
          quantity: Number(selected.quantity),
        };
      });

    if (replacementItems.length === 0) {
      setValidationError(
        "Select at least one item for replacement."
      );
      return;
    }

    if (!reason) {
      setValidationError(
        "Select a reason for the replacement."
      );
      return;
    }

    if (reason === "other" && !details.trim()) {
      setValidationError(
        "Please provide details about the replacement."
      );
      return;
    }

    if (typeof onSubmit !== "function") {
      return;
    }

    await onSubmit({
      items: replacementItems,
      reason,
      details: details.trim(),
    });
  };

  /* ================= CLOSE ================= */

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose?.();
  };

  /* ================= HIDDEN ================= */

  if (!isOpen) {
    return null;
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-[80]">
      {/* ================= BACKDROP ================= */}

      <button
        type="button"
        aria-label="Close replacement request"
        onClick={handleClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
      />

      {/* ================= DRAWER ================= */}

      <div className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-nexora-surface shadow-2xl">
        {/* ================= HEADER ================= */}

        <div className="flex items-start justify-between gap-4 border-b border-nexora-border px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-nexora-taupe">
              Replacement
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-nexora-text">
              Request replacement
            </h2>

            {order?.id && (
              <p className="mt-2 text-sm text-nexora-muted">
                Order #
                {String(order.id).slice(-8).toUpperCase()}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-nexora-border text-nexora-muted transition hover:bg-nexora-ivory hover:text-nexora-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* ================= FORM ================= */}

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6 sm:px-7">
            {/* ================= INFO ================= */}

            <div className="rounded-2xl border border-nexora-primary/15 bg-nexora-primary-soft/60 p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-nexora-primary text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M20 7h-9" />
                    <path d="m16 3-4 4 4 4" />
                    <path d="M4 17h9" />
                    <path d="m8 13 4 4-4 4" />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-nexora-text">
                    Same product replacement
                  </p>

                  <p className="mt-1 text-xs leading-5 text-nexora-muted">
                    The replacement will be for the exact
                    product and variant originally purchased.
                  </p>
                </div>
              </div>
            </div>

            {/* ================= ITEMS ================= */}

            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-bold text-nexora-text">
                    Select items
                  </h3>

                  <p className="mt-1 text-sm text-nexora-muted">
                    Choose the items you want replaced.
                  </p>
                </div>

                {selectedCount > 0 && (
                  <span className="rounded-full bg-nexora-primary-soft px-3 py-1 text-xs font-bold text-nexora-primary">
                    {selectedCount} selected
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-nexora-border bg-nexora-ivory p-6 text-center">
                    <p className="font-semibold text-nexora-text">
                      No eligible items
                    </p>

                    <p className="mt-1 text-sm text-nexora-muted">
                      There are no items available for
                      replacement in this order.
                    </p>
                  </div>
                ) : (
                  items.map((item) => {
                    const itemKey = getItemKey(item);

                    const selected =
                      selectedItems[itemKey]?.selected ||
                      false;

                    const quantity =
                      selectedItems[itemKey]?.quantity || 1;

                    const maxQuantity = Math.max(
                      1,
                      Number(
                        item.replacementableQuantity || 1
                      )
                    );

                    return (
                      <article
                        key={itemKey}
                        className={`rounded-2xl border p-4 transition ${
                          selected
                            ? "border-nexora-primary bg-nexora-primary-soft/40"
                            : "border-nexora-border bg-nexora-surface"
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* ================= CHECKBOX ================= */}

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleItem(item)
                            }
                            aria-pressed={selected}
                            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                              selected
                                ? "border-nexora-primary bg-nexora-primary text-white"
                                : "border-nexora-border bg-white"
                            }`}
                          >
                            {selected && (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              >
                                <path d="m5 12 4 4L19 6" />
                              </svg>
                            )}
                          </button>

                          {/* ================= ITEM INFO ================= */}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                              <div>
                                <p className="font-semibold text-nexora-text">
                                  {item.name ||
                                    "Product"}
                                </p>

                                {item.variantLabel && (
                                <p className="mt-1 text-xs text-nexora-muted">
                                    {item.variantLabel}
                                </p>
                                )}

                                {!item.variantLabel && item.variantId && (
                                <p className="mt-1 text-xs text-nexora-muted">
                                    Variant: {item.variantId}
                                </p>
                                )}
                              </div>

                              <p className="text-sm font-bold text-nexora-text">
                                ₹
                                {Number(
                                  item.price || 0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-nexora-muted">
                              <span>
                                Purchased:{" "}
                                {Number(
                                  item.quantity || 0
                                )}
                              </span>

                              <span>•</span>

                              <span>
                                Available for replacement:{" "}
                                {maxQuantity}
                              </span>

                              {item.replacementWindowDays && (
                                <>
                                  <span>•</span>

                                  <span>
                                    {item.replacementWindowDays}
                                    -day replacement
                                    window
                                  </span>
                                </>
                              )}
                            </div>

                            {/* ================= QUANTITY ================= */}

                            {selected && (
                              <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-nexora-border bg-nexora-surface p-3">
                                <div>
                                  <p className="text-xs font-semibold text-nexora-text">
                                    Replacement quantity
                                  </p>

                                  <p className="mt-0.5 text-xs text-nexora-muted">
                                    Maximum {maxQuantity}
                                  </p>
                                </div>

                                <select
                                  value={quantity}
                                  onChange={(event) =>
                                    handleQuantityChange(
                                      item,
                                      event.target.value
                                    )
                                  }
                                  className="h-10 rounded-xl border border-nexora-border bg-nexora-ivory px-3 text-sm font-semibold text-nexora-text outline-none focus:border-nexora-primary"
                                >
                                  {Array.from(
                                    {
                                      length:
                                        maxQuantity,
                                    },
                                    (_, index) =>
                                      index + 1
                                  ).map((value) => (
                                    <option
                                      key={value}
                                      value={value}
                                    >
                                      {value}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>

            {/* ================= REASON ================= */}

            <section>
              <label
                htmlFor="replacement-reason"
                className="text-sm font-bold text-nexora-text"
              >
                Reason for replacement
              </label>

              <p className="mt-1 text-xs text-nexora-muted">
                Tell us why this product needs to be
                replaced.
              </p>

              <select
                id="replacement-reason"
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setValidationError("");
                }}
                className="mt-3 h-12 w-full rounded-xl border border-nexora-border bg-nexora-ivory px-4 text-sm text-nexora-text outline-none focus:border-nexora-primary focus:ring-2 focus:ring-nexora-primary/10"
              >
                <option value="">
                  Select a reason
                </option>

                {REPLACEMENT_REASONS.map(
                  (replacementReason) => (
                    <option
                      key={
                        replacementReason.value
                      }
                      value={
                        replacementReason.value
                      }
                    >
                      {
                        replacementReason.label
                      }
                    </option>
                  )
                )}
              </select>
            </section>

            {/* ================= DETAILS ================= */}

            <section>
              <label
                htmlFor="replacement-details"
                className="text-sm font-bold text-nexora-text"
              >
                Additional details
              </label>

              <p className="mt-1 text-xs text-nexora-muted">
                Describe the issue to help us inspect the
                returned product.
              </p>

              <textarea
                id="replacement-details"
                value={details}
                onChange={(event) => {
                  setDetails(event.target.value);
                  setValidationError("");
                }}
                rows={5}
                maxLength={500}
                placeholder="Describe the issue..."
                className="mt-3 w-full resize-none rounded-xl border border-nexora-border bg-nexora-ivory px-4 py-3 text-sm leading-6 text-nexora-text outline-none placeholder:text-nexora-muted focus:border-nexora-primary focus:ring-2 focus:ring-nexora-primary/10"
              />

              <div className="mt-1 text-right text-xs text-nexora-muted">
                {details.length}/500
              </div>
            </section>

            {/* ================= ERROR ================= */}

            {(validationError || error) && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {validationError || error}
              </div>
            )}
          </div>

          {/* ================= FOOTER ================= */}

          <div className="border-t border-nexora-border bg-nexora-surface px-5 py-4 sm:px-7">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-11 rounded-xl border border-nexora-border px-5 text-sm font-semibold text-nexora-text transition hover:bg-nexora-ivory disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  items.length === 0
                }
                className="h-11 rounded-xl bg-nexora-primary px-6 text-sm font-semibold text-white transition hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Submit replacement request"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReplacementRequestDrawer;