import { Link } from "react-router-dom";
import productImages from "../../constants/productImages";

const OrderProductItem = ({ item }) => {
  const productImage =
    productImages[String(item.id)] || item.thumbnail || "";

  const price = Number(item.price) || 0;
  const quantity = Number(item.quantity) || 0;
  const total = price * quantity;

  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] border border-nexora-border/70 bg-nexora-surface transition-all duration-300 hover:border-nexora-taupe/60 hover:shadow-[0_14px_35px_rgba(18,63,50,0.06)]">
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        {/* ================= PRODUCT IMAGE ================= */}

        <Link
          to={`/products/${item.id}`}
          className="relative flex h-48 w-full shrink-0 items-center justify-center overflow-hidden bg-nexora-ivory sm:h-auto sm:min-h-36 sm:w-40"
        >
          {productImage ? (
            <img
              src={productImage}
              alt={item.name || "Product"}
              loading="lazy"
              className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-nexora-taupe">
              NEXORA
            </span>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-nexora-primary/[0.025] to-transparent" />
        </Link>

        {/* ================= PRODUCT DETAILS ================= */}

        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-5 sm:px-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-nexora-taupe">
            {item.brand || "NEXORA"}
          </p>

          <Link
            to={`/products/${item.id}`}
            className="mt-2 w-fit text-base font-black leading-snug tracking-[-0.02em] text-nexora-text transition-colors hover:text-nexora-primary sm:text-lg"
          >
            {item.name}
          </Link>

          {/* ================= VARIANT ================= */}

          {item.variantLabel && (
            <div className="mt-3">
              <span className="inline-flex rounded-full border border-nexora-primary/10 bg-nexora-primary-soft px-2.5 py-1 text-[10px] font-bold text-nexora-primary">
                {item.variantLabel}
              </span>
            </div>
          )}

          {/* ================= PRICE / QUANTITY ================= */}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-nexora-text">
              ₹{price.toLocaleString("en-IN")}
            </span>

            <span className="h-1 w-1 rounded-full bg-nexora-taupe/60" />

            <span className="text-xs font-medium text-nexora-muted">
              Qty {quantity}
            </span>
          </div>
        </div>

        {/* ================= TOTAL ================= */}

        <div className="flex items-center justify-between border-t border-nexora-border/70 bg-nexora-ivory/50 px-5 py-4 sm:w-48 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:bg-transparent sm:px-7 sm:text-right">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
              Item total
            </p>

            <p className="mt-1.5 text-xl font-black tracking-[-0.035em] text-nexora-primary">
              ₹{total.toLocaleString("en-IN")}
            </p>
          </div>

          <Link
            to={`/products/${item.id}`}
            className="mt-3 hidden items-center gap-1.5 text-[10px] font-bold text-nexora-muted transition-colors hover:text-nexora-primary sm:inline-flex"
          >
            View product

            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default OrderProductItem;