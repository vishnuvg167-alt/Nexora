import { Outlet, useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import CompareBar from "../products/CompareBar";

const StoreLayout = () => {
  const location = useLocation();

  const showCompareBar = location.pathname !== "/compare";

  return (
    <div className="min-h-screen bg-nexora-ivory text-nexora-text">
      <Navbar />

      <main className="min-h-screen">
        <Outlet />
      </main>

      <Footer />

      {showCompareBar && <CompareBar />}
    </div>
  );
};

export default StoreLayout;