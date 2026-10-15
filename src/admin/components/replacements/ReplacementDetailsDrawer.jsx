import { useEffect } from "react";

/* =====================================================
   COMPONENT
===================================================== */

const ReplacementDetailsDrawer = ({
  isOpen,
  replacementRequest,
  order,

  isUpdating = false,
  isShipping = false,

  onApprove,
  onReject,
  onMarkReceived,
  onInspect,
  onEditInspection,
  onShip,
  onMarkDelivered,
  onClose,
}) => {
  /* =====================================================
     ESCAPE KEY
  ===================================================== */

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !isUpdating &&
        !isShipping
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
    isUpdating,
    isShipping,
    onClose,
  ]);

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

  const status = String(
    replacementRequest.status ||
      "requested"
  ).toLowerCase();

  const items = Array.isArray(
    replacementRequest.items
  )
    ? replacementRequest.items
    : [];

  const isBusy =
    isUpdating ||
    isShipping;

  const shortReplacementId =
    String(
      replacementRequest.id ||
        ""
    )
      .slice(-8)
      .toUpperCase();

  const customerName =
    order?.shippingAddress?.name ||
    "Customer";

  const customerPhone =
    order?.shippingAddress?.phone ||
    "";

  const customerEmail =
    order?.shippingAddress?.email ||
    "";

  const inspectionResult =
    String(
      replacementRequest.inspectionResult ||
        ""
    ).toLowerCase();

  /* =====================================================
     ACTION AVAILABILITY
  ===================================================== */

  const canApprove =
    status === "requested";

  const canReject =
    status === "requested";

  const canMarkReceived =
    status === "approved";

  const canInspect =
    status === "received";

  const canEditInspection =
    status === "inspected" &&
    !replacementRequest.replacementStockDeducted;

  const canShip =
    status === "inspected" &&
    ["resellable", "defective"].includes(
      inspectionResult
    ) &&
    !replacementRequest.replacementStockDeducted;

  const canMarkDelivered =
    status === "shipped" &&
    replacementRequest.replacementStockDeducted ===
      true;

  /* =====================================================
     CLOSE
  ===================================================== */

  const handleClose = () => {
    if (isBusy) return;

    onClose?.();
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="fixed inset-0 z-[70]">
      {/* ================= BACKDROP ================= */}

      <button
        type="button"
        aria-label="Close replacement details"
        disabled={isBusy}
        onClick={handleClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
      />

      {/* ================= DRAWER ================= */}

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="replacement-details-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col border-l border-nexora-border bg-nexora-surface shadow-2xl"
      >
        {/* ================= HEADER ================= */}

        <div className="border-b border-nexora-border px-6 py-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                Replacement Request
              </p>

              <h2
                id="replacement-details-title"
                className="mt-2 text-2xl font-black tracking-[-0.04em] text-nexora-text"
              >
                Replacement Details
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="font-mono text-xs font-bold text-nexora-primary">
                  #
                  {shortReplacementId ||
                    replacementRequest.id}
                </p>

                <StatusBadge
                  status={status}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isBusy}
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

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
          {/* ================= WORKFLOW ================= */}

          <section>
            <SectionHeading>
              Replacement Progress
            </SectionHeading>

            <div className="mt-4">
              <ReplacementTimeline
                status={status}
              />
            </div>
          </section>

          {/* ================= REQUEST ================= */}

          <section>
            <SectionHeading>
              Request Information
            </SectionHeading>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <InfoCard
                label="Replacement ID"
                value={`#${
                  replacementRequest.id
                }`}
                mono
              />

              <InfoCard
                label="Order ID"
                value={`#${
                  replacementRequest.orderId ||
                  "—"
                }`}
                mono
              />

              <InfoCard
                label="Customer"
                value={customerName}
              />

              <InfoCard
                label="User ID"
                value={
                  replacementRequest.userId ||
                  "—"
                }
                mono
              />

              {customerPhone && (
                <InfoCard
                  label="Phone"
                  value={customerPhone}
                />
              )}

              {customerEmail && (
                <InfoCard
                  label="Email"
                  value={customerEmail}
                />
              )}
            </div>
          </section>

          {/* ================= PRODUCTS ================= */}

          <section>
            <SectionHeading>
              Products to Replace
            </SectionHeading>

            <div className="mt-3 space-y-3">
              {items.length > 0 ? (
                items.map(
                  (
                    item,
                    index
                  ) => (
                    <ProductCard
                      key={`${item.id}-${item.variantId || "simple"}-${index}`}
                      item={item}
                    />
                  )
                )
              ) : (
                <div className="rounded-2xl border border-nexora-border bg-nexora-ivory p-4">
                  <p className="text-xs text-nexora-muted">
                    No replacement products
                    were found.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ================= REASON ================= */}

          <section>
            <SectionHeading>
              Customer Reason
            </SectionHeading>

            <div className="mt-3 rounded-2xl border border-nexora-border bg-nexora-ivory p-5">
              <p className="text-sm font-black capitalize text-nexora-text">
                {String(
                  replacementRequest.reason ||
                    "Not specified"
                ).replace(/_/g, " ")}
              </p>

              {replacementRequest.details ? (
                <p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-nexora-muted">
                  {
                    replacementRequest.details
                  }
                </p>
              ) : (
                <p className="mt-2 text-xs text-nexora-muted">
                  No additional details
                  provided.
                </p>
              )}
            </div>
          </section>

          {/* ================= INSPECTION ================= */}

          {[
            "inspected",
            "shipped",
            "delivered",
          ].includes(status) && (
            <section>
              <SectionHeading>
                Inspection
              </SectionHeading>

              <div className="mt-3 rounded-2xl border border-nexora-border bg-nexora-ivory p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-nexora-taupe">
                      Result
                    </p>

                    <p
                      className={`mt-1 text-sm font-black capitalize ${
                        inspectionResult ===
                        "resellable"
                          ? "text-emerald-700"
                          : "text-red-700"
                      }`}
                    >
                      {inspectionResult ||
                        "Not recorded"}
                    </p>
                  </div>

                  <InventoryBadge
                    restored={
                      replacementRequest.stockRestored
                    }
                  />
                </div>

                {replacementRequest.inspectionNote && (
                  <div className="mt-4 border-t border-nexora-border pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-nexora-taupe">
                      Inspection Note
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-nexora-muted">
                      {
                        replacementRequest.inspectionNote
                      }
                    </p>
                  </div>
                )}

                {replacementRequest.inspectionUpdatedReason && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                      Correction Reason
                    </p>

                    <p className="mt-2 text-xs leading-5 text-amber-800">
                      {
                        replacementRequest.inspectionUpdatedReason
                      }
                    </p>
                  </div>
                )}

                {canEditInspection && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      onEditInspection?.()
                    }
                    className="mt-4 rounded-full border border-nexora-border bg-nexora-surface px-4 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-nexora-primary transition hover:border-nexora-primary hover:bg-nexora-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Correct Inspection
                  </button>
                )}
              </div>
            </section>
          )}

          {/* ================= INVENTORY ================= */}

          <section>
            <SectionHeading>
              Inventory Status
            </SectionHeading>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <InventoryStateCard
                label="Returned Original"
                active={
                  replacementRequest.stockRestored ===
                  true
                }
                activeText="Stock restored"
                inactiveText={
                  inspectionResult ===
                  "defective"
                    ? "Defective — not restored"
                    : "Not restored"
                }
              />

              <InventoryStateCard
                label="Outgoing Replacement"
                active={
                  replacementRequest.replacementStockDeducted ===
                  true
                }
                activeText="Stock deducted"
                inactiveText="Not deducted"
              />
            </div>

            <p className="mt-3 text-[11px] leading-5 text-nexora-muted">
              Returned stock and outgoing
              replacement stock are tracked as
              separate inventory events.
            </p>
          </section>

          {/* ================= SHIPPING ================= */}

          {[
            "shipped",
            "delivered",
          ].includes(status) && (
            <section>
              <SectionHeading>
                Replacement Shipment
              </SectionHeading>

              <div className="mt-3 rounded-2xl border border-nexora-primary/15 bg-nexora-primary-soft/60 p-5">
                <p className="text-sm font-black text-nexora-primary">
                  Replacement stock has been
                  deducted.
                </p>

                <p className="mt-2 text-xs leading-5 text-nexora-muted">
                  The exact product and purchased
                  variant quantity were removed
                  from current inventory when this
                  replacement was shipped.
                </p>

                {replacementRequest.shippedAt && (
                  <p className="mt-3 text-[10px] font-semibold text-nexora-taupe">
                    Shipped{" "}
                    {formatDateTime(
                      replacementRequest.shippedAt
                    )}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* ================= TIMESTAMPS ================= */}

          <section>
            <SectionHeading>
              Activity
            </SectionHeading>

            <div className="mt-3 divide-y divide-nexora-border overflow-hidden rounded-2xl border border-nexora-border bg-nexora-ivory">
              <ActivityRow
                label="Requested"
                value={
                  replacementRequest.requestedAt ||
                  replacementRequest.createdAt
                }
              />

              {replacementRequest.approvedAt && (
                <ActivityRow
                  label="Approved"
                  value={
                    replacementRequest.approvedAt
                  }
                />
              )}

              {replacementRequest.rejectedAt && (
                <ActivityRow
                  label="Rejected"
                  value={
                    replacementRequest.rejectedAt
                  }
                />
              )}

              {replacementRequest.receivedAt && (
                <ActivityRow
                  label="Original received"
                  value={
                    replacementRequest.receivedAt
                  }
                />
              )}

              {replacementRequest.inspectedAt && (
                <ActivityRow
                  label="Inspected"
                  value={
                    replacementRequest.inspectedAt
                  }
                />
              )}

              {replacementRequest.inspectionUpdatedAt && (
                <ActivityRow
                  label="Inspection corrected"
                  value={
                    replacementRequest.inspectionUpdatedAt
                  }
                />
              )}

              {replacementRequest.shippedAt && (
                <ActivityRow
                  label="Replacement shipped"
                  value={
                    replacementRequest.shippedAt
                  }
                />
              )}

              {replacementRequest.deliveredAt && (
                <ActivityRow
                  label="Replacement delivered"
                  value={
                    replacementRequest.deliveredAt
                  }
                />
              )}
            </div>
          </section>
        </div>

        {/* ================= FOOTER ================= */}

        <div className="border-t border-nexora-border bg-nexora-surface px-6 py-5">
          {/* ================= REQUESTED ================= */}

          {status === "requested" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={
                  isBusy ||
                  !canReject
                }
                onClick={() =>
                  onReject?.()
                }
                className="h-11 rounded-full border border-red-200 bg-red-50 px-5 text-xs font-bold uppercase tracking-[0.08em] text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating
                  ? "Updating..."
                  : "Reject"}
              </button>

              <button
                type="button"
                disabled={
                  isBusy ||
                  !canApprove
                }
                onClick={() =>
                  onApprove?.()
                }
                className="h-11 rounded-full bg-nexora-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating
                  ? "Updating..."
                  : "Approve"}
              </button>
            </div>
          )}

          {/* ================= APPROVED ================= */}

          {status === "approved" && (
            <button
              type="button"
              disabled={
                isBusy ||
                !canMarkReceived
              }
              onClick={() =>
                onMarkReceived?.()
              }
              className="h-11 w-full rounded-full bg-nexora-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating
                ? "Updating..."
                : "Mark Original Received"}
            </button>
          )}

          {/* ================= RECEIVED ================= */}

          {status === "received" && (
            <button
              type="button"
              disabled={
                isBusy ||
                !canInspect
              }
              onClick={() =>
                onInspect?.()
              }
              className="h-11 w-full rounded-full bg-nexora-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Inspect Returned Item
            </button>
          )}

          {/* ================= INSPECTED ================= */}

          {status === "inspected" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-[11px] leading-5 text-amber-800">
                  Shipping will deduct the exact
                  replacement product and variant
                  quantity from current inventory.
                  This action should only be used
                  when the replacement is ready to
                  leave the warehouse.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  isBusy ||
                  !canShip
                }
                onClick={() =>
                  onShip?.()
                }
                className="h-11 w-full rounded-full bg-nexora-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isShipping
                  ? "Shipping..."
                  : "Ship Replacement"}
              </button>
            </div>
          )}

          {/* ================= SHIPPED ================= */}

          {status === "shipped" && (
            <button
              type="button"
              disabled={
                isBusy ||
                !canMarkDelivered
              }
              onClick={() =>
                onMarkDelivered?.()
              }
              className="h-11 w-full rounded-full bg-nexora-primary px-5 text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:bg-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating
                ? "Updating..."
                : "Mark Replacement Delivered"}
            </button>
          )}

          {/* ================= TERMINAL ================= */}

          {[
            "delivered",
            "rejected",
          ].includes(status) && (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black text-nexora-text">
                  {status ===
                  "delivered"
                    ? "Replacement completed"
                    : "Replacement rejected"}
                </p>

                <p className="mt-1 text-[10px] text-nexora-muted">
                  No further workflow actions
                  are available.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isBusy}
                className="rounded-full border border-nexora-border px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-nexora-primary transition hover:border-nexora-primary hover:bg-nexora-primary-soft"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

/* =====================================================
   REPLACEMENT TIMELINE
===================================================== */

const ReplacementTimeline = ({
  status,
}) => {
  if (
    status === "rejected"
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-xs font-black text-red-700">
          Replacement request rejected
        </p>

        <p className="mt-1 text-[11px] leading-5 text-red-600">
          The request will not continue
          through the replacement workflow.
        </p>
      </div>
    );
  }

  const steps = [
    "requested",
    "approved",
    "received",
    "inspected",
    "shipped",
    "delivered",
  ];

  const currentIndex =
    steps.indexOf(status);

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {steps.map(
        (
          step,
          index
        ) => {
          const completed =
            currentIndex >= index;

          return (
            <div
              key={step}
              className="min-w-0"
            >
              <div
                className={`h-1.5 rounded-full ${
                  completed
                    ? "bg-nexora-primary"
                    : "bg-nexora-border"
                }`}
              />

              <p
                className={`mt-2 truncate text-[9px] font-bold uppercase tracking-[0.08em] ${
                  completed
                    ? "text-nexora-primary"
                    : "text-nexora-muted"
                }`}
              >
                {step}
              </p>
            </div>
          );
        }
      )}
    </div>
  );
};

/* =====================================================
   PRODUCT CARD
===================================================== */

const ProductCard = ({
  item,
}) => (
  <div className="flex gap-4 rounded-2xl border border-nexora-border bg-nexora-ivory p-4">
    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-nexora-border bg-white">
      {item?.thumbnail ? (
        <img
          src={item.thumbnail}
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

    <div className="min-w-0 flex-1">
      <p className="text-sm font-black text-nexora-text">
        {item?.name ||
          "Unknown product"}
      </p>

      {item?.brand && (
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-nexora-taupe">
          {item.brand}
        </p>
      )}

      {item?.variantLabel && (
        <p className="mt-2 text-xs font-semibold text-nexora-primary">
          {item.variantLabel}
        </p>
      )}

      {item?.variantAttributes &&
        typeof item.variantAttributes ===
          "object" && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(
              item.variantAttributes
            ).map(
              ([
                key,
                value,
              ]) => (
                <span
                  key={key}
                  className="rounded-full border border-nexora-border bg-nexora-surface px-2 py-1 text-[9px] font-semibold text-nexora-muted"
                >
                  {key}: {value}
                </span>
              )
            )}
          </div>
        )}

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-nexora-muted">
        <span>
          Quantity:{" "}
          <strong className="text-nexora-text">
            {Number(
              item?.quantity
            ) || 0}
          </strong>
        </span>

        {item?.variantId && (
          <span>
            Variant:{" "}
            <strong className="font-mono text-nexora-text">
              {item.variantId}
            </strong>
          </span>
        )}
      </div>
    </div>
  </div>
);

/* =====================================================
   INFO CARD
===================================================== */

const InfoCard = ({
  label,
  value,
  mono = false,
}) => (
  <div className="rounded-2xl border border-nexora-border bg-nexora-ivory p-4">
    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-nexora-taupe">
      {label}
    </p>

    <p
      className={`mt-2 break-words text-xs font-bold text-nexora-text ${
        mono
          ? "font-mono"
          : ""
      }`}
    >
      {value}
    </p>
  </div>
);

/* =====================================================
   INVENTORY BADGE
===================================================== */

const InventoryBadge = ({
  restored,
}) => (
  <span
    className={`rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] ${
      restored
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-nexora-border bg-nexora-surface text-nexora-muted"
    }`}
  >
    {restored
      ? "Original stock restored"
      : "Original stock not restored"}
  </span>
);

/* =====================================================
   INVENTORY STATE CARD
===================================================== */

const InventoryStateCard = ({
  label,
  active,
  activeText,
  inactiveText,
}) => (
  <div className="rounded-2xl border border-nexora-border bg-nexora-ivory p-4">
    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-nexora-taupe">
      {label}
    </p>

    <div className="mt-3 flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-nexora-taupe"
        }`}
      />

      <p
        className={`text-xs font-bold ${
          active
            ? "text-emerald-700"
            : "text-nexora-muted"
        }`}
      >
        {active
          ? activeText
          : inactiveText}
      </p>
    </div>
  </div>
);

/* =====================================================
   ACTIVITY ROW
===================================================== */

const ActivityRow = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between gap-5 px-4 py-3">
    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-nexora-taupe">
      {label}
    </p>

    <p className="text-right text-[11px] font-semibold text-nexora-text">
      {formatDateTime(value)}
    </p>
  </div>
);

/* =====================================================
   STATUS BADGE
===================================================== */

const StatusBadge = ({
  status,
}) => {
  const styles = {
    requested:
      "border-amber-200 bg-amber-50 text-amber-700",

    approved:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    received:
      "border-nexora-primary/20 bg-nexora-primary-soft text-nexora-primary",

    inspected:
      "border-violet-200 bg-violet-50 text-violet-700",

    shipped:
      "border-blue-200 bg-blue-50 text-blue-700",

    delivered:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    rejected:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] ${
        styles[status] ||
        styles.requested
      }`}
    >
      {status}
    </span>
  );
};

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

/* =====================================================
   FORMAT DATE
===================================================== */

const formatDateTime = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
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

export default ReplacementDetailsDrawer;