/* =====================================================
   CHECK IF PRODUCT HAS VARIANTS
===================================================== */

export const hasProductVariants = (product) => {
  return (
    Boolean(product?.hasVariants) &&
    Array.isArray(product?.variants) &&
    product.variants.length > 0
  );
};

/* =====================================================
   TOTAL PRODUCT STOCK
===================================================== */

export const getProductTotalStock = (product) => {
  if (!product) return 0;

  // Normal product
  if (!hasProductVariants(product)) {
    return Math.max(
      Number(product.stock) || 0,
      0
    );
  }

  // Variant product
  return product.variants.reduce(
    (total, variant) =>
      total +
      Math.max(
        Number(variant.stock) || 0,
        0
      ),
    0
  );
};

/* =====================================================
   STARTING PRICE
===================================================== */

export const getProductStartingPrice = (product) => {
  if (!product) return 0;

  // Normal product
  if (!hasProductVariants(product)) {
    return Math.max(
      Number(product.price) || 0,
      0
    );
  }

  const prices = product.variants
    .map((variant) =>
      Number(variant.price)
    )
    .filter(
      (price) =>
        Number.isFinite(price) &&
        price >= 0
    );

  if (prices.length === 0) {
    return Math.max(
      Number(product.price) || 0,
      0
    );
  }

  return Math.min(...prices);
};

/* =====================================================
   FIND VARIANT BY ID
===================================================== */

export const getVariantById = (
  product,
  variantId
) => {
  if (
    !hasProductVariants(product) ||
    variantId === null ||
    variantId === undefined
  ) {
    return null;
  }

  return (
    product.variants.find(
      (variant) =>
        String(variant.id) ===
        String(variantId)
    ) || null
  );
};

/* =====================================================
   VARIANT STOCK
===================================================== */

export const getVariantStock = (
  product,
  variantId
) => {
  const variant = getVariantById(
    product,
    variantId
  );

  if (!variant) return 0;

  return Math.max(
    Number(variant.stock) || 0,
    0
  );
};

/* =====================================================
   VARIANT PRICE
===================================================== */

export const getVariantPrice = (
  product,
  variantId
) => {
  const variant = getVariantById(
    product,
    variantId
  );

  if (!variant) return null;

  const price = Number(
    variant.price
  );

  return Number.isFinite(price)
    ? price
    : null;
};

/* =====================================================
   DEFAULT VARIANT
===================================================== */

export const getDefaultVariant = (product) => {
  if (!hasProductVariants(product)) {
    return null;
  }

  // First variant that has stock
  const availableVariant =
    product.variants.find(
      (variant) =>
        Number(variant.stock) > 0
    );

  return (
    availableVariant ||
    product.variants[0] ||
    null
  );
};

/* =====================================================
   PRODUCT STOCK STATUS
===================================================== */

export const isProductInStock = (product) => {
  return getProductTotalStock(product) > 0;
};

/* =====================================================
   VARIANT STOCK STATUS
===================================================== */

export const isVariantInStock = (
  product,
  variantId
) => {
  return (
    getVariantStock(
      product,
      variantId
    ) > 0
  );
};

/* =====================================================
   PURCHASABLE STOCK
===================================================== */

/*
  Normal product:
  product.stock

  Variant product:
  selected variant.stock
*/

export const getPurchasableStock = (
  product,
  variantId = null
) => {
  if (!product) return 0;

  if (!hasProductVariants(product)) {
    return Math.max(
      Number(product.stock) || 0,
      0
    );
  }

  return getVariantStock(
    product,
    variantId
  );
};

/* =====================================================
   PURCHASABLE PRICE
===================================================== */

export const getPurchasablePrice = (
  product,
  variantId = null
) => {
  if (!product) return 0;

  if (!hasProductVariants(product)) {
    return Math.max(
      Number(product.price) || 0,
      0
    );
  }

  const variantPrice =
    getVariantPrice(
      product,
      variantId
    );

  if (variantPrice !== null) {
    return variantPrice;
  }

  return getProductStartingPrice(
    product
  );
};

/* =====================================================
   CALCULATE TOTAL VARIANT STOCK
===================================================== */

export const calculateVariantTotalStock = (
  variants = []
) => {
  if (!Array.isArray(variants)) {
    return 0;
  }

  return variants.reduce(
    (total, variant) =>
      total +
      Math.max(
        Number(variant.stock) || 0,
        0
      ),
    0
  );
};