import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchAdminUsers,
  toggleUserBlock,
} from "../../redux/slices/adminUserSlice";

import UserTable from "../components/users/UserTable";
import UserPagination from "../components/users/UserPagination";

/* ================= CONSTANTS ================= */

const USERS_PER_PAGE = 8;

/* ================= COMPONENT ================= */

const AdminUsers = () => {
  const dispatch = useDispatch();

  /* ================= REDUX ================= */

  const {
    items: users,
    loading,
    error,
    updatingUserId,
  } = useSelector(
    (state) => state.adminUsers
  );

  /* ================= LOCAL STATE ================= */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [currentPage, setCurrentPage] =
    useState(1);

  /* ================= FETCH USERS ================= */

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  /* ================= USER STATISTICS ================= */

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => !user.isBlocked
  ).length;

  const blockedUsers = users.filter(
    (user) => user.isBlocked
  ).length;

  /* ================= FILTER USERS ================= */

  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        user.email
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        String(user.id)
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          !user.isBlocked) ||
        (statusFilter === "blocked" &&
          user.isBlocked);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    statusFilter,
  ]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(
    filteredUsers.length /
      USERS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) *
    USERS_PER_PAGE;

  const paginatedUsers =
    filteredUsers.slice(
      startIndex,
      startIndex +
        USERS_PER_PAGE
    );

  /* ================= RESET PAGE ================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
  ]);

  /* ================= KEEP PAGE VALID ================= */

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  /* ================= BLOCK / UNBLOCK ================= */

  const handleToggleBlock = async (
    user
  ) => {
    const nextBlockedStatus =
      !user.isBlocked;

    try {
      await dispatch(
        toggleUserBlock({
          userId: user.id,
          isBlocked:
            nextBlockedStatus,
        })
      ).unwrap();
    } catch (error) {
      console.error(
        "Failed to update customer:",
        error
      );
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-8">

      {/* ================= HEADER ================= */}

      <section
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div>
          <p
            className="
              mb-2
              text-xs
              font-bold
              uppercase
              tracking-[0.18em]
              text-nexora-taupe
            "
          >
            Customer Management
          </p>

          <h1
            className="
              text-3xl
              font-bold
              tracking-[-0.04em]
              text-nexora-text
              sm:text-4xl
            "
          >
            Users
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-nexora-muted
            "
          >
            View registered customers
            and manage their account
            access.
          </p>
        </div>
      </section>

      {/* ================= STATS ================= */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-3
        "
      >
        <StatCard
          label="Total Customers"
          value={totalUsers}
          type="total"
        />

        <StatCard
          label="Active Customers"
          value={activeUsers}
          type="active"
        />

        <StatCard
          label="Blocked Customers"
          value={blockedUsers}
          type="blocked"
        />
      </section>

      {/* ================= USERS PANEL ================= */}

      <section
        className="
          overflow-hidden
          rounded-[1.75rem]
          border
          border-nexora-border
          bg-nexora-surface
          shadow-sm
        "
      >

        {/* ================= TOOLBAR ================= */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-nexora-border
            p-5
            sm:p-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <h2
              className="
                text-lg
                font-bold
                text-nexora-text
              "
            >
              Customer Directory
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-nexora-muted
              "
            >
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1
                ? "customer"
                : "customers"}{" "}
              found
            </p>
          </div>

          <div
            className="
              flex
              w-full
              flex-col
              gap-3
              sm:flex-row
              lg:w-auto
            "
          >

            {/* ================= SEARCH ================= */}

            <div
              className="
                relative
                w-full
                sm:w-72
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-nexora-taupe
                "
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search customers..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-nexora-border
                  bg-nexora-ivory
                  pl-11
                  pr-4
                  text-sm
                  text-nexora-text
                  outline-none
                  placeholder:text-nexora-muted
                  focus:border-nexora-primary
                  focus:ring-2
                  focus:ring-nexora-primary/10
                "
              />
            </div>

            {/* ================= STATUS FILTER ================= */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="
                h-11
                rounded-xl
                border
                border-nexora-border
                bg-nexora-ivory
                px-4
                text-sm
                font-medium
                text-nexora-text
                outline-none
                focus:border-nexora-primary
                focus:ring-2
                focus:ring-nexora-primary/10
              "
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="blocked">
                Blocked
              </option>
            </select>
          </div>
        </div>

        {/* ================= CONTENT ================= */}

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            error={error}
            onRetry={() =>
              dispatch(
                fetchAdminUsers()
              )
            }
          />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search) ||
              statusFilter !== "all"
            }
          />
        ) : (
          <>
            <UserTable
              users={paginatedUsers}
              updatingUserId={
                updatingUserId
              }
              onToggleBlock={
                handleToggleBlock
              }
            />

            <UserPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={
                setCurrentPage
              }
            />
          </>
        )}
      </section>
    </div>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({
  label,
  value,
  type,
}) => {
  const styles = {
    total: {
      wrapper:
        "bg-nexora-primary-soft",
      value:
        "text-nexora-primary",
    },

    active: {
      wrapper:
        "bg-emerald-50",
      value:
        "text-emerald-700",
    },

    blocked: {
      wrapper:
        "bg-red-50",
      value:
        "text-red-700",
    },
  };

  const currentStyle =
    styles[type] || styles.total;

  return (
    <article
      className="
        rounded-2xl
        border
        border-nexora-border
        bg-nexora-surface
        p-5
        shadow-sm
      "
    >
      <div
        className={`
          mb-5
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${currentStyle.wrapper}
        `}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
          className={`
            h-5
            w-5
            ${currentStyle.value}
          `}
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

          <circle
            cx="9"
            cy="7"
            r="4"
          />

          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>

      <p
        className="
          text-xs
          font-semibold
          uppercase
          tracking-[0.12em]
          text-nexora-taupe
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-2
          text-3xl
          font-bold
          tracking-[-0.04em]
          ${currentStyle.value}
        `}
      >
        {value}
      </p>
    </article>
  );
};

/* =====================================================
   LOADING STATE
===================================================== */

const LoadingState = () => {
  return (
    <div
      className="
        flex
        min-h-64
        items-center
        justify-center
        p-8
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          gap-3
        "
      >
        <div
          className="
            h-8
            w-8
            animate-spin
            rounded-full
            border-2
            border-nexora-primary-soft
            border-t-nexora-primary
          "
        />

        <p
          className="
            text-sm
            text-nexora-muted
          "
        >
          Loading customers...
        </p>
      </div>
    </div>
  );
};

/* =====================================================
   ERROR STATE
===================================================== */

const ErrorState = ({
  error,
  onRetry,
}) => {
  return (
    <div
      className="
        flex
        min-h-64
        items-center
        justify-center
        p-6
      "
    >
      <div className="text-center">
        <p
          className="
            font-semibold
            text-red-700
          "
        >
          Unable to load customers
        </p>

        <p
          className="
            mt-2
            text-sm
            text-nexora-muted
          "
        >
          {error}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="
            mt-5
            rounded-xl
            bg-nexora-primary
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            hover:bg-nexora-primary-hover
          "
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

/* =====================================================
   EMPTY STATE
===================================================== */

const EmptyState = ({
  hasFilters,
}) => {
  return (
    <div
      className="
        flex
        min-h-64
        items-center
        justify-center
        p-6
      "
    >
      <div className="text-center">
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-nexora-primary-soft
            text-nexora-primary
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

            <circle
              cx="9"
              cy="7"
              r="4"
            />
          </svg>
        </div>

        <h3
          className="
            mt-4
            font-semibold
            text-nexora-text
          "
        >
          {hasFilters
            ? "No customers found"
            : "No customers yet"}
        </h3>

        <p
          className="
            mt-1
            text-sm
            text-nexora-muted
          "
        >
          {hasFilters
            ? "Try changing your search or status filter."
            : "Registered customers will appear here."}
        </p>
      </div>
    </div>
  );
};

export default AdminUsers;