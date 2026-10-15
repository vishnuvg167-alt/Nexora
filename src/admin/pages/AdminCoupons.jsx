import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAllCoupons,
  createCoupon,
  deleteCoupon,
  updateCoupon,
} from "../../services/couponService";

import CouponFormDrawer from "../components/coupons/CouponFormDrawer";

/* =====================================================
   ADMIN COUPONS
===================================================== */

const AdminCoupons = () => {
  /* =====================================================
     STATE
  ===================================================== */

  const [coupons, setCoupons] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("all");

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  /* ================= DRAWER ================= */

  const [
    isCouponDrawerOpen,
    setIsCouponDrawerOpen,
  ] = useState(false);

  const [
    selectedCoupon,
    setSelectedCoupon,
  ] = useState(null);

  const [
    isSavingCoupon,
    setIsSavingCoupon,
  ] = useState(false);

  /* =====================================================
     FETCH COUPONS
  ===================================================== */

  const fetchCoupons =
    async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getAllCoupons();

        setCoupons(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to load coupons."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCoupons();
  }, []);

  /* =====================================================
     HELPERS
  ===================================================== */

  const isExpired = (
    coupon
  ) => {
    if (
      !coupon.expiryDate
    ) {
      return false;
    }

    const expiryTime =
      new Date(
        coupon.expiryDate
      ).getTime();

    if (
      Number.isNaN(
        expiryTime
      )
    ) {
      return false;
    }

    return (
      expiryTime <
      Date.now()
    );
  };

  const getCouponStatus = (
    coupon
  ) => {
    if (
      isExpired(coupon)
    ) {
      return "expired";
    }

    if (
      coupon.isActive ===
      false
    ) {
      return "inactive";
    }

    return "active";
  };

  const formatCurrency = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    );
  };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "No expiry";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Invalid date";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     FILTERED COUPONS
  ===================================================== */

  const filteredCoupons =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return coupons.filter(
        (coupon) => {
          const status =
            getCouponStatus(
              coupon
            );

          const matchesSearch =
            !normalizedSearch ||
            coupon.code
              ?.toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesStatus =
            statusFilter ===
              "all" ||
            status ===
              statusFilter;

          const matchesType =
            typeFilter ===
              "all" ||
            coupon.type ===
              typeFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType
          );
        }
      );
    }, [
      coupons,
      search,
      statusFilter,
      typeFilter,
    ]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const stats =
    useMemo(() => {
      const active =
        coupons.filter(
          (coupon) =>
            getCouponStatus(
              coupon
            ) === "active"
        ).length;

      const inactive =
        coupons.filter(
          (coupon) =>
            getCouponStatus(
              coupon
            ) ===
            "inactive"
        ).length;

      const expired =
        coupons.filter(
          (coupon) =>
            getCouponStatus(
              coupon
            ) === "expired"
        ).length;

      return {
        total:
          coupons.length,
        active,
        inactive,
        expired,
      };
    }, [coupons]);

  /* =====================================================
     OPEN ADD COUPON
  ===================================================== */

  const handleOpenAddCoupon =
    () => {
      setSelectedCoupon(
        null
      );

      setError("");

      setIsCouponDrawerOpen(
        true
      );
    };

  /* =====================================================
     OPEN EDIT COUPON
  ===================================================== */

  const handleOpenEditCoupon =
    (coupon) => {
      setSelectedCoupon(
        coupon
      );

      setError("");

      setIsCouponDrawerOpen(
        true
      );
    };

  /* =====================================================
     CLOSE DRAWER
  ===================================================== */

  const handleCloseCouponDrawer =
    () => {
      if (
        isSavingCoupon
      ) {
        return;
      }

      setSelectedCoupon(
        null
      );

      setIsCouponDrawerOpen(
        false
      );
    };

  /* =====================================================
     SAVE COUPON
     CREATE / UPDATE
  ===================================================== */

  const handleSaveCoupon =
    async (couponData) => {
      setIsSavingCoupon(
        true
      );

      setError("");

      try {
        /* ================= EDIT ================= */

        if (
          selectedCoupon
        ) {
          const updatedCoupon =
            await updateCoupon(
              selectedCoupon.id,
              couponData
            );

          setCoupons(
            (current) =>
              current.map(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    selectedCoupon.id
                  )
                    ? updatedCoupon
                    : item
              )
          );
        }

        /* ================= ADD ================= */

        else {
          const newCoupon =
            await createCoupon({
              ...couponData,

              createdAt:
                new Date().toISOString(),
            });

          setCoupons(
            (current) => [
              newCoupon,
              ...current,
            ]
          );
        }

        setSelectedCoupon(
          null
        );

        setIsCouponDrawerOpen(
          false
        );
      } catch (error) {
        const message =
          error.response?.data
            ?.message ||
          error.message ||
          "Failed to save coupon.";

        setError(message);

        throw new Error(
          message
        );
      } finally {
        setIsSavingCoupon(
          false
        );
      }
    };

  /* =====================================================
     TOGGLE ACTIVE STATUS
  ===================================================== */

  const handleToggleStatus =
    async (coupon) => {
      if (
        isExpired(coupon)
      ) {
        return;
      }

      setUpdatingId(
        coupon.id
      );

      setError("");

      try {
        const updatedCoupon =
          await updateCoupon(
            coupon.id,
            {
              isActive:
                !coupon.isActive,
            }
          );

        setCoupons(
          (current) =>
            current.map(
              (item) =>
                String(
                  item.id
                ) ===
                String(
                  coupon.id
                )
                  ? updatedCoupon
                  : item
            )
        );
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to update coupon."
        );
      } finally {
        setUpdatingId(
          null
        );
      }
    };

  /* =====================================================
     DELETE COUPON
  ===================================================== */

  const handleDelete =
    async (coupon) => {
      const confirmed =
        window.confirm(
          `Delete coupon "${coupon.code}"?`
        );

      if (!confirmed) {
        return;
      }

      setDeletingId(
        coupon.id
      );

      setError("");

      try {
        await deleteCoupon(
          coupon.id
        );

        setCoupons(
          (current) =>
            current.filter(
              (item) =>
                String(
                  item.id
                ) !==
                String(
                  coupon.id
                )
            )
        );
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to delete coupon."
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-3 w-36 animate-pulse rounded-full bg-nexora-taupe-soft" />

          <div className="mt-4 h-10 w-48 animate-pulse rounded-xl bg-nexora-primary-soft" />

          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded-full bg-nexora-taupe-soft" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl border border-nexora-border bg-nexora-surface"
              />
            )
          )}
        </div>

        <div className="h-96 animate-pulse rounded-[2rem] border border-nexora-border bg-nexora-surface" />
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-8">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-nexora-taupe">
            Promotion Management
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-nexora-text sm:text-4xl">
            Coupons
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-nexora-muted">
            Create and manage
            discount codes for the
            NEXORA storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleOpenAddCoupon
          }
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-nexora-primary
            px-5
            py-3
            text-sm
            font-bold
            text-white
            transition
            hover:bg-nexora-primary-hover
          "
        >
          <span className="text-lg leading-none">
            +
          </span>

          Add Coupon
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* =================================================
          STATS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total Coupons"
          value={stats.total}
          tone="primary"
        />

        <StatCard
          label="Active"
          value={stats.active}
          tone="success"
        />

        <StatCard
          label="Inactive"
          value={stats.inactive}
          tone="neutral"
        />

        <StatCard
          label="Expired"
          value={stats.expired}
          tone="danger"
        />

      </div>

      {/* =================================================
          DIRECTORY
      ================================================= */}

      <section className="overflow-hidden rounded-[2rem] border border-nexora-border bg-nexora-surface">

        {/* DIRECTORY HEADER */}

        <div className="flex flex-col gap-5 border-b border-nexora-border px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h2 className="text-lg font-black tracking-tight text-nexora-text">
              Coupon Directory
            </h2>

            <p className="mt-1 text-xs text-nexora-muted">
              {
                filteredCoupons.length
              }{" "}
              {filteredCoupons.length ===
              1
                ? "coupon"
                : "coupons"}{" "}
              found
            </p>
          </div>

          {/* FILTERS */}

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* SEARCH */}

            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nexora-taupe"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                type="search"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search coupons..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-nexora-border
                  bg-nexora-ivory
                  pl-10
                  pr-4
                  text-sm
                  text-nexora-text
                  outline-none
                  placeholder:text-nexora-muted
                  focus:border-nexora-primary
                  focus:ring-2
                  focus:ring-nexora-primary/10
                  sm:w-56
                "
              />
            </div>

            {/* STATUS FILTER */}

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
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
              "
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

              <option value="expired">
                Expired
              </option>
            </select>

            {/* TYPE FILTER */}

            <select
              value={
                typeFilter
              }
              onChange={(
                event
              ) =>
                setTypeFilter(
                  event.target
                    .value
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
              "
            >
              <option value="all">
                All Types
              </option>

              <option value="percentage">
                Percentage
              </option>

              <option value="fixed">
                Fixed
              </option>
            </select>

          </div>

        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {filteredCoupons.length ===
        0 ? (
          <div className="px-6 py-20 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-nexora-primary-soft text-nexora-primary">
              %
            </div>

            <h3 className="mt-5 text-lg font-black text-nexora-text">
              No coupons found
            </h3>

            <p className="mt-2 text-sm text-nexora-muted">
              Try changing your
              search or filters.
            </p>

          </div>
        ) : (
          /* =================================================
             TABLE
          ================================================= */

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] text-left">

              <thead className="border-b border-nexora-border bg-nexora-ivory/70">

                <tr>
                  <TableHeading>
                    Coupon
                  </TableHeading>

                  <TableHeading>
                    Discount
                  </TableHeading>

                  <TableHeading>
                    Minimum Order
                  </TableHeading>

                  <TableHeading>
                    Expiry
                  </TableHeading>

                  <TableHeading>
                    Status
                  </TableHeading>

                  <TableHeading align="right">
                    Actions
                  </TableHeading>
                </tr>

              </thead>

              <tbody className="divide-y divide-nexora-border">

                {filteredCoupons.map(
                  (coupon) => {
                    const status =
                      getCouponStatus(
                        coupon
                      );

                    const isDeleting =
                      String(
                        deletingId
                      ) ===
                      String(
                        coupon.id
                      );

                    const isUpdating =
                      String(
                        updatingId
                      ) ===
                      String(
                        coupon.id
                      );

                    return (
                      <tr
                        key={
                          coupon.id
                        }
                        className="transition hover:bg-nexora-ivory/60"
                      >

                        {/* COUPON */}

                        <td className="px-5 py-5 sm:px-6">

                          <div>
                            <div className="flex items-center gap-2">

                              <span className="rounded-lg bg-nexora-primary-soft px-2.5 py-1 font-mono text-xs font-black tracking-[0.08em] text-nexora-primary">
                                {
                                  coupon.code
                                }
                              </span>

                            </div>

                            <p className="mt-2 text-xs capitalize text-nexora-muted">
                              {
                                coupon.type
                              }{" "}
                              discount
                            </p>
                          </div>

                        </td>

                        {/* DISCOUNT */}

                        <td className="px-5 py-5 sm:px-6">

                          <p className="text-sm font-black text-nexora-text">

                            {coupon.type ===
                            "percentage"
                              ? `${Number(
                                  coupon.value ||
                                    0
                                )}%`
                              : formatCurrency(
                                  coupon.value
                                )}

                          </p>

                          {coupon.type ===
                            "percentage" &&
                            Number(
                              coupon.maxDiscount ||
                                0
                            ) >
                              0 && (
                              <p className="mt-1 text-[11px] text-nexora-muted">
                                Max{" "}
                                {formatCurrency(
                                  coupon.maxDiscount
                                )}
                              </p>
                            )}

                        </td>

                        {/* MINIMUM ORDER */}

                        <td className="px-5 py-5 sm:px-6">

                          <p className="text-sm font-semibold text-nexora-text">

                            {Number(
                              coupon.minOrder ||
                                0
                            ) >
                            0
                              ? formatCurrency(
                                  coupon.minOrder
                                )
                              : "No minimum"}

                          </p>

                        </td>

                        {/* EXPIRY */}

                        <td className="px-5 py-5 sm:px-6">

                          <p
                            className={`
                              text-sm
                              font-semibold
                              ${
                                status ===
                                "expired"
                                  ? "text-red-600"
                                  : "text-nexora-text"
                              }
                            `}
                          >
                            {formatDate(
                              coupon.expiryDate
                            )}
                          </p>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-5 sm:px-6">

                          <StatusBadge
                            status={
                              status
                            }
                          />

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-5 text-right sm:px-6">

                          <div className="flex items-center justify-end gap-2">

                            {/* ACTIVE / INACTIVE */}

                            <button
                              type="button"
                              disabled={
                                status ===
                                  "expired" ||
                                isUpdating ||
                                isDeleting
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  coupon
                                )
                              }
                              className="
                                rounded-lg
                                border
                                border-nexora-border
                                bg-nexora-surface
                                px-3
                                py-2
                                text-xs
                                font-bold
                                text-nexora-text
                                transition
                                hover:border-nexora-primary
                                hover:text-nexora-primary
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                              "
                            >
                              {isUpdating
                                ? "Updating..."
                                : coupon.isActive
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenEditCoupon(
                                  coupon
                                )
                              }
                              disabled={
                                isDeleting ||
                                isUpdating
                              }
                              className="
                                rounded-lg
                                border
                                border-nexora-border
                                bg-nexora-surface
                                px-3
                                py-2
                                text-xs
                                font-bold
                                text-nexora-text
                                transition
                                hover:border-nexora-primary
                                hover:text-nexora-primary
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              Edit
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              disabled={
                                isDeleting ||
                                isUpdating
                              }
                              onClick={() =>
                                handleDelete(
                                  coupon
                                )
                              }
                              className="
                                rounded-lg
                                border
                                border-red-200
                                bg-red-50
                                px-3
                                py-2
                                text-xs
                                font-bold
                                text-red-700
                                transition
                                hover:bg-red-100
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              {isDeleting
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* =================================================
          ADD / EDIT DRAWER
      ================================================= */}

      <CouponFormDrawer
        isOpen={
          isCouponDrawerOpen
        }
        coupon={
          selectedCoupon
        }
        existingCoupons={
          coupons
        }
        isSaving={
          isSavingCoupon
        }
        onSave={
          handleSaveCoupon
        }
        onClose={
          handleCloseCouponDrawer
        }
      />

    </div>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({
  label,
  value,
  tone,
}) => {
  const toneStyles = {
    primary:
      "bg-nexora-primary-soft text-nexora-primary",

    success:
      "bg-emerald-50 text-emerald-700",

    neutral:
      "bg-nexora-taupe-soft text-nexora-text",

    danger:
      "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-2xl border border-nexora-border bg-nexora-surface p-5 shadow-sm">

      <div
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          text-sm
          font-black
          ${toneStyles[tone]}
        `}
      >
        %
      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexora-taupe">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black tracking-tight text-nexora-text">
        {value}
      </p>

    </div>
  );
};

/* =====================================================
   STATUS BADGE
===================================================== */

const StatusBadge = ({
  status,
}) => {
  const styles = {
    active:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    inactive:
      "border-nexora-border bg-nexora-taupe-soft text-nexora-muted",

    expired:
      "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-3
        py-1.5
        text-[10px]
        font-bold
        uppercase
        tracking-[0.12em]
        ${styles[status]}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${
            status === "active"
              ? "bg-emerald-500"
              : status ===
                  "expired"
                ? "bg-red-500"
                : "bg-nexora-taupe"
          }
        `}
      />

      {status}
    </span>
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

export default AdminCoupons;