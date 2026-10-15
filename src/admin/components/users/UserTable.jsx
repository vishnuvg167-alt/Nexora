import UserRow from "./UserRow";

const UserTable = ({
  users,
  updatingUserId,
  onToggleBlock,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">

        {/* ================= HEADER ================= */}

        <thead
          className="
            border-b
            border-nexora-border
            bg-nexora-ivory/70
          "
        >
          <tr>
            <TableHeading>
              Customer
            </TableHeading>

            <TableHeading>
              Email
            </TableHeading>

            <TableHeading>
              Status
            </TableHeading>

            <TableHeading align="right">
              Actions
            </TableHeading>
          </tr>
        </thead>

        {/* ================= BODY ================= */}

        <tbody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isUpdating={
                String(updatingUserId) ===
                String(user.id)
              }
              onToggleBlock={
                onToggleBlock
              }
            />
          ))}
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

export default UserTable;