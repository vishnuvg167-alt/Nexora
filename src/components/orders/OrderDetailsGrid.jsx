const OrderDetailsGrid = ({
  order,
  paymentMethodLabel,
  paymentStatusLabel,
}) => {
  /* ================= PAYMENT ================= */

  const paymentStatus = (order.paymentStatus || "unknown").toLowerCase();
  const paymentMethod = (order.paymentMethod || "unknown").toLowerCase();
  const paymentId = order.paymentId || null;

  /* ================= PRICE ================= */

  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discount) || 0;
  const shipping = Number(order.shipping) || 0;

  const storedTotal = Number(order.total);

  const finalTotal = Number.isFinite(storedTotal)
    ? storedTotal
    : Math.max(0, subtotal - discount + shipping);

  const coupon = order.coupon || null;
  const hasCoupon = Boolean(coupon?.code) && discount > 0;

  /* ================= FORMAT MONEY ================= */

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="grid overflow-hidden rounded-[1.5rem] border border-nexora-border bg-nexora-surface lg:grid-cols-[1.2fr_0.9fr_1fr]">
      {/* =====================================================
          DELIVERY
      ===================================================== */}

      <section className="p-5 sm:p-6 lg:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-nexora-primary-soft text-nexora-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21s7-5.4 7-12a7 7 0 1 0-14 0c0 6.6 7 12 7 12Z"
              />

              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
              Delivery
            </p>

            <p className="mt-0.5 text-xs font-semibold text-nexora-muted">
              Shipping address
            </p>
          </div>
        </div>

        {order.shippingAddress ? (
          <div className="mt-6">
            <p className="text-sm font-black text-nexora-text">
              {order.shippingAddress.name || "Customer"}
            </p>

            <p className="mt-2 max-w-sm text-xs leading-6 text-nexora-muted">
              {order.shippingAddress.address}

              {order.shippingAddress.city &&
                `, ${order.shippingAddress.city}`}

              {order.shippingAddress.state &&
                `, ${order.shippingAddress.state}`}

              {order.shippingAddress.pincode &&
                ` - ${order.shippingAddress.pincode}`}
            </p>

            {order.shippingAddress.phone && (
              <div className="mt-4 flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-3.5 w-3.5 text-nexora-taupe"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 3H4.5A1.5 1.5 0 0 0 3 4.5C3 13.6 10.4 21 19.5 21a1.5 1.5 0 0 0 1.5-1.5V17l-4-1-1.2 2a15.2 15.2 0 0 1-9.8-9.8L8 7 7 3Z"
                  />
                </svg>

                <span className="text-xs font-medium text-nexora-muted">
                  {order.shippingAddress.phone}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-6 text-xs text-nexora-muted">
            Delivery address not available.
          </p>
        )}
      </section>

      {/* =====================================================
          PAYMENT
      ===================================================== */}

      <section className="border-t border-nexora-border p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-nexora-primary-soft text-nexora-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
              Payment
            </p>

            <p className="mt-0.5 text-xs font-semibold text-nexora-muted">
              Transaction details
            </p>
          </div>
        </div>

        <div className="mt-6">
          <PaymentStatusBadge
            status={paymentStatus}
            label={paymentStatusLabel}
          />

          <div className="mt-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
              Method
            </p>

            <p className="mt-1.5 text-sm font-bold text-nexora-text">
              {paymentMethodLabel}
            </p>
          </div>

          {paymentMethod === "cod" && paymentStatus === "pending" && (
            <p className="mt-3 max-w-[230px] text-[11px] leading-5 text-nexora-muted">
              Payment will be collected when your order is delivered.
            </p>
          )}

          {paymentId && (
            <div className="mt-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
                Payment ID
              </p>

              <p
                title={paymentId}
                className="mt-1.5 max-w-[230px] truncate font-mono text-[11px] text-nexora-muted"
              >
                {paymentId}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="border-t border-nexora-border bg-nexora-ivory/45 p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
              Order Summary
            </p>

            <p className="mt-1 text-xs text-nexora-muted">
              Payment breakdown
            </p>
          </div>

          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexora-taupe">
            INR
          </span>
        </div>

        <div className="mt-6 space-y-3">
          <SummaryRow
            label="Subtotal"
            value={`₹${formatMoney(subtotal)}`}
          />

          {hasCoupon && (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-emerald-700">
                  Discount
                </p>

                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-600">
                  {coupon.code}
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-700">
                -₹{formatMoney(discount)}
              </span>
            </div>
          )}

          <SummaryRow
            label="Shipping"
            value={
              shipping === 0
                ? "Free"
                : `₹${formatMoney(shipping)}`
            }
          />
        </div>

        <div className="my-5 border-t border-nexora-border" />

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-nexora-taupe">
              Total
            </p>

            <p className="mt-1 text-[10px] text-nexora-muted">
              Including applicable charges
            </p>
          </div>

          <p className="text-2xl font-black tracking-[-0.04em] text-nexora-primary">
            ₹{formatMoney(finalTotal)}
          </p>
        </div>

        {hasCoupon && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[8px] font-black text-white">
                ✓
              </div>

              <p className="text-[10px] font-semibold leading-4 text-emerald-700">
                You saved ₹{formatMoney(discount)} with{" "}
                <span className="font-black">{coupon.code}</span>
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

/* =====================================================
   PAYMENT STATUS BADGE
===================================================== */

const PaymentStatusBadge = ({ status, label }) => {
  if (status === "paid") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-nexora-primary/15 bg-nexora-primary-soft px-3 py-1.5">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-nexora-primary text-[8px] font-black text-white">
          ✓
        </span>

        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-nexora-primary">
          Paid
        </span>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-700">
          Payment Pending
        </span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-red-700">
          Payment Failed
        </span>
      </div>
    );
  }

  if (status === "refunded") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-nexora-border bg-nexora-taupe-soft px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-nexora-taupe" />

        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-nexora-muted">
          Refunded
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center rounded-full border border-nexora-border bg-nexora-taupe-soft px-3 py-1.5">
      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-nexora-muted">
        {label}
      </span>
    </div>
  );
};

/* =====================================================
   SUMMARY ROW
===================================================== */

const SummaryRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-nexora-muted">
        {label}
      </span>

      <span className="text-xs font-bold text-nexora-text">
        {value}
      </span>
    </div>
  );
};

export default OrderDetailsGrid;