const UserRow = ({
  user,
  isUpdating,
  onToggleBlock,
}) => {
  const isBlocked =
    user.isBlocked === true;

  const userInitial =
    user.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "U";

  return (
    <tr
      className="
        border-b
        border-nexora-border
        transition-colors
        last:border-b-0
        hover:bg-nexora-ivory/60
      "
    >

      {/* ================= CUSTOMER ================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-4
          sm:px-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-nexora-primary-soft
              text-sm
              font-bold
              text-nexora-primary
            "
          >
            {userInitial}
          </div>

          <div>
            <p
              className="
                font-semibold
                text-nexora-text
              "
            >
              {user.name || "Unnamed User"}
            </p>

            <p
              className="
                mt-0.5
                text-xs
                text-nexora-muted
              "
            >
              ID: {user.id}
            </p>
          </div>
        </div>
      </td>

      {/* ================= EMAIL ================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-4
          text-sm
          text-nexora-muted
          sm:px-6
        "
      >
        {user.email || "—"}
      </td>

      {/* ================= STATUS ================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-4
          sm:px-6
        "
      >
        <span
          className={`
            inline-flex
            items-center
            gap-2
            rounded-full
            px-3
            py-1.5
            text-xs
            font-semibold
            ring-1
            ring-inset
            ${
              isBlocked
                ? `
                  bg-red-50
                  text-red-700
                  ring-red-200
                `
                : `
                  bg-emerald-50
                  text-emerald-700
                  ring-emerald-200
                `
            }
          `}
        >
          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${
                isBlocked
                  ? "bg-red-500"
                  : "bg-emerald-500"
              }
            `}
          />

          {isBlocked
            ? "Blocked"
            : "Active"}
        </span>
      </td>

      {/* ================= ACTION ================= */}

      <td
        className="
          whitespace-nowrap
          px-5
          py-4
          text-right
          sm:px-6
        "
      >
        <button
          type="button"
          disabled={isUpdating}
          onClick={() =>
            onToggleBlock(user)
          }
          className={`
            min-w-24
            rounded-xl
            border
            px-4
            py-2
            text-xs
            font-semibold
            transition
            disabled:cursor-not-allowed
            disabled:opacity-50
            ${
              isBlocked
                ? `
                  border-nexora-border
                  bg-nexora-surface
                  text-nexora-primary
                  hover:border-nexora-primary
                  hover:bg-nexora-primary
                  hover:text-white
                `
                : `
                  border-red-200
                  bg-red-50
                  text-red-700
                  hover:bg-red-600
                  hover:text-white
                `
            }
          `}
        >
          {isUpdating
            ? "Updating..."
            : isBlocked
              ? "Unblock"
              : "Block"}
        </button>
      </td>
    </tr>
  );
};

export default UserRow;