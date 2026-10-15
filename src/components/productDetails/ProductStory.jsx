const ProductStory = ({ product }) => {
  return (
    <section
      id="product-story"
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-nexora-primary text-white"
    >
      {/* ================= BACKGROUND GLOW ================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-[500px]
          w-[900px]
          -translate-x-1/2
          rounded-full
          bg-white/[0.04]
          blur-[120px]
        "
      />

      {/* Subtle copper atmosphere */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-32
          top-1/3
          h-80
          w-80
          rounded-full
          bg-nexora-copper/[0.07]
          blur-[120px]
        "
      />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">

        {/* ================= INTRO ================= */}

        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">

          {/* LEFT */}

          <div>

            <div className="flex items-center gap-4">

              <span className="h-px w-10 bg-nexora-taupe" />

              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-nexora-taupe-soft">
                Engineered by NEXORA
              </p>

            </div>

            <h2
              className="
                mt-8
                max-w-xl
                text-5xl
                font-black
                leading-[0.88]
                tracking-[-0.055em]
                sm:text-6xl
                lg:text-7xl
                xl:text-8xl
              "
            >
              Built to

              <span className="block text-nexora-taupe-soft/60">
                perform.
              </span>

            </h2>

          </div>

          {/* RIGHT */}

          <div className="flex items-end">

            <div>

              <p className="max-w-2xl text-lg leading-8 text-white/65 sm:text-xl sm:leading-9">
                {product.description}
              </p>

              {/* PRODUCT METADATA */}

              <div className="mt-10 flex flex-wrap gap-x-10 gap-y-6">

                {/* Category */}

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                    Category
                  </p>

                  <p className="mt-2 text-sm font-semibold text-white">
                    {product.category}
                  </p>

                </div>

                {/* Series */}

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                    Series
                  </p>

                  <p className="mt-2 text-sm font-semibold text-white">
                    {product.brand}
                  </p>

                </div>

                {/* Availability */}

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
                    Availability
                  </p>

                  <div className="mt-2 flex items-center gap-2">

                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        product.stock > 0
                          ? "bg-nexora-taupe-soft"
                          : "bg-red-400"
                      }`}
                    />

                    <p className="text-sm font-semibold text-white">
                      {product.stock > 0
                        ? "Available now"
                        : "Out of stock"}
                    </p>

                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>

        {/* ================= STATEMENT ================= */}

        <div className="mt-24 border-t border-white/10 pt-16 sm:mt-32 sm:pt-20 lg:mt-40">

          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-nexora-taupe">
            Performance without compromise
          </p>

          <p
            className="
              mt-7
              max-w-6xl
              text-3xl
              font-semibold
              leading-[1.08]
              tracking-[-0.04em]
              text-white/90
              sm:text-5xl
              lg:text-6xl
            "
          >
            Every component.
            Every detail.
            Every decision.

            <span className="text-nexora-taupe-soft/50">
              {" "}
              Engineered for the experience that
              comes next.
            </span>

          </p>

        </div>

        {/* ================= TECH STRIP ================= */}

        <div className="mt-20 grid border-y border-white/10 sm:grid-cols-3 lg:mt-28">

          {/* DESIGN */}

          <div className="border-b border-white/10 py-8 sm:border-b-0 sm:border-r sm:pr-8">

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              01 / Design
            </p>

            <p className="mt-3 text-lg font-semibold text-white">
              Purpose built
            </p>

          </div>

          {/* PERFORMANCE */}

          <div className="border-b border-white/10 py-8 sm:border-b-0 sm:border-r sm:px-8">

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              02 / Performance
            </p>

            <p className="mt-3 text-lg font-semibold text-white">
              Maximum capability
            </p>

          </div>

          {/* EXPERIENCE */}

          <div className="py-8 sm:pl-8">

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              03 / Experience
            </p>

            <p className="mt-3 text-lg font-semibold text-white">
              Built around you
            </p>

          </div>

        </div>

      </div>
    </section>
  );
};

export default ProductStory;