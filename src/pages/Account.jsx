import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  logout,
} from "../redux/slices/authSlice";

import {
  clearCart,
} from "../redux/slices/cartSlice";

import {
  clearWishlist,
} from "../redux/slices/wishlistSlice";

import AddressSection from "../components/account/AddressSection";

const Account = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ================= USER ================= */

  const {
    user,
    isAuthenticated,
  } = useSelector(
    (state) => state.auth
  );

  /* ================= CART ================= */

  const cartItems = useSelector(
    (state) => state.cart.items
  );

  /* ================= WISHLIST ================= */

  const wishlistItems = useSelector(
    (state) => state.wishlist.items
  );

  /* ================= USER INFO ================= */

  const userName =
    user?.name || "NEXORA User";

  const userEmail =
    user?.email || "";

  const firstName =
    userName.split(" ")[0];

  const initial =
    userName
      .charAt(0)
      .toUpperCase();

  /* ================= COUNTS ================= */

  const cartCount =
    cartItems.reduce(
      (total, item) =>
        total +
        item.quantity,
      0
    );

  const wishlistCount =
    wishlistItems.length;

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    dispatch(logout());

    dispatch(
      clearCart()
    );

    dispatch(
      clearWishlist()
    );

    navigate("/");
  };

  /* ================= NOT LOGGED IN ================= */

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-nexora-ivory px-6 py-16">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[2rem] border border-nexora-border bg-nexora-surface px-6 py-16 text-center sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-nexora-primary-soft text-xl font-black text-nexora-primary">
              N
            </div>

            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              NEXORA / ACCOUNT
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-nexora-text">
              Sign in to your account.
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-nexora-muted">
              Access your orders,
              wishlist, cart and
              account information.
            </p>

            <Link
              to="/login"
              className="mt-8 inline-flex rounded-full bg-nexora-primary px-8 py-4 text-sm font-bold text-white transition hover:bg-nexora-primary-hover"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-nexora-ivory">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="bg-nexora-primary text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">

            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-nexora-taupe" />

                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-nexora-taupe-soft">
                  NEXORA / ACCOUNT
                </p>
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-6xl">
                Welcome back,

                <span className="block text-nexora-taupe-soft">
                  {firstName}.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/60">
                Manage your NEXORA
                shopping experience
                from one place.
              </p>
            </div>

            {/* PROFILE */}

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-nexora-ivory text-lg font-black text-nexora-primary">
                {initial}
              </div>

              <div>
                <p className="font-bold">
                  {userName}
                </p>

                <p className="mt-1 text-xs text-white/50">
                  {userEmail}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          ACCOUNT CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-6 py-10 lg:px-8 lg:py-14">

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside>
            <div className="rounded-[1.75rem] border border-nexora-border bg-nexora-surface p-4 lg:sticky lg:top-28">

              {/* PROFILE */}

              <div className="border-b border-nexora-border p-4">
                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-nexora-primary text-sm font-black text-white">
                    {initial}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-nexora-text">
                      {userName}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-nexora-muted">
                      {userEmail}
                    </p>
                  </div>

                </div>
              </div>

              {/* NAVIGATION */}

              <nav className="mt-3 space-y-1">

                <a
                  href="#overview"
                  className="flex items-center justify-between rounded-xl bg-nexora-primary-soft px-4 py-3 text-sm font-semibold text-nexora-primary"
                >
                  Overview

                  <span>
                    →
                  </span>
                </a>

                <Link
                  to="/orders"
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-nexora-muted transition hover:bg-nexora-ivory hover:text-nexora-primary"
                >
                  My Orders

                  <span>
                    →
                  </span>
                </Link>

                <a
                  href="#addresses"
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-nexora-muted transition hover:bg-nexora-ivory hover:text-nexora-primary"
                >
                  Saved Addresses

                  <span>
                    →
                  </span>
                </a>

                <Link
                  to="/wishlist"
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-nexora-muted transition hover:bg-nexora-ivory hover:text-nexora-primary"
                >
                  Wishlist

                  <span>
                    {wishlistCount}
                  </span>
                </Link>

                <Link
                  to="/cart"
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-nexora-muted transition hover:bg-nexora-ivory hover:text-nexora-primary"
                >
                  Cart

                  <span>
                    {cartCount}
                  </span>
                </Link>

              </nav>

              {/* LOGOUT */}

              <div className="mt-4 border-t border-nexora-border pt-4">
                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-nexora-muted transition hover:bg-red-50 hover:text-red-500"
                >
                  Sign Out
                </button>
              </div>

            </div>
          </aside>

          {/* =================================================
              MAIN DASHBOARD
          ================================================= */}

          <div id="overview">

            {/* HEADING */}

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                Overview
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-nexora-text sm:text-4xl">
                Your NEXORA.
              </h2>

              <p className="mt-3 text-sm text-nexora-muted">
                Quick access to your
                shopping activity.
              </p>
            </div>

            {/* =================================================
                QUICK CARDS
            ================================================= */}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {/* ORDERS */}

              <Link
                to="/orders"
                className="group rounded-[1.75rem] border border-nexora-border bg-nexora-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-nexora-taupe"
              >
                <div className="flex items-start justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-nexora-primary-soft text-nexora-primary">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2"
                      />
                    </svg>
                  </div>

                  <span className="text-nexora-taupe transition group-hover:translate-x-1 group-hover:text-nexora-primary">
                    →
                  </span>

                </div>

                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                  Purchases
                </p>

                <h3 className="mt-2 text-xl font-black text-nexora-text">
                  My Orders
                </h3>

                <p className="mt-2 text-sm leading-6 text-nexora-muted">
                  View your previous
                  and current orders.
                </p>
              </Link>

              {/* WISHLIST */}

              <Link
                to="/wishlist"
                className="group rounded-[1.75rem] border border-nexora-border bg-nexora-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-nexora-taupe"
              >
                <div className="flex items-start justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-nexora-primary-soft text-nexora-primary">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                      />
                    </svg>
                  </div>

                  <span className="text-nexora-taupe transition group-hover:translate-x-1 group-hover:text-nexora-primary">
                    →
                  </span>

                </div>

                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                  Saved
                </p>

                <div className="mt-2 flex items-end justify-between">
                  <h3 className="text-xl font-black text-nexora-text">
                    Wishlist
                  </h3>

                  <span className="text-3xl font-black text-nexora-primary">
                    {wishlistCount}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-nexora-muted">
                  Products you've
                  saved for later.
                </p>
              </Link>

              {/* CART */}

              <Link
                to="/cart"
                className="group rounded-[1.75rem] border border-nexora-border bg-nexora-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-nexora-taupe"
              >
                <div className="flex items-start justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-nexora-primary-soft text-nexora-primary">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 8H7"
                      />

                      <circle
                        cx="10"
                        cy="20"
                        r="1"
                      />

                      <circle
                        cx="18"
                        cy="20"
                        r="1"
                      />
                    </svg>
                  </div>

                  <span className="text-nexora-taupe transition group-hover:translate-x-1 group-hover:text-nexora-primary">
                    →
                  </span>

                </div>

                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                  Shopping bag
                </p>

                <div className="mt-2 flex items-end justify-between">
                  <h3 className="text-xl font-black text-nexora-text">
                    Cart
                  </h3>

                  <span className="text-3xl font-black text-nexora-primary">
                    {cartCount}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-nexora-muted">
                  Items currently
                  waiting for checkout.
                </p>
              </Link>

            </div>

            {/* =================================================
                PROFILE INFORMATION
            ================================================= */}

            <div className="mt-8 rounded-[1.75rem] border border-nexora-border bg-nexora-surface">

              <div className="border-b border-nexora-border p-6 sm:p-8">

                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-nexora-taupe">
                  Profile
                </p>

                <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-nexora-text">
                  Account information
                </h3>

              </div>

              <div className="grid sm:grid-cols-2">

                {/* NAME */}

                <div className="border-b border-nexora-border p-6 sm:border-r sm:p-8">

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                    Full name
                  </p>

                  <p className="mt-3 font-semibold text-nexora-text">
                    {userName}
                  </p>

                </div>

                {/* EMAIL */}

                <div className="border-b border-nexora-border p-6 sm:p-8">

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                    Email address
                  </p>

                  <p className="mt-3 break-all font-semibold text-nexora-text">
                    {userEmail}
                  </p>

                </div>

                {/* ACCOUNT TYPE */}

                <div className="p-6 sm:border-r sm:p-8">

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                    Account
                  </p>

                  <p className="mt-3 font-semibold text-nexora-text">
                    NEXORA Customer
                  </p>

                </div>

                {/* STATUS */}

                <div className="p-6 sm:p-8">

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
                    Status
                  </p>

                  <div className="mt-3 flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-nexora-primary" />

                    <p className="font-semibold text-nexora-primary">
                      Active
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                SAVED ADDRESSES
            ================================================= */}

            <div
              id="addresses"
              className="mt-8 scroll-mt-28"
            >
              <AddressSection />
            </div>

          </div>

        </div>

      </section>

    </main>
  );
};

export default Account;