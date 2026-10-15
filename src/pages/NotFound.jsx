import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-nexora-ivory px-6 py-20">

      {/* ================= BACKGROUND DECORATION ================= */}

      <div
        className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-nexora-primary-soft opacity-60 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-nexora-copper-soft opacity-40 blur-3xl"
        aria-hidden="true"
      />

      {/* ================= CONTENT ================= */}

      <div className="relative mx-auto max-w-2xl text-center">

        {/* BRAND */}

        <div className="flex items-center justify-center gap-3">

          <span className="h-px w-8 bg-nexora-taupe" />

          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-nexora-taupe">
            NEXORA / ERROR
          </p>

          <span className="h-px w-8 bg-nexora-taupe" />

        </div>

        {/* ================= 404 ================= */}

        <div className="relative mt-8">

          <p
            className="select-none text-[8rem] font-black leading-none tracking-[-0.08em] text-nexora-primary sm:text-[11rem]"
            aria-hidden="true"
          >
            404
          </p>

          <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-nexora-copper" />

        </div>

        {/* ================= MESSAGE ================= */}

        <h1 className="mt-8 text-3xl font-black tracking-[-0.04em] text-nexora-text sm:text-4xl">
          Page not found.
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-nexora-muted sm:text-base">
          The page you're looking for
          doesn't exist, may have been
          moved, or is no longer
          available.
        </p>

        {/* ================= ACTIONS ================= */}

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

          <Link
            to="/"
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-nexora-primary px-7 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-nexora-primary-hover"
          >
            Back to Home

            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-full border border-nexora-border bg-nexora-surface px-7 py-3.5 text-sm font-bold text-nexora-primary transition-all duration-200 hover:border-nexora-primary hover:bg-nexora-primary-soft"
          >
            Browse Products
          </Link>

        </div>

        {/* ================= FOOTER ================= */}

        <div className="mt-12 flex items-center justify-center gap-2">

          <span className="h-1.5 w-1.5 rounded-full bg-nexora-primary" />

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-nexora-taupe">
            Technology for what comes next
          </p>

        </div>

      </div>

    </main>
  );
};

export default NotFound;