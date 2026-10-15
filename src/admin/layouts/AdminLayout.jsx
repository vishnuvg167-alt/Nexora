import {
  Outlet,
} from "react-router-dom";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";


const AdminLayout = () => {
  return (
    <div
      className="
        min-h-screen
        bg-nexora-ivory
        text-nexora-text
      "
    >
      {/* ================= SIDEBAR ================= */}

      <AdminSidebar />

      {/* ================= WORKSPACE ================= */}

      <div
        className="
          min-h-screen
          md:ml-64
        "
      >
        {/* ================= HEADER ================= */}

        <AdminHeader />

        {/* ================= PAGE CONTENT ================= */}

        <main
          className="
            min-h-[calc(100vh-4.5rem)]
            bg-nexora-ivory
            px-4
            py-6
            sm:px-6
            lg:px-8
            lg:py-8
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1600px]
            "
          >
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;