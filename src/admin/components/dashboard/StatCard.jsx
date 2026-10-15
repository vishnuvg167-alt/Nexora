const StatCard = ({
  title,
  value,
  subtitle,
  number,
}) => {
  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] border border-nexora-border bg-nexora-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-nexora-taupe hover:shadow-[0_18px_45px_rgba(18,63,50,0.08)]">

      {/* SUBTLE BACKGROUND ACCENT */}

      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexora-primary-soft/60 blur-3xl transition duration-300 group-hover:bg-nexora-copper-soft/40" />

      <div className="relative">

        {/* TOP */}

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nexora-taupe">
              {title}
            </p>

            <h3 className="mt-4 text-3xl font-black tracking-[-0.04em] text-nexora-text">
              {value}
            </h3>

          </div>

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nexora-primary-soft text-[10px] font-bold text-nexora-primary">
            {number}
          </span>

        </div>

        {/* FOOTER */}

        {subtitle && (
          <div className="mt-5 border-t border-nexora-border pt-4">

            <p className="text-xs text-nexora-muted">
              {subtitle}
            </p>

          </div>
        )}

      </div>

    </article>
  );
};

export default StatCard;