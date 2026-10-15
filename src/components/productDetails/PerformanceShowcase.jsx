const PerformanceShowcase = ({
  product,
  story,
  galleryImages,
  productImage,
}) => {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-nexora-primary-hover text-white">

      {/* ================= BACKGROUND ATMOSPHERE ================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-nexora-copper/[0.05] blur-[130px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-white/[0.025] blur-[130px]"
      />

      <div className="relative mx-auto max-w-[1600px] px-6 pb-24 sm:pb-32 lg:px-10 lg:pb-40">

        {/* ================= HEADER ================= */}

        <div className="border-t border-white/10 pt-20 sm:pt-24">

          <div className="flex items-center gap-4">

            <span className="h-px w-10 bg-nexora-taupe" />

            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-nexora-taupe-soft">
              {story.eyebrow}
            </p>

          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">

            <h2
              className="
                max-w-4xl
                text-5xl
                font-black
                leading-[0.88]
                tracking-[-0.055em]
                sm:text-6xl
                lg:text-8xl
              "
            >
              {story.headline}

              <span className="block text-nexora-taupe-soft/50">
                {story.secondary}
              </span>

            </h2>

            <p className="max-w-xl text-base leading-7 text-white/55 lg:justify-self-end lg:text-lg lg:leading-8">
              Every detail of the {product.name} is
              engineered to deliver the performance,
              capability and experience expected from
              NEXORA hardware.
            </p>

          </div>

        </div>

        {/* ================= PRODUCT VISUAL ================= */}

        <div className="relative mt-16 overflow-hidden border border-white/10 bg-nexora-primary sm:mt-20">

          {/* BACKGROUND BRAND */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              whitespace-nowrap
              text-[clamp(7rem,20vw,22rem)]
              font-black
              tracking-[-0.08em]
              text-white/[0.025]
            "
          >
            NEXORA
          </div>

          {/* Warm glow behind product */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-[420px]
              w-[700px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-nexora-taupe/[0.06]
              blur-[100px]
            "
          />

          {/* ================= METADATA ================= */}

          <div className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between sm:left-8 sm:right-8 sm:top-8">

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe-soft/70">
              {product.category}
            </p>

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe-soft/70">
              Performance / 01
            </p>

          </div>

          {/* ================= PRODUCT IMAGE ================= */}

          <div className="relative z-10 flex min-h-[480px] items-center justify-center px-4 py-24 sm:min-h-[650px] sm:px-10 lg:min-h-[760px]">

            <img
              src={
                galleryImages[1] ||
                galleryImages[0] ||
                productImage
              }
              alt={`${product.name} performance view`}
              className="
                max-h-[650px]
                w-full
                max-w-[1200px]
                object-contain
                transition-transform
                duration-700
                ease-out
                hover:scale-[1.025]
              "
            />

          </div>

          {/* ================= BOTTOM CAPTION ================= */}

          <div className="absolute bottom-5 left-5 z-20 sm:bottom-8 sm:left-8">

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe-soft/60">
              NEXORA Engineering
            </p>

          </div>

        </div>

        {/* ================= FEATURE STATEMENTS ================= */}

        <div className="grid border-b border-white/10 sm:grid-cols-2">

          {/* FEATURE 1 */}

          <div className="border-b border-white/10 py-10 sm:border-b-0 sm:border-r sm:py-14 sm:pr-10 lg:py-16">

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              01 / Performance
            </p>

            <h3 className="mt-5 text-2xl font-bold tracking-[-0.035em] text-white sm:text-3xl lg:text-4xl">
              {story.featureOne}
            </h3>

            <p className="mt-5 max-w-lg text-sm leading-7 text-white/50">
              {story.featureOneText}
            </p>

          </div>

          {/* FEATURE 2 */}

          <div className="py-10 sm:py-14 sm:pl-10 lg:py-16">

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              02 / Experience
            </p>

            <h3 className="mt-5 text-2xl font-bold tracking-[-0.035em] text-white sm:text-3xl lg:text-4xl">
              {story.featureTwo}
            </h3>

            <p className="mt-5 max-w-lg text-sm leading-7 text-white/50">
              {story.featureTwoText}
            </p>

          </div>

        </div>

      </div>
    </section>
  );
};

export default PerformanceShowcase;