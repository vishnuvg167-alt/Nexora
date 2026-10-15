import OrderRow from "./OrderRow";

const OrderTable = ({
  orders,
  onViewOrder,
}) => {
  /* ================= SAFE ORDERS ================= */

  const safeOrders =
    Array.isArray(orders)
      ? orders
      : [];

  /* ================= UI ================= */

  return (
    <div className="overflow-x-auto">

      <table className="w-full min-w-[1050px] text-left">

        {/* ================= TABLE HEADER ================= */}

        <thead
          className="
            border-b
            border-nexora-border
            bg-nexora-ivory/70
          "
        >
          <tr>

            {/* ORDER */}

            <TableHeading>
              Order
            </TableHeading>

            {/* CUSTOMER */}

            <TableHeading>
              Customer
            </TableHeading>

            {/* ITEMS */}

            <TableHeading>
              Items
            </TableHeading>

            {/* TOTAL */}

            <TableHeading>
              Total
            </TableHeading>

            {/* PAYMENT */}

            <TableHeading>
              Payment
            </TableHeading>

            {/* ORDER STATUS */}

            <TableHeading>
              Status
            </TableHeading>

            {/* ACTIONS */}

            <TableHeading align="right">
              Actions
            </TableHeading>

          </tr>
        </thead>

        {/* ================= TABLE BODY ================= */}

        <tbody>
          {safeOrders.map(
            (order) => (
              <OrderRow
                key={order.id}
                order={order}
                onViewOrder={
                  onViewOrder
                }
              />
            )
          )}
        </tbody>

      </table>

    </div>
  );
};

/* =====================================================
   TABLE HEADING
===================================================== */

const TableHeading = ({
  children,
  align = "left",
}) => {
  return (
    <th
      scope="col"
      className={`
        whitespace-nowrap
        px-5
        py-4
        text-[10px]
        font-bold
        uppercase
        tracking-[0.16em]
        text-nexora-taupe
        sm:px-6

        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
};

export default OrderTable;