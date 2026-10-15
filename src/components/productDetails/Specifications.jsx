const Specifications = ({ product }) => {
  const specs =
    product.specifications || {};

  const specEntries =
    Object.entries(specs);

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-nexora-ivory">

      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">

        {/* ================= HEADER ================= */}

        <div className="grid gap-8 border-b border-nexora-border pb-12 lg:grid-cols-[1fr_auto] lg:items-end">

          <div>

            <div className="flex items-center gap-4">

              <span className="h-px w-10 bg-nexora-taupe" />

              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-nexora-taupe">
                Technical details
              </p>

            </div>

            <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-nexora-text sm:text-5xl lg:text-6xl">
              Specifications.
            </h2>

          </div>

          <p className="max-w-sm text-sm leading-7 text-nexora-muted">
            Everything you need to know about the{" "}
            <span className="font-semibold text-nexora-text">
              {product.name}
            </span>
            .
          </p>

        </div>

        {/* ================= SPECS ================= */}

        {specEntries.length > 0 ? (
          <div className="mt-4">

            {specEntries.map(
              ([key, value]) => (
                <div
                  key={key}
                  className="
                    group
                    grid
                    gap-3
                    border-b
                    border-nexora-border
                    py-6
                    transition-colors
                    duration-300
                    hover:border-nexora-taupe
                    sm:grid-cols-[0.45fr_1fr]
                    sm:items-center
                    sm:gap-10
                    sm:py-7
                  "
                >

                  {/* SPEC NAME */}

                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-nexora-taupe">
                    {key}
                  </p>

                  {/* SPEC VALUE */}

                  <p className="text-base font-semibold text-nexora-text sm:text-lg">
                    {String(value)}
                  </p>

                </div>
              )
            )}

          </div>
        ) : (
          <div className="py-16 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-nexora-primary-soft text-nexora-primary">
              —
            </div>

            <p className="mt-4 text-sm text-nexora-muted">
              Specifications are not
              available for this product.
            </p>

          </div>
        )}

        {/* ================= FOOTER ================= */}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">

          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-nexora-taupe">
            NEXORA Technical Specification
          </p>

          <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-nexora-taupe">
            {product.category}
          </p>

        </div>

      </div>
    </section>
  );
};

export default Specifications;