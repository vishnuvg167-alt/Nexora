import {
  useEffect,
  useState,
} from "react";

/* =====================================================
   COMPONENT
===================================================== */

const ReplacementInspectionDrawer = ({
  isOpen,
  replacementRequest,
  mode = "create",
  isSubmitting = false,
  onSubmit,
  onClose,
}) => {
  /* =====================================================
     STATE
  ===================================================== */

  const [condition, setCondition] =
    useState("");

  const [note, setNote] =
    useState("");

  const [editReason, setEditReason] =
    useState("");

  const [error, setError] =
    useState("");

  /* =====================================================
     MODE
  ===================================================== */

  const isEditMode =
    mode === "edit";

  /* =====================================================
     RESET / LOAD EXISTING INSPECTION
  ===================================================== */

  useEffect(() => {
    if (!isOpen) {
      setCondition("");
      setNote("");
      setEditReason("");
      setError("");

      return;
    }

    if (
      isEditMode &&
      replacementRequest
    ) {
      setCondition(
        replacementRequest.inspectionResult ||
          ""
      );

      setNote(
        replacementRequest.inspectionNote ||
          ""
      );

      setEditReason("");
      setError("");

      return;
    }

    setCondition("");
    setNote("");
    setEditReason("");
    setError("");
  }, [
    isOpen,
    isEditMode,
    replacementRequest,
  ]);

  /* =====================================================
     ESCAPE KEY
  ===================================================== */

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape" &&
        !isSubmitting
      ) {
        onClose?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    isSubmitting,
    onClose,
  ]);

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    /* ================= CONDITION ================= */

    if (
      ![
        "resellable",
        "defective",
      ].includes(condition)
    ) {
      setError(
        "Select the condition of the returned item."
      );

      return;
    }

    /* ================= NOTE ================= */

    const cleanNote =
      note.trim();

    if (
      cleanNote.length < 10
    ) {
      setError(
        "Inspection note must contain at least 10 characters."
      );

      return;
    }

    /* ================= EDIT REASON ================= */

    const cleanEditReason =
      editReason.trim();

    if (
      isEditMode &&
      cleanEditReason.length < 10
    ) {
      setError(
        "Please provide at least 10 characters explaining why the inspection is being corrected."
      );

      return;
    }

    try {
      await onSubmit?.({
        condition,
        note: cleanNote,

        ...(isEditMode
          ? {
              editReason:
                cleanEditReason,
            }
          : {}),
      });
    } catch {
      /*
       * Parent/Redux handles the API error.
       * Keeping the drawer open allows the
       * admin to retry.
       */
    }
  };

  /* =====================================================
     GUARD
  ===================================================== */

  if (
    !isOpen ||
    !replacementRequest
  ) {
    return null;
  }

  /* =====================================================
     DATA
  ===================================================== */

  const items =
    Array.isArray(
      replacementRequest.items
    )
      ? replacementRequest.items
      : [];

  const shortReplacementId =
    String(
      replacementRequest.id ||
        ""
    )
      .slice(-8)
      .toUpperCase();

  const currentCondition =
    String(
      replacementRequest.inspectionResult ||
        ""
    ).toLowerCase();

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="fixed inset-0 z-[80]">
      {/* ================= BACKDROP ================= */}

      <button
        type="button"
        aria-label="Close inspection drawer"
        disabled={isSubmitting}
        onClick={() => {
          if (!isSubmitting) {
            onClose?.();
          }
        }}
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
      />

      {/* ================= DRAWER ================= */}

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="replacement-inspection-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-nexora-border bg-nexora-surface shadow-2xl"
      >
        {/* ================= HEADER ================= */}

        <div className="border-b border-nexora-border px-6 py-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                Replacement Inspection
              </p>

              <h2
                id="replacement-inspection-title"
                className="mt-2 text-2xl font-black tracking-[-0.04em] text-nexora-text"
              >
                {isEditMode
                  ? "Correct Inspection"
                  : "Inspect Returned Item"}
              </h2>

              <p className="mt-2 font-mono text-xs font-bold text-nexora-primary">
                #
                {shortReplacementId ||
                  replacementRequest.id}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-nexora-border text-nexora-muted transition hover:border-nexora-primary hover:bg-nexora-primary-soft hover:text-nexora-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m6 6 12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ================= CONTENT ================= */}

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
            {/* ================= EDIT WARNING ================= */}

            {isEditMode && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-800">
                  Inventory correction
                </p>

                <p className="mt-2 text-xs leading-5 text-amber-700">
                  Changing the inspection result may
                  change inventory. This correction is
                  only allowed before the replacement
                  product is shipped.
                </p>

                {currentCondition && (
                  <p className="mt-3 text-xs font-semibold capitalize text-amber-800">
                    Current result:{" "}
                    {currentCondition}
                  </p>
                )}
              </div>
            )}

            {/* ================= PRODUCTS ================= */}

            <section>
              <SectionHeading>
                Returned Products
              </SectionHeading>

              <div className="mt-3 space-y-3">
                {items.map(
                  (
                    item,
                    index
                  ) => (
                    <ProductCard
                      key={`${item.id}-${item.variantId || "simple"}-${index}`}
                      item={item}
                    />
                  )
                )}
              </div>
            </section>

            {/* ================= CONDITION ================= */}

            <section>
              <SectionHeading>
                Inspection Result
              </SectionHeading>

              <p className="mt-2 text-xs leading-5 text-nexora-muted">
                Select the physical condition of the
                original product returned by the
                customer.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {/* ================= RESELLABLE ================= */}

                <ConditionCard
                  selected={
                    condition ===
                    "resellable"
                  }
                  title="Resellable"
                  description="The returned original item can safely go back into sellable inventory."
                  inventoryText="Original stock will be restored"
                  onClick={() => {
                    if (
                      !isSubmitting
                    ) {
                      setCondition(
                        "resellable"
                      );

                      setError("");
                    }
                  }}
                />

                {/* ================= DEFECTIVE ================= */}

                <ConditionCard
                  selected={
                    condition ===
                    "defective"
                  }
                  title="Defective"
                  description="The returned original item is damaged or unsuitable for resale."
                  inventoryText="Original stock will not be restored"
                  onClick={() => {
                    if (
                      !isSubmitting
                    ) {
                      setCondition(
                        "defective"
                      );

                      setError("");
                    }
                  }}
                />
              </div>
            </section>

            {/* ================= INVENTORY EFFECT ================= */}

            {condition && (
              <section className="rounded-2xl border border-nexora-border bg-nexora-ivory p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
                  Inventory Effect
                </p>

                {condition ===
                "resellable" ? (
                  <div className="mt-3">
                    <p className="text-sm font-black text-nexora-primary">
                      Returned inventory will increase.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-nexora-muted">
                      The exact purchased product and
                      variant quantity will be added
                      back to inventory after this
                      inspection is submitted.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-sm font-black text-red-700">
                      Returned inventory will not increase.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-nexora-muted">
                      The returned item is considered
                      defective and will not be added
                      back to sellable stock.
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* ================= NOTE ================= */}

            <section>
              <label
                htmlFor="replacement-inspection-note"
                className="text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe"
              >
                Inspection Note
              </label>

              <textarea
                id="replacement-inspection-note"
                value={note}
                disabled={isSubmitting}
                onChange={(
                  event
                ) => {
                  setNote(
                    event.target.value
                  );

                  setError("");
                }}
                rows={5}
                maxLength={1000}
                placeholder="Describe the condition of the returned product..."
                className="mt-3 w-full resize-none rounded-2xl border border-nexora-border bg-nexora-ivory px-4 py-3 text-sm leading-6 text-nexora-text outline-none transition placeholder:text-nexora-muted/60 focus:border-nexora-primary focus:ring-2 focus:ring-nexora-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-2 flex items-center justify-between gap-4">
                <p className="text-[10px] text-nexora-muted">
                  Minimum 10 characters
                </p>

                <p className="text-[10px] text-nexora-muted">
                  {note.length}/1000
                </p>
              </div>
            </section>

            {/* ================= EDIT REASON ================= */}

            {isEditMode && (
              <section>
                <label
                  htmlFor="replacement-inspection-edit-reason"
                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe"
                >
                  Correction Reason
                </label>

                <textarea
                  id="replacement-inspection-edit-reason"
                  value={
                    editReason
                  }
                  disabled={
                    isSubmitting
                  }
                  onChange={(
                    event
                  ) => {
                    setEditReason(
                      event.target.value
                    );

                    setError("");
                  }}
                  rows={4}
                  maxLength={500}
                  placeholder="Explain why the previous inspection result needs to be corrected..."
                  className="mt-3 w-full resize-none rounded-2xl border border-nexora-border bg-nexora-ivory px-4 py-3 text-sm leading-6 text-nexora-text outline-none transition placeholder:text-nexora-muted/60 focus:border-nexora-primary focus:ring-2 focus:ring-nexora-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="text-[10px] text-nexora-muted">
                    Minimum 10 characters
                  </p>

                  <p className="text-[10px] text-nexora-muted">
                    {
                      editReason.length
                    }
                    /500
                  </p>
                </div>
              </section>
            )}

            {/* ================= LOCAL ERROR ================= */}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-xs font-semibold leading-5 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* ================= WORKFLOW NOTE ================= */}

            <div className="rounded-2xl border border-nexora-primary/15 bg-nexora-primary-soft/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-primary">
                Next Step
              </p>

              <p className="mt-2 text-xs leading-5 text-nexora-muted">
                After inspection, the request moves to{" "}
                <strong className="text-nexora-text">
                  Inspected
                </strong>
                . The replacement product is not
                deducted from inventory until the
                admin performs the separate shipping
                action.
              </p>
            </div>
          </div>

          {/* ================= FOOTER ================= */}

          <div className="border-t border-nexora-border bg-nexora-surface px-6 py-5">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={
                  isSubmitting
                }
                className="h-11 rounded-full border border-nexora-border px-6 text-xs font-bold uppercase tracking-[0.08em] text-nexora-text transition hover:border-nexora-primary hover:bg-nexora-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="h-11 rounded-full bg-nexora-primary px-6 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                    ? "Save Correction"
                    : "Complete Inspection"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
};

/* =====================================================
   PRODUCT CARD
===================================================== */

const ProductCard = ({
  item,
}) => {
  const quantity =
    Number(item?.quantity) ||
    0;

  return (
    <div className="flex gap-4 rounded-2xl border border-nexora-border bg-nexora-ivory p-4">
      {/* ================= IMAGE ================= */}

      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-nexora-border bg-white">
        {item?.thumbnail ? (
          <img
            src={
              item.thumbnail
            }
            alt={
              item.name ||
              "Replacement product"
            }
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-6 w-6 text-nexora-muted"
            aria-hidden="true"
          >
            <path d="M4 6h16v12H4z" />
            <path d="m4 15 4-4 3 3 2-2 7 6" />
          </svg>
        )}
      </div>

      {/* ================= DETAILS ================= */}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-nexora-text">
          {item?.name ||
            "Unknown product"}
        </p>

        {item?.variantLabel && (
          <p className="mt-1 text-[11px] font-semibold text-nexora-primary">
            {
              item.variantLabel
            }
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-nexora-muted">
          <span>
            Quantity:{" "}
            <strong className="text-nexora-text">
              {quantity}
            </strong>
          </span>

          {item?.variantId && (
            <span>
              Variant:{" "}
              <strong className="font-mono text-nexora-text">
                {
                  item.variantId
                }
              </strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   CONDITION CARD
===================================================== */

const ConditionCard = ({
  selected,
  title,
  description,
  inventoryText,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-2xl border p-4 text-left transition ${
      selected
        ? "border-nexora-primary bg-nexora-primary-soft ring-2 ring-nexora-primary/10"
        : "border-nexora-border bg-nexora-surface hover:border-nexora-primary/40 hover:bg-nexora-ivory"
    }`}
  >
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          selected
            ? "border-nexora-primary bg-nexora-primary"
            : "border-nexora-border bg-white"
        }`}
      >
        {selected && (
          <span className="h-2 w-2 rounded-full bg-white" />
        )}
      </span>

      <div>
        <p className="text-sm font-black text-nexora-text">
          {title}
        </p>

        <p className="mt-2 text-xs leading-5 text-nexora-muted">
          {description}
        </p>

        <p
          className={`mt-3 text-[10px] font-bold uppercase tracking-[0.08em] ${
            selected
              ? "text-nexora-primary"
              : "text-nexora-taupe"
          }`}
        >
          {inventoryText}
        </p>
      </div>
    </div>
  </button>
);

/* =====================================================
   SECTION HEADING
===================================================== */

const SectionHeading = ({
  children,
}) => (
  <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
    {children}
  </h3>
);

export default ReplacementInspectionDrawer;