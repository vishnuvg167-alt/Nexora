import {
  hasProductVariants,
} from "../../utils/productVariants";

const ProductVariantSelector = ({
  product,
  selectedVariant,
  onVariantChange,
}) => {
  if (!hasProductVariants(product)) {
    return null;
  }

  const variants =
    product.variants || [];

  /* =========================================
     ATTRIBUTE NAMES

     Example:
     ["RAM", "Storage"]
  ========================================= */

  const attributeNames = [
    ...new Set(
      variants.flatMap(
        (variant) =>
          Object.keys(
            variant.attributes || {}
          )
      )
    ),
  ];

  /* =========================================
     CURRENT SELECTION
  ========================================= */

  const selectedAttributes =
    selectedVariant?.attributes || {};

  /* =========================================
     ATTRIBUTE VALUES
  ========================================= */

  const getAttributeValues = (
    attributeName
  ) => {
    return [
      ...new Set(
        variants
          .map(
            (variant) =>
              variant.attributes?.[
                attributeName
              ]
          )
          .filter(Boolean)
      ),
    ];
  };

  /* =========================================
     CHECK WHETHER VALUE CAN BE SELECTED
  ========================================= */

  const isOptionAvailable = (
    attributeName,
    value
  ) => {
    return variants.some(
      (variant) => {
        if (
          variant.attributes?.[
            attributeName
          ] !== value
        ) {
          return false;
        }

        /*
          Check the other currently selected
          attributes.

          Example:

          Current RAM = 32GB

          When checking Storage = 512GB,
          we look for a variant containing:

          RAM = 32GB
          Storage = 512GB
        */

        return attributeNames.every(
          (otherAttribute) => {
            if (
              otherAttribute ===
              attributeName
            ) {
              return true;
            }

            const selectedValue =
              selectedAttributes[
                otherAttribute
              ];

            if (!selectedValue) {
              return true;
            }

            return (
              variant.attributes?.[
                otherAttribute
              ] === selectedValue
            );
          }
        );
      }
    );
  };

  /* =========================================
     SELECT ATTRIBUTE
  ========================================= */

  const handleAttributeSelect = (
    attributeName,
    value
  ) => {
    /*
      First try to preserve all of the
      currently selected attributes.
    */

    const desiredAttributes = {
      ...selectedAttributes,
      [attributeName]: value,
    };

    let matchingVariant =
      variants.find(
        (variant) =>
          Object.entries(
            desiredAttributes
          ).every(
            ([
              key,
              selectedValue,
            ]) =>
              variant.attributes?.[
                key
              ] === selectedValue
          )
      );

    /*
      If that exact combination doesn't
      exist, select the first valid variant
      containing the newly chosen value.

      Example:

      Selected:
      16GB + 512GB

      User selects:
      32GB

      32GB + 512GB doesn't exist.

      So we automatically choose:
      32GB + 1TB
    */

    if (!matchingVariant) {
      matchingVariant =
        variants.find(
          (variant) =>
            variant.attributes?.[
              attributeName
            ] === value
        );
    }

    if (matchingVariant) {
      onVariantChange(
        matchingVariant
      );
    }
  };

  return (
    <div className="space-y-6">

      {attributeNames.map(
        (attributeName) => {
          const values =
            getAttributeValues(
              attributeName
            );

          return (
            <div
              key={
                attributeName
              }
            >
              <div className="mb-3 flex items-center justify-between gap-4">

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-nexora-muted">
                  {attributeName}
                </p>

                <p className="text-xs font-semibold text-nexora-primary">
                  {
                    selectedAttributes[
                      attributeName
                    ]
                  }
                </p>

              </div>

              <div className="flex flex-wrap gap-2">

                {values.map(
                  (value) => {
                    const isSelected =
                      selectedAttributes[
                        attributeName
                      ] === value;

                    const available =
                      isOptionAvailable(
                        attributeName,
                        value
                      );

                    return (
                      <button
                        key={
                          value
                        }
                        type="button"
                        disabled={
                          !available
                        }
                        onClick={() =>
                          handleAttributeSelect(
                            attributeName,
                            value
                          )
                        }
                        className={`
                          rounded-xl
                          border
                          px-4
                          py-3
                          text-sm
                          font-semibold
                          transition

                          ${
                            isSelected
                              ? `
                                border-nexora-primary
                                bg-nexora-primary
                                text-white
                              `
                              : available
                                ? `
                                  border-nexora-border
                                  bg-nexora-surface
                                  text-nexora-text
                                  hover:border-nexora-primary
                                `
                                : `
                                  cursor-not-allowed
                                  border-nexora-border
                                  bg-nexora-taupe-soft/40
                                  text-nexora-muted
                                  opacity-40
                                `
                          }
                        `}
                      >
                        {value}
                      </button>
                    );
                  }
                )}

              </div>

            </div>
          );
        }
      )}

      {/* ================= SELECTED VARIANT ================= */}

      {selectedVariant && (
        <div className="rounded-2xl border border-nexora-border bg-nexora-primary-soft/40 p-4">

          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexora-muted">
            Selected configuration
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">

            <p className="text-sm font-bold text-nexora-text">
              {
                selectedVariant.label
              }
            </p>

            <p className="text-xs font-semibold text-nexora-primary">
              {
                selectedVariant.stock
              }{" "}
              available
            </p>

          </div>

        </div>
      )}

    </div>
  );
};

export default ProductVariantSelector;