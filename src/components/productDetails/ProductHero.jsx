import { Link } from "react-router-dom";

const ProductHero = ({
  product,
  productImage,
  galleryImages,
  selectedImage,
  setSelectedImage,
  reviewCount,
  averageRating,
}) => {
  return (
    <section className="relative bg-nexora-ivory">

      {/* ================= BREADCRUMB ================= */}

      <div className="flex items-center justify-between border-b border-nexora-border py-5">

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-nexora-taupe">

          <Link
            to="/products"
            className="transition duration-300 hover:text-nexora-primary"
          >
            Products
          </Link>

          <span className="text-nexora-border">
            /
          </span>

          <Link
            to={`/products?category=${encodeURIComponent(
              product.category
            )}`}
            className="transition duration-300 hover:text-nexora-primary"
          >
            {product.category}
          </Link>

        </div>

        <span className="hidden text-[10px] font-bold uppercase tracking-[0.25em] text-nexora-taupe sm:block">
          NEXORA /{" "}
          {String(product.id).padStart(
            2,
            "0"
          )}
        </span>

      </div>

      {/* ================= PRODUCT INTRO ================= */}

      <div className="relative py-14 text-center sm:py-20 lg:py-24">

        <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-nexora-taupe">
          {product.brand}
        </p>

        <h1
          className="
            mx-auto
            mt-6
            max-w-6xl
            text-[clamp(3.4rem,8vw,8.5rem)]
            font-black
            leading-[0.82]
            tracking-[-0.065em]
            text-nexora-text
          "
        >
          {product.name}
        </h1>

        {/* Price + Reviews */}

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">

          <span className="text-sm font-semibold text-nexora-primary">
            ₹
            {product.price.toLocaleString(
              "en-IN"
            )}
          </span>

          <span className="h-1 w-1 rounded-full bg-nexora-taupe" />

          <a
            href="#customer-reviews"
            className="text-sm text-nexora-muted transition duration-300 hover:text-nexora-primary"
          >
            {reviewCount > 0
              ? `★ ${averageRating.toFixed(
                  1
                )} · ${reviewCount} ${
                  reviewCount === 1
                    ? "review"
                    : "reviews"
                }`
              : "No customer reviews yet"}
          </a>

        </div>
      </div>

      {/* ================= PRODUCT GALLERY ================= */}

      <div className="relative overflow-hidden bg-[#EEE9DF]">

        {/* Background Branding */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-0
            -translate-x-1/2
            -translate-y-1/2
            select-none
            whitespace-nowrap
            text-[clamp(7rem,19vw,18rem)]
            font-black
            leading-none
            tracking-[-0.08em]
            text-nexora-primary/[0.035]
          "
        >
          NEXORA
        </div>

        {/* ================= TOP METADATA ================= */}

        <div className="absolute left-5 right-5 top-5 z-20 flex items-start justify-between sm:left-8 sm:right-8 sm:top-8">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-nexora-taupe">
              Category
            </p>

            <p className="mt-1 text-xs font-semibold text-nexora-text">
              {product.category}
            </p>

          </div>

          {/* Stock */}

          {product.stock > 0 ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-nexora-primary">

              <span className="h-1.5 w-1.5 rounded-full bg-nexora-primary" />

              In stock

            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-nexora-muted">

              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

              Out of stock

            </div>
          )}

        </div>

        {/* ================= MAIN IMAGE ================= */}

        <div
          className="
            relative
            z-10
            flex
            min-h-[540px]
            items-center
            justify-center
            px-2
            pb-28
            pt-24
            sm:min-h-[700px]
            sm:px-8
            lg:min-h-[800px]
            lg:px-12
          "
        >
          <img
            key={selectedImage}
            src={
              selectedImage ||
              productImage
            }
            alt={product.name}
            className="
              block
              max-h-[650px]
              w-full
              max-w-[1200px]
              object-contain
              object-center
              transition-transform
              duration-700
              ease-out
              hover:scale-[1.015]
            "
          />
        </div>

        {/* ================= GALLERY NAVIGATION ================= */}

        {galleryImages.length > 1 && (
          <div className="absolute bottom-16 left-1/2 z-30 -translate-x-1/2">

            <div className="flex items-center gap-3 rounded-full border border-nexora-border bg-nexora-surface/85 px-5 py-3 shadow-sm backdrop-blur-md">

              {galleryImages.map(
                (image, index) => {
                  const isActive =
                    selectedImage ===
                    image;

                  return (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          image
                        )
                      }
                      aria-label={`View product image ${
                        index + 1
                      }`}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isActive
                          ? "w-9 bg-nexora-primary"
                          : "w-1.5 bg-nexora-taupe/40 hover:bg-nexora-taupe"
                      }`}
                    />
                  );
                }
              )}

            </div>
          </div>
        )}

        {/* ================= GALLERY FOOTER ================= */}

        <div className="absolute bottom-5 left-6 right-6 z-20 flex items-center justify-between sm:left-8 sm:right-8">

          <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-nexora-taupe">
            {galleryImages.findIndex(
              (image) =>
                image === selectedImage
            ) + 1 || 1}
            {" / "}
            {galleryImages.length}
          </span>

          <a
            href="#product-story"
            className="group flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.28em] text-nexora-taupe transition hover:text-nexora-primary"
          >
            Discover

            <span className="transition-transform duration-300 group-hover:translate-y-1">
              ↓
            </span>
          </a>

        </div>

      </div>
    </section>
  );
};

export default ProductHero;