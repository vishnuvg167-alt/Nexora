const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  deleting = false,
}) => {
  return (
    <article
      className={`relative rounded-2xl border bg-nexora-surface p-5 transition ${
        address.isDefault
          ? "border-nexora-primary"
          : "border-nexora-border hover:border-nexora-taupe"
      }`}
    >
      {/* ================= HEADER ================= */}

      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-nexora-text">
            {address.label || "Address"}
          </h3>

          {address.isDefault && (
            <span className="rounded-full bg-nexora-primary-soft px-2.5 py-1 text-xs font-semibold text-nexora-primary">
              Default
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="text-sm font-semibold text-nexora-primary hover:text-nexora-primary-hover"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(address)}
            disabled={deleting}
            className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* ================= ADDRESS ================= */}

      <div className="space-y-1 text-sm leading-6 text-nexora-muted">
        <p className="font-semibold text-nexora-text">
          {address.name}
        </p>

        <p>{address.address}</p>

        <p>
          {address.city}
          {address.state && `, ${address.state}`}
          {address.pincode && ` - ${address.pincode}`}
        </p>

        <p>{address.phone}</p>
      </div>

      {/* ================= DEFAULT ACTION ================= */}

      {!address.isDefault && (
        <div className="mt-5 border-t border-nexora-border pt-4">
          <button
            type="button"
            onClick={() => onSetDefault(address)}
            className="text-sm font-semibold text-nexora-primary hover:text-nexora-primary-hover"
          >
            Set as default
          </button>
        </div>
      )}
    </article>
  );
};

export default AddressCard;