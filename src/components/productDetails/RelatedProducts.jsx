import { Link } from "react-router-dom";
import productImages from "../../constants/productImages";

const RelatedProducts = ({
  relatedProducts,
  category,
}) => {
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-nexora-surface">

      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">

        {/* ================= HEADER ================= */}

        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-nexora-border pb-10">

          <div>

            <div className="flex items-center gap-4">

              <span className="h-px w-10 bg-nexora-taupe" />

              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-nexora-taupe">
                Explore more
              </p>

            </div>

            <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-nexora-text sm:text-5xl lg:text-6xl">
              You may also like.
            </h2>

          </div>

          <Link
            to={`/products?category=${encodeURIComponent(
              category
            )}`}
            className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-nexora-muted transition hover:text-nexora-primary"
          >
            View all {category}

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>

        </div>

        {/* ================= PRODUCTS ================= */}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {relatedProducts.map(
            (item) => {
              const image =
                productImages[
                  String(item.id)
                ] ||
                item.images?.[0] ||
                item.thumbnail;

              return (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="group"
                >

                  {/* ================= IMAGE ================= */}

                  <div className="relative overflow-hidden border border-nexora-border bg-[#F3EFE7] transition duration-300 group-hover:border-nexora-taupe">

                    <div className="flex aspect-square items-center justify-center p-6">

                      {image ? (
                        <img
                          src={image}
                          alt={item.name}
                          className="
                            h-full
                            w-full
                            object-contain
                            transition-transform
                            duration-500
                            ease-out
                            group-hover:scale-105
                          "
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-nexora-muted">
                          No image
                        </div>
                      )}

                    </div>

                    {/* CATEGORY */}

                    <div className="absolute left-4 top-4">

                      <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-nexora-taupe">
                        {item.category}
                      </span>

                    </div>

                    {/* ARROW */}

                    <div className="absolute bottom-4 right-4 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-nexora-primary text-sm text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      →
                    </div>

                  </div>

                  {/* ================= PRODUCT INFO ================= */}

                  <div className="pt-5">

                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-nexora-taupe">
                      {item.brand}
                    </p>

                    <h3 className="mt-2 text-base font-bold tracking-[-0.025em] text-nexora-text transition duration-300 group-hover:text-nexora-primary">
                      {item.name}
                    </h3>

                    <div className="mt-3 flex items-center justify-between gap-4">

                      <p className="text-sm font-semibold text-nexora-primary">
                        ₹
                        {item.price.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <span className="text-sm text-nexora-taupe transition-transform duration-300 group-hover:translate-x-1 group-hover:text-nexora-primary">
                        →
                      </span>

                    </div>

                  </div>

                </Link>
              );
            }
          )}

        </div>

      </div>
    </section>
  );
};

export default RelatedProducts;