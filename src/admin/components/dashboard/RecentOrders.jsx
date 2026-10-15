const RecentOrders = ({
  orders,
}) => {
  const recentOrders = [
    ...orders,
  ]
    .sort(
      (a, b) =>
        new Date(
          b.createdAt
        ) -
        new Date(
          a.createdAt
        )
    )
    .slice(0, 5);

  /* ================= STATUS STYLE ================= */

  const getStatusStyle = (
    status
  ) => {
    const normalizedStatus =
      String(
        status || ""
      ).toLowerCase();

    if (
      normalizedStatus ===
        "delivered" ||
      normalizedStatus ===
        "completed"
    ) {
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }

    if (
      normalizedStatus ===
        "cancelled" ||
      normalizedStatus ===
        "failed"
    ) {
      return "bg-red-50 text-red-600 ring-red-200";
    }

    if (
      normalizedStatus ===
        "shipped" ||
      normalizedStatus ===
        "processing"
    ) {
      return "bg-amber-50 text-amber-700 ring-amber-200";
    }

    return "bg-nexora-primary-soft text-nexora-primary ring-nexora-primary/10";
  };

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-nexora-border bg-nexora-surface shadow-[0_8px_30px_rgba(18,63,50,0.04)]">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col justify-between gap-4 border-b border-nexora-border px-5 py-5 sm:flex-row sm:items-center sm:px-6">

        <div>

          <div className="flex items-center gap-3">

            <span className="h-px w-7 bg-nexora-taupe" />

            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexora-taupe">
              Orders
            </p>

          </div>

          <h2 className="mt-2 text-lg font-bold tracking-[-0.02em] text-nexora-text">
            Recent Orders
          </h2>

          <p className="mt-1 text-xs text-nexora-muted">
            Latest customer orders
            across NEXORA.
          </p>

        </div>

        <div className="rounded-full bg-nexora-primary-soft px-3 py-1.5">

          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-nexora-primary">
            Latest 5
          </p>

        </div>

      </div>

      {/* ================= EMPTY ================= */}

      {recentOrders.length ===
      0 ? (

        <div className="px-6 py-16 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-nexora-primary-soft text-nexora-primary">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />

              <path d="M9 8h6M9 12h6" />
            </svg>

          </div>

          <p className="mt-4 text-sm font-semibold text-nexora-text">
            No orders found
          </p>

          <p className="mt-1 text-xs text-nexora-muted">
            Customer orders will
            appear here.
          </p>

        </div>

      ) : (

        /* ================= TABLE ================= */

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="border-b border-nexora-border bg-nexora-ivory/60">

              <tr>

                <th className="whitespace-nowrap px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe sm:px-6">
                  Order
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe sm:px-6">
                  Customer
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe sm:px-6">
                  Total
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe sm:px-6">
                  Status
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-nexora-taupe sm:px-6">
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {recentOrders.map(
                (order) => (

                  <tr
                    key={order.id}
                    className="border-b border-nexora-border transition-colors last:border-b-0 hover:bg-nexora-ivory/60"
                  >

                    {/* ORDER */}

                    <td className="whitespace-nowrap px-5 py-4 sm:px-6">

                      <span className="font-bold text-nexora-primary">
                        #{order.id}
                      </span>

                    </td>

                    {/* CUSTOMER */}

                    <td className="whitespace-nowrap px-5 py-4 font-medium text-nexora-text sm:px-6">

                      {order
                        .shippingAddress
                        ?.name ||
                        "Unknown"}

                    </td>

                    {/* TOTAL */}

                    <td className="whitespace-nowrap px-5 py-4 font-bold text-nexora-text sm:px-6">

                      ₹
                      {Number(
                        order.total ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </td>

                    {/* STATUS */}

                    <td className="whitespace-nowrap px-5 py-4 sm:px-6">

                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-3
                          py-1.5
                          text-[11px]
                          font-semibold
                          capitalize
                          ring-1
                          ring-inset
                          ${getStatusStyle(
                            order.status
                          )}
                        `}
                      >
                        {order.status ||
                          "Pending"}
                      </span>

                    </td>

                    {/* DATE */}

                    <td className="whitespace-nowrap px-5 py-4 text-nexora-muted sm:px-6">

                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "—"}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </section>
  );
};

export default RecentOrders;