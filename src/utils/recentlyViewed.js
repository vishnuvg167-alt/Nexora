const STORAGE_KEY = "nexora_recently_viewed";
const MAX_RECENT_PRODUCTS = 5;

export const getRecentlyViewed = () => {
  try {
    const storedProducts = localStorage.getItem(STORAGE_KEY);

    return storedProducts
      ? JSON.parse(storedProducts)
      : [];
  } catch {
    return [];
  }
};

export const addRecentlyViewed = (productId) => {
  const currentProducts = getRecentlyViewed();

  const updatedProducts = [
    String(productId),
    ...currentProducts.filter(
      (id) => String(id) !== String(productId)
    ),
  ].slice(0, MAX_RECENT_PRODUCTS);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedProducts)
  );

  return updatedProducts;
};