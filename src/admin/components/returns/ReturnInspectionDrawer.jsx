import {
  useEffect,
  useState,
} from "react";

const ReturnInspectionDrawer = ({
  isOpen,
  returnRequest,
  isSubmitting,
  mode = "create",
  onSubmit,
  onClose,
}) => {
  const [
    condition,
    setCondition,
  ] = useState("");

  const [
    note,
    setNote,
  ] = useState("");

  const [
    editReason,
    setEditReason,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  /* =====================================================
     MODE
  ===================================================== */

  const isEditMode =
    mode === "edit";

  /* =====================================================
     RESET / PREFILL
  ===================================================== */

  useEffect(() => {
    if (
      !isOpen ||
      !returnRequest
    ) {
      return;
    }

    if (isEditMode) {
      setCondition(
        returnRequest.inspectionResult ||
          ""
      );

      setNote(
        returnRequest.inspectionNote ||
          ""
      );

      setEditReason("");
    } else {
      setCondition("");
      setNote("");
      setEditReason("");
    }

    setError("");
  }, [
    isOpen,
    returnRequest?.id,
    returnRequest?.inspectionResult,
    returnRequest?.inspectionNote,
    isEditMode,
  ]);

  if (
    !isOpen ||
    !returnRequest
  ) {
    return null;
  }

  /* =====================================================
     ITEMS
  ===================================================== */

  const items =
    Array.isArray(
      returnRequest.items
    )
      ? returnRequest.items
      : [];

  /* =====================================================
     ORIGINAL CONDITION
  ===================================================== */

  const originalCondition =
    (
      returnRequest.inspectionResult ||
      ""
    ).toLowerCase();

  /* =====================================================
     CONDITION CHANGED
  ===================================================== */

  const conditionChanged =
    isEditMode &&
    condition &&
    originalCondition &&
    condition !==
      originalCondition;

  /* =====================================================
     INVENTORY EFFECT
  ===================================================== */

  const getInventoryMessage =
    () => {
      if (!isEditMode) {
        if (
          condition ===
          "resellable"
        ) {
          return "The returned quantity will be added to sellable inventory.";
        }

        if (
          condition ===
          "defective"
        ) {
          return "Sellable inventory will remain unchanged.";
        }

        return "Select the product condition to determine how inventory should be handled.";
      }

      if (
        originalCondition ===
          "resellable" &&
        condition ===
          "defective"
      ) {
        return "Changing from Resellable to Defective will remove the previously restored quantity from sellable inventory.";
      }

      if (
        originalCondition ===
          "defective" &&
        condition ===
          "resellable"
      ) {
        return "Changing from Defective to Resellable will add the returned quantity to sellable inventory.";
      }

      return "The condition has not changed, so inventory will not be modified.";
    };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!condition) {
      setError(
        "Select the condition of the returned product."
      );

      return;
    }

    if (
      note.trim().length <
      10
    ) {
      setError(
        "Add an inspection note of at least 10 characters."
      );

      return;
    }

    if (
      isEditMode &&
      editReason.trim()
        .length < 10
    ) {
      setError(
        "Add a correction reason of at least 10 characters."
      );

      return;
    }

    onSubmit({
      condition,

      note:
        note.trim(),

      editReason:
        isEditMode
          ? editReason.trim()
          : "",
    });
  };

  /* =====================================================
     CLOSE
  ===================================================== */

  const handleClose =
    () => {
      if (isSubmitting) {
        return;
      }

      onClose();
    };

  return (
    <div className="fixed inset-0 z-[90]">

      {/* ================= OVERLAY ================= */}

      <button
        type="button"
        aria-label={
          isEditMode
            ? "Close inspection editor"
            : "Close inspection"
        }
        onClick={
          handleClose
        }
        className="
          absolute
          inset-0
          h-full
          w-full
          cursor-default
          bg-black/45
          backdrop-blur-[2px]
        "
      />

      {/* ================= DRAWER ================= */}

      <aside
        className="
          absolute
          right-0
          top-0
          flex
          h-full
          w-full
          max-w-xl
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
            gap-5
            border-b
            border-nexora-border
            px-6
            py-6
            sm:px-8
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
              {isEditMode
                ? "Inspection Correction"
                : "Return Inspection"}
            </p>

            <h2
              className="
                mt-2
                text-2xl
                font-black
                tracking-[-0.03em]
                text-nexora-text
              "
            >
              {isEditMode
                ? "Edit Inspection"
                : "Inspect Product"}
            </h2>

            <p
              className="
                mt-2
                font-mono
                text-xs
                font-semibold
                text-nexora-muted
              "
            >
              #{returnRequest.id}
            </p>

          </div>

          <button
            type="button"
            onClick={
              handleClose
            }
            disabled={
              isSubmitting
            }
            aria-label="Close inspection drawer"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-nexora-border
              bg-nexora-ivory
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
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="m6 6 12 12" />
              <path d="M18 6 6 18" />
            </svg>

          </button>

        </div>

        {/* ================= FORM ================= */}

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
              sm:px-8
            "
          >

            {/* ================= INFO ================= */}

            <div
              className={`
                rounded-2xl
                border
                p-5

                ${
                  isEditMode
                    ? `
                      border-amber-200
                      bg-amber-50
                    `
                    : `
                      border-nexora-primary/15
                      bg-nexora-primary-soft/60
                    `
                }
              `}
            >

              <p
                className={`
                  text-xs
                  font-black

                  ${
                    isEditMode
                      ? "text-amber-800"
                      : "text-nexora-primary"
                  }
                `}
              >
                {isEditMode
                  ? "Correct completed inspection"
                  : "Product received"}
              </p>

              <p
                className={`
                  mt-2
                  text-xs
                  leading-5

                  ${
                    isEditMode
                      ? "text-amber-700"
                      : "text-nexora-muted"
                  }
                `}
              >
                {isEditMode
                  ? "You are editing a completed inspection. Changing the condition may also change the product's sellable inventory."
                  : "Inspect the returned product before deciding whether it can be placed back into sellable inventory."}
              </p>

            </div>

            {/* ================= PRODUCTS ================= */}

            <section
              className="
                rounded-2xl
                border
                border-nexora-border
                p-5
              "
            >

              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-nexora-taupe
                "
              >
                Returned Items
              </p>

              <div className="mt-4 space-y-3">

                {items.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="
                        flex
                        items-center
                        gap-4
                        rounded-xl
                        border
                        border-nexora-border
                        bg-nexora-ivory
                        p-3
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
                          rounded-lg
                          border
                          border-nexora-border
                          bg-white
                        "
                      >

                        {item.thumbnail ? (
                          <img
                            src={
                              item.thumbnail
                            }
                            alt={
                              item.name ||
                              "Returned product"
                            }
                            className="
                              h-full
                              w-full
                              object-contain
                              p-2
                            "
                          />
                        ) : (
                          <span className="text-[8px] font-bold uppercase text-nexora-muted">
                            No Image
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
                          {item.name ||
                            "Unknown product"}
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-nexora-muted
                          "
                        >
                          Quantity:{" "}

                          <strong className="text-nexora-text">
                            {Number(
                              item.quantity ||
                                1
                            )}
                          </strong>
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>

            {/* ================= ORIGINAL RESULT ================= */}

            {isEditMode && (
              <section
                className="
                  rounded-2xl
                  border
                  border-nexora-border
                  bg-nexora-ivory
                  p-5
                "
              >

                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-nexora-taupe
                  "
                >
                  Current Inspection
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">

                  <span
                    className={`
                      inline-flex
                      rounded-full
                      border
                      px-3
                      py-1.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.08em]

                      ${
                        originalCondition ===
                        "resellable"
                          ? `
                            border-emerald-200
                            bg-emerald-50
                            text-emerald-700
                          `
                          : `
                            border-red-200
                            bg-red-50
                            text-red-700
                          `
                      }
                    `}
                  >
                    {originalCondition ===
                    "resellable"
                      ? "Resellable"
                      : "Defective / Damaged"}
                  </span>

                  <span className="text-[11px] text-nexora-muted">
                    Stock restored:{" "}

                    <strong className="text-nexora-text">
                      {returnRequest.stockRestored
                        ? "Yes"
                        : "No"}
                    </strong>
                  </span>

                </div>

              </section>
            )}

            {/* ================= CONDITION ================= */}

            <section>

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-nexora-taupe
                "
              >
                {isEditMode
                  ? "Corrected Product Condition"
                  : "Product Condition"}
              </p>

              <div className="mt-3 grid gap-3">

                {/* RESELLABLE */}

                <label
                  className={`
                    cursor-pointer
                    rounded-2xl
                    border
                    p-5
                    transition

                    ${
                      condition ===
                      "resellable"
                        ? `
                          border-emerald-300
                          bg-emerald-50
                        `
                        : `
                          border-nexora-border
                          bg-nexora-surface
                          hover:border-nexora-primary/40
                        `
                    }
                  `}
                >

                  <div className="flex items-start gap-3">

                    <input
                      type="radio"
                      name="condition"
                      value="resellable"
                      checked={
                        condition ===
                        "resellable"
                      }
                      onChange={() =>
                        setCondition(
                          "resellable"
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                      className="mt-1 accent-nexora-primary"
                    />

                    <div>

                      <p className="text-sm font-black text-nexora-text">
                        Resellable
                      </p>

                      <p className="mt-1 text-xs leading-5 text-nexora-muted">
                        The product is in
                        acceptable condition
                        and can return to
                        normal sellable
                        inventory.
                      </p>

                      <p className="mt-2 text-[11px] font-bold text-emerald-700">
                        Eligible for sellable
                        inventory.
                      </p>

                    </div>

                  </div>

                </label>

                {/* DEFECTIVE */}

                <label
                  className={`
                    cursor-pointer
                    rounded-2xl
                    border
                    p-5
                    transition

                    ${
                      condition ===
                      "defective"
                        ? `
                          border-red-200
                          bg-red-50
                        `
                        : `
                          border-nexora-border
                          bg-nexora-surface
                          hover:border-nexora-primary/40
                        `
                    }
                  `}
                >

                  <div className="flex items-start gap-3">

                    <input
                      type="radio"
                      name="condition"
                      value="defective"
                      checked={
                        condition ===
                        "defective"
                      }
                      onChange={() =>
                        setCondition(
                          "defective"
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                      className="mt-1 accent-nexora-primary"
                    />

                    <div>

                      <p className="text-sm font-black text-nexora-text">
                        Defective / Damaged
                      </p>

                      <p className="mt-1 text-xs leading-5 text-nexora-muted">
                        The product has a
                        defect, damage, or
                        another issue that
                        prevents it from
                        being sold normally.
                      </p>

                      <p className="mt-2 text-[11px] font-bold text-red-700">
                        Must not remain in
                        sellable inventory.
                      </p>

                    </div>

                  </div>

                </label>

              </div>

            </section>

            {/* ================= INVENTORY EFFECT ================= */}

            {condition && (
              <div
                className={`
                  rounded-2xl
                  border
                  p-5

                  ${
                    conditionChanged
                      ? `
                        border-amber-200
                        bg-amber-50
                      `
                      : `
                        border-nexora-border
                        bg-nexora-ivory
                      `
                  }
                `}
              >

                <p
                  className={`
                    text-xs
                    font-black

                    ${
                      conditionChanged
                        ? "text-amber-800"
                        : "text-nexora-text"
                    }
                  `}
                >
                  Inventory impact
                </p>

                <p
                  className={`
                    mt-2
                    text-xs
                    leading-5

                    ${
                      conditionChanged
                        ? "text-amber-700"
                        : "text-nexora-muted"
                    }
                  `}
                >
                  {getInventoryMessage()}
                </p>

              </div>
            )}

            {/* ================= NOTE ================= */}

            <section>

              <label
                htmlFor="inspection-note"
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-nexora-taupe
                "
              >
                Inspection Note
              </label>

              <textarea
                id="inspection-note"
                value={
                  note
                }
                onChange={(
                  event
                ) =>
                  setNote(
                    event.target
                      .value
                  )
                }
                disabled={
                  isSubmitting
                }
                maxLength={500}
                rows={5}
                placeholder="Describe what you found during inspection..."
                className="
                  mt-3
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-nexora-border
                  bg-nexora-ivory
                  px-4
                  py-4
                  text-sm
                  leading-6
                  text-nexora-text
                  outline-none
                  placeholder:text-nexora-muted/60
                  focus:border-nexora-primary
                  focus:ring-2
                  focus:ring-nexora-primary/10
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <div className="mt-2 flex justify-between gap-3">

                <p className="text-[10px] text-nexora-muted">
                  Minimum 10
                  characters.
                </p>

                <p className="text-[10px] text-nexora-muted">
                  {note.length}/500
                </p>

              </div>

            </section>

            {/* ================= CORRECTION REASON ================= */}

            {isEditMode && (
              <section>

                <label
                  htmlFor="inspection-edit-reason"
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-nexora-taupe
                  "
                >
                  Reason for Correction *
                </label>

                <textarea
                  id="inspection-edit-reason"
                  value={
                    editReason
                  }
                  onChange={(
                    event
                  ) =>
                    setEditReason(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="Explain why this completed inspection is being corrected..."
                  className="
                    mt-3
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-amber-200
                    bg-amber-50/50
                    px-4
                    py-4
                    text-sm
                    leading-6
                    text-nexora-text
                    outline-none
                    placeholder:text-nexora-muted/60
                    focus:border-amber-400
                    focus:ring-2
                    focus:ring-amber-200
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />

                <div className="mt-2 flex justify-between gap-3">

                  <p className="text-[10px] text-nexora-muted">
                    Required for audit
                    history. Minimum 10
                    characters.
                  </p>

                  <p className="text-[10px] text-nexora-muted">
                    {editReason.length}/500
                  </p>

                </div>

              </section>
            )}

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

                <p className="text-xs font-semibold text-red-700">
                  {error}
                </p>

              </div>
            )}

            {/* ================= WARNING ================= */}

            <div
              className="
                rounded-2xl
                border
                border-amber-200
                bg-amber-50
                p-5
              "
            >

              <p className="text-xs font-black text-amber-800">
                {isEditMode
                  ? "Confirm correction carefully"
                  : "Confirm inspection carefully"}
              </p>

              <p className="mt-2 text-xs leading-5 text-amber-700">

                {isEditMode
                  ? conditionChanged
                    ? "You changed the product condition. Saving this correction will also adjust sellable inventory to match the corrected inspection result."
                    : "The product condition has not changed. Saving will update the inspection information without modifying inventory."
                  : "Completing the inspection will finish the return inspection stage. A resellable result may restore the returned quantity to inventory."}

              </p>

            </div>

          </div>

          {/* ================= FOOTER ================= */}

          <div
            className="
              border-t
              border-nexora-border
              bg-nexora-surface
              px-6
              py-5
              sm:px-8
            "
          >

            <div
              className="
                flex
                flex-col-reverse
                gap-3
                sm:flex-row
                sm:justify-end
              "
            >

              <button
                type="button"
                onClick={
                  handleClose
                }
                disabled={
                  isSubmitting
                }
                className="
                  rounded-full
                  border
                  border-nexora-border
                  px-5
                  py-3
                  text-xs
                  font-bold
                  text-nexora-text
                  hover:border-nexora-primary
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="
                  rounded-full
                  bg-nexora-primary
                  px-6
                  py-3
                  text-xs
                  font-bold
                  text-white
                  hover:bg-nexora-primary-hover
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Completing..."
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

export default ReturnInspectionDrawer;