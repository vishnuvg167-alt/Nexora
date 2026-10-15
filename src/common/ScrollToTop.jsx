import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (pathname === "/products") {
      const productGrid =
        document.getElementById("product-grid");

      if (productGrid) {
        productGrid.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        return;
      }
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;