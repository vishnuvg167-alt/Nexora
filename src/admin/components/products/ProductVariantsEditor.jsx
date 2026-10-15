const ProductVariantsEditor = ({
  variants,
  onChange,
  error,
}) => {
  /* =====================================================
     UPDATE NORMAL FIELD
  ===================================================== */

  const updateVariant = (
    index,
    field,
    value
  ) => {
    onChange(
      variants.map(
        (variant, variantIndex) =>
          variantIndex === index
            ? {
                ...variant,
                [field]: value,
              }
            : variant
      )
    );
  };

  /* =====================================================
     UPDATE ATTRIBUTE
  ===================================================== */

  const updateAttribute = (
    index,
    attribute,
    value
  ) => {
    onChange(
      variants.map(
        (variant, variantIndex) =>
          variantIndex === index
            ? {
                ...variant,

                attributes: {
                  ...(variant.attributes ||
                    {}),

                  [attribute]:
                    value,
                },
              }
            : variant
      )
    );
  };

  /* =====================================================
     ADD VARIANT

     Temporary ID is only used inside the form.
     ProductFormDrawer will generate the final stable ID.
  ===================================================== */

  const addVariant = () => {
    onChange([
      ...variants,

      {
        id: `new-${Date.now()}`,
        label: "",
        attributes: {
          RAM: "",
          Storage: "",
        },
        price: "",
        stock: 0,
        isNew: true,
      },
    ]);
  };

  /* =====================================================
     REMOVE VARIANT
  ===================================================== */

  const removeVariant = (
    index
  ) => {
    const variant =
      variants[index];

    /*
      Never allow Product Edit to silently
      destroy existing inventory.
    */

    if (
      Number(variant.stock) > 0
    ) {
      return;
    }

    onChange(
      variants.filter(
        (_, variantIndex) =>
          variantIndex !== index
      )
    );
  };

  return (
    <div className="space-y-4">

      {variants.map(
        (variant, index) => {
          const hasStock =
            Number(
              variant.stock
            ) > 0;

          return (
            <div
              key={
                variant.id ||
                index
              }
              className="
                rounded-xl
                border
                border-nexora-border
                bg-nexora-ivory
                p-4
              "
            >

              {/* ================= HEADER ================= */}

              <div
                className="
                  mb-4
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div>

                  <p
                    className="
                      text-xs
                      font-bold
                      text-nexora-text
                    "
                  >
                    Variant{" "}
                    {index + 1}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      text-nexora-muted
                    "
                  >
                    {variant.isNew
                      ? "New variant · stock starts at 0"
                      : `ID: ${variant.id}`}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeVariant(
                      index
                    )
                  }
                  disabled={
                    hasStock
                  }
                  title={
                    hasStock
                      ? "Set stock to 0 from Inventory before deleting this variant."
                      : "Remove variant"
                  }
                  className="
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    px-3
                    py-1.5
                    text-[11px]
                    font-bold
                    text-red-600
                    transition
                    hover:bg-red-100
                    disabled:cursor-not-allowed
                    disabled:border-nexora-border
                    disabled:bg-nexora-taupe-soft/40
                    disabled:text-nexora-muted
                  "
                >
                  Remove
                </button>

              </div>

              {/* ================= LABEL + PRICE ================= */}

              <div
                className="
                  grid
                  gap-4
                  sm:grid-cols-2
                "
              >

                <VariantField label="Label">

                  <input
                    type="text"
                    value={
                      variant.label ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateVariant(
                        index,
                        "label",
                        event.target
                          .value
                      )
                    }
                    placeholder="32GB / 1TB"
                    className={
                      inputClass
                    }
                  />

                </VariantField>

                <VariantField label="Price">

                  <div className="relative">

                    <span
                      className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        left-4
                        flex
                        items-center
                        text-sm
                        text-nexora-muted
                      "
                    >
                      ₹
                    </span>

                    <input
                      type="number"
                      min="1"
                      value={
                        variant.price ??
                        ""
                      }
                      onChange={(
                        event
                      ) =>
                        updateVariant(
                          index,
                          "price",
                          event.target
                            .value
                        )
                      }
                      placeholder="104999"
                      className={`${inputClass} pl-8`}
                    />

                  </div>

                </VariantField>

              </div>

              {/* ================= ATTRIBUTES ================= */}

              <div
                className="
                  mt-4
                  grid
                  gap-4
                  sm:grid-cols-2
                "
              >

                <VariantField label="RAM">

                  <input
                    type="text"
                    value={
                      variant
                        .attributes
                        ?.RAM || ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateAttribute(
                        index,
                        "RAM",
                        event.target
                          .value
                      )
                    }
                    placeholder="32GB"
                    className={
                      inputClass
                    }
                  />

                </VariantField>

                <VariantField label="Storage">

                  <input
                    type="text"
                    value={
                      variant
                        .attributes
                        ?.Storage ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateAttribute(
                        index,
                        "Storage",
                        event.target
                          .value
                      )
                    }
                    placeholder="1TB"
                    className={
                      inputClass
                    }
                  />

                </VariantField>

              </div>

              {/* ================= INVENTORY ================= */}

              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-lg
                  border
                  border-nexora-border
                  bg-nexora-surface
                  px-4
                  py-3
                "
              >

                <div>

                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-nexora-muted
                    "
                  >
                    Current Stock
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-black
                      text-nexora-text
                    "
                  >
                    {Number(
                      variant.stock
                    ) || 0}{" "}
                    units
                  </p>

                </div>

                <span
                  className="
                    rounded-full
                    bg-nexora-primary-soft
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    text-nexora-primary
                  "
                >
                  Inventory managed
                </span>

              </div>

              {hasStock && (
                <p
                  className="
                    mt-2
                    text-[11px]
                    leading-5
                    text-nexora-muted
                  "
                >
                  Set this variant's
                  stock to 0 from
                  Inventory before
                  removing it.
                </p>
              )}

            </div>
          );
        }
      )}

      {/* ================= ERROR ================= */}

      {error && (
        <p
          className="
            text-xs
            font-medium
            text-red-600
          "
        >
          {error}
        </p>
      )}

      {/* ================= ADD ================= */}

      <button
        type="button"
        onClick={addVariant}
        className="
          text-xs
          font-bold
          text-nexora-primary
          transition
          hover:text-nexora-primary-hover
        "
      >
        + Add variant
      </button>

      <p
        className="
          text-[11px]
          leading-5
          text-nexora-muted
        "
      >
        Product Edit controls variant
        configuration and pricing.
        Stock is managed separately
        from Inventory. New variants
        begin with 0 units.
      </p>

    </div>
  );
};

/* =====================================================
   FIELD
===================================================== */

const VariantField = ({
  label,
  children,
}) => {
  return (
    <div>

      <label
        className="
          mb-2
          block
          text-xs
          font-semibold
          text-nexora-text
        "
      >
        {label}
      </label>

      {children}

    </div>
  );
};

/* =====================================================
   INPUT
===================================================== */

const inputClass = `
  w-full
  rounded-lg
  border
  border-nexora-border
  bg-nexora-surface
  px-4
  py-2.5
  text-sm
  text-nexora-text
  outline-none
  transition
  placeholder:text-nexora-muted/60
  focus:border-nexora-primary/40
  focus:ring-2
  focus:ring-nexora-primary/10
`;

export default ProductVariantsEditor;