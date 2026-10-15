import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import NotificationBell from "../notifications/NotificationBell";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* ================= REDUX STATE ================= */

  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  /* ================= COUNTS ================= */

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const wishlistCount = wishlistItems.length;

  /* ================= USER ================= */

  const userName = user?.name || "Account";
  const firstName = userName.split(" ")[0];
  const userInitial = userName.charAt(0).toUpperCase();

  /* ================= CURRENT PAGE ================= */

  const isRegisterPage = location.pathname === "/register";
  const isAccountPage = location.pathname === "/account";

  /* ================= MENU ================= */

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-nexora-border bg-nexora-ivory/90 backdrop-blur-xl">
      <nav className="mx-auto max-w-7xl px-6">
        {/* ================= MAIN BAR ================= */}

        <div className="flex h-20 items-center justify-between">
          {/* ================= LOGO ================= */}

          <Link
            to="/"
            onClick={closeMenu}
            className="text-2xl font-black tracking-[-0.05em] text-nexora-primary"
          >
            NEXORA
          </Link>

          {/* ================= DESKTOP NAVIGATION ================= */}

          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="text-sm font-medium text-nexora-muted transition hover:text-nexora-primary"
            >
              Home
            </Link>

            <Link
              to="/products"
              className="text-sm font-medium text-nexora-muted transition hover:text-nexora-primary"
            >
              Products
            </Link>

            <Link
              to="/products?category=Laptops"
              className="text-sm font-medium text-nexora-muted transition hover:text-nexora-primary"
            >
              Laptops
            </Link>

            <Link
              to="/products?category=Graphics%20Cards"
              className="text-sm font-medium text-nexora-muted transition hover:text-nexora-primary"
            >
              Gaming
            </Link>
          </div>

          {/* ================= RIGHT ACTIONS ================= */}

          <div className="flex items-center gap-2 sm:gap-3">
            {/* ================= NOTIFICATIONS ================= */}

            <NotificationBell />

            {/* ================= WISHLIST ================= */}

            <Link
              to="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-nexora-text transition hover:bg-nexora-primary-soft hover:text-nexora-primary"
              aria-label="Wishlist"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                />
              </svg>

              {wishlistCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 -translate-y-1 translate-x-1 items-center justify-center rounded-full bg-nexora-primary px-1 text-[10px] font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* ================= CART ================= */}

            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-nexora-text transition hover:bg-nexora-primary-soft hover:text-nexora-primary"
              aria-label="Cart"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 8H7"
                />

                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>

              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-5 -translate-y-1 translate-x-1 items-center justify-center rounded-full bg-nexora-primary px-1 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ================= AUTHENTICATED ACCOUNT ================= */}

            {isAuthenticated ? (
              <div className="ml-2 hidden border-l border-nexora-border pl-5 sm:block">
                <Link
                  to="/account"
                  className={`group flex items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-4 transition ${
                    isAccountPage
                      ? "border-nexora-primary bg-nexora-primary-soft"
                      : "border-nexora-border bg-nexora-surface hover:border-nexora-taupe"
                  }`}
                >
                  {/* AVATAR */}

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nexora-primary text-xs font-black text-white">
                    {userInitial}
                  </span>

                  {/* NAME */}

                  <span className="hidden max-w-[110px] truncate text-sm font-semibold text-nexora-text lg:block">
                    {firstName}
                  </span>

                  {/* ARROW */}

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="hidden h-3.5 w-3.5 text-nexora-taupe transition-transform duration-200 group-hover:translate-x-0.5 lg:block"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m9 18 6-6-6-6"
                    />
                  </svg>
                </Link>
              </div>
            ) : (
              /* ================= LOGIN / REGISTER ================= */

              <div className="ml-2 hidden items-center border-l border-nexora-border pl-5 sm:flex">
                <div className="relative flex rounded-full bg-nexora-primary-soft p-1">
                  {/* SLIDING BACKGROUND */}

                  <div
                    className={`absolute inset-y-1 left-1 w-1/2 rounded-full bg-nexora-primary shadow-sm transition-transform duration-300 ease-out ${
                      isRegisterPage
                        ? "translate-x-full"
                        : "translate-x-0"
                    }`}
                  />

                  {/* LOGIN */}

                  <Link
                    to="/login"
                    className={`relative z-10 min-w-[72px] rounded-full px-4 py-2 text-center text-sm font-medium transition-colors duration-300 ${
                      !isRegisterPage
                        ? "text-white"
                        : "text-nexora-muted hover:text-nexora-primary"
                    }`}
                  >
                    Login
                  </Link>

                  {/* REGISTER */}

                  <Link
                    to="/register"
                    className={`relative z-10 min-w-[72px] rounded-full px-4 py-2 text-center text-sm font-medium transition-colors duration-300 ${
                      isRegisterPage
                        ? "text-white"
                        : "text-nexora-muted hover:text-nexora-primary"
                    }`}
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            {/* ================= MOBILE MENU BUTTON ================= */}

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-nexora-text transition hover:bg-nexora-primary-soft hover:text-nexora-primary md:hidden"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <span className="text-xl">
                {isMenuOpen ? "×" : "☰"}
              </span>
            </button>
          </div>
        </div>

        {/* ================= MOBILE MENU ================= */}

        {isMenuOpen && (
          <div className="border-t border-nexora-border py-5 md:hidden">
            {/* ================= NAVIGATION ================= */}

            <div className="flex flex-col">
              <Link
                to="/"
                onClick={closeMenu}
                className="border-b border-nexora-border py-4 text-sm font-semibold text-nexora-muted transition hover:text-nexora-primary"
              >
                Home
              </Link>

              <Link
                to="/products"
                onClick={closeMenu}
                className="border-b border-nexora-border py-4 text-sm font-semibold text-nexora-muted transition hover:text-nexora-primary"
              >
                Products
              </Link>

              <Link
                to="/products?category=Laptops"
                onClick={closeMenu}
                className="border-b border-nexora-border py-4 text-sm font-semibold text-nexora-muted transition hover:text-nexora-primary"
              >
                Laptops
              </Link>

              <Link
                to="/products?category=Graphics%20Cards"
                onClick={closeMenu}
                className="border-b border-nexora-border py-4 text-sm font-semibold text-nexora-muted transition hover:text-nexora-primary"
              >
                Gaming
              </Link>
            </div>

            {/* ================= MOBILE ACCOUNT ================= */}

            <div className="mt-5 rounded-2xl border border-nexora-border bg-nexora-surface p-4">
              {isAuthenticated ? (
                <div>
                  {/* USER */}

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-nexora-primary text-sm font-black text-white">
                      {userInitial}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-nexora-text">
                        {userName}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-nexora-muted">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* ACCOUNT BUTTON */}

                  <Link
                    to="/account"
                    onClick={closeMenu}
                    className="mt-4 flex w-full items-center justify-between rounded-xl bg-nexora-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-nexora-primary-hover"
                  >
                    My Account
                    <span>→</span>
                  </Link>

                  {/* ORDERS */}

                  <Link
                    to="/orders"
                    onClick={closeMenu}
                    className="mt-2 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-nexora-muted transition hover:bg-nexora-ivory hover:text-nexora-primary"
                  >
                    My Orders
                    <span>→</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-nexora-taupe">
                    Account
                  </p>

                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block text-sm font-semibold text-nexora-primary"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="block rounded-full bg-nexora-primary px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-nexora-primary-hover"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            {/* ================= QUICK ACTIONS ================= */}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                to="/wishlist"
                onClick={closeMenu}
                className="rounded-2xl border border-nexora-border bg-nexora-surface px-4 py-4 text-sm font-semibold text-nexora-text transition hover:border-nexora-primary"
              >
                Wishlist

                {wishlistCount > 0 && (
                  <span className="ml-2 text-nexora-taupe">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                onClick={closeMenu}
                className="rounded-2xl border border-nexora-border bg-nexora-surface px-4 py-4 text-sm font-semibold text-nexora-text transition hover:border-nexora-primary"
              >
                Cart

                {cartCount > 0 && (
                  <span className="ml-2 text-nexora-taupe">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;