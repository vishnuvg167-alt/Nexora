import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-nexora-primary px-6 py-16 text-white sm:py-20">

      <div className="mx-auto max-w-7xl">

        {/* ================= TOP ================= */}

        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* BRAND */}

          <div className="max-w-md">

            <Link
              to="/"
              className="text-3xl font-black tracking-[-0.05em] text-white"
            >
              NEXORA
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              Premium computer and gaming hardware for
              gaming, development, creativity, and
              everything in between.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:border-nexora-ivory hover:bg-nexora-ivory hover:text-nexora-primary"
            >
              Explore Hardware
              <span>→</span>
            </Link>

          </div>

          {/* SHOP */}

          <div>

            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-nexora-taupe-soft">
              Shop
            </h3>

            <div className="mt-6 flex flex-col gap-4 text-sm text-white/60">

              <Link
                to="/products"
                className="transition hover:translate-x-1 hover:text-white"
              >
                All Products
              </Link>

              <Link
                to="/products?category=Laptops"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Laptops
              </Link>

              <Link
                to="/products?category=Graphics%20Cards"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Graphics Cards
              </Link>

              <Link
                to="/products?category=Processors"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Processors
              </Link>

              <Link
                to="/products?category=Monitors"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Monitors
              </Link>

            </div>

          </div>

          {/* EXPLORE */}

          <div>

            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-nexora-taupe-soft">
              Explore
            </h3>

            <div className="mt-6 flex flex-col gap-4 text-sm text-white/60">

              <Link
                to="/"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Home
              </Link>

              <Link
                to="/products"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Products
              </Link>

              <Link
                to="/wishlist"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Wishlist
              </Link>

              <Link
                to="/cart"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Cart
              </Link>

            </div>

          </div>

          {/* ACCOUNT */}

          <div>

            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-nexora-taupe-soft">
              Account
            </h3>

            <div className="mt-6 flex flex-col gap-4 text-sm text-white/60">

              <Link
                to="/orders"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Orders
              </Link>

              <Link
                to="/login"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="transition hover:translate-x-1 hover:text-white"
              >
                Register
              </Link>

            </div>

          </div>

        </div>

        {/* ================= BRAND STATEMENT ================= */}

        <div className="mt-20 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] px-6 py-10 sm:px-10">

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-nexora-taupe">
                NEXORA
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                Built for those who expect more.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-white/50 md:text-right">
              Curated hardware designed to power your
              next setup, project, game, or creation.
            </p>

          </div>

        </div>

        {/* ================= BOTTOM ================= */}

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">

          <p className="text-xs text-white/45">
            © 2026 NEXORA. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-xs text-white/45">

            <span>
              Premium Hardware
            </span>

            <span className="h-1 w-1 rounded-full bg-nexora-taupe" />

            <span>
              Built for Performance
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;