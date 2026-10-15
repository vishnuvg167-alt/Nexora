import {
  NavLink,
} from "react-router-dom";

/* =====================================================
   COMPONENT
===================================================== */

const AdminSidebar = () => {
  const navItems = [
    /* ================= DASHBOARD ================= */

    {
      name: "Dashboard",

      path: "/admin",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="1"
          />

          <rect
            x="14"
            y="3"
            width="7"
            height="7"
            rx="1"
          />

          <rect
            x="3"
            y="14"
            width="7"
            height="7"
            rx="1"
          />

          <rect
            x="14"
            y="14"
            width="7"
            height="7"
            rx="1"
          />
        </svg>
      ),
    },

    /* ================= PRODUCTS ================= */

    {
      name: "Products",

      path: "/admin/products",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />

          <path d="m4 7.5 8 4.5 8-4.5" />

          <path d="M12 12v9" />
        </svg>
      ),
    },

    /* ================= INVENTORY ================= */

    {
      name: "Inventory",

      path: "/admin/inventory",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6.5h16v13H4z"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 3.5h10l2 3H5l2-3Z"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 11h6"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 11v5"
          />
        </svg>
      ),
    },

    /* ================= USERS ================= */

    {
      name: "Users",

      path: "/admin/users",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

          <circle
            cx="9"
            cy="7"
            r="4"
          />

          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },

    /* ================= ORDERS ================= */

    {
      name: "Orders",

      path: "/admin/orders",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />

          <path d="M9 8h6" />

          <path d="M9 12h6" />
        </svg>
      ),
    },

    /* ================= RETURNS ================= */

    {
      name: "Returns",

      path: "/admin/returns",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 7H5v4"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.5 10.5A7 7 0 1 0 7 6.5"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 11 9 7"
          />
        </svg>
      ),
    },

    /* ================= REPLACEMENTS ================= */

    {
      name: "Replacements",

      path: "/admin/replacements",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 7h11l-3-3"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m18 7-3 3"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 17H6l3 3"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m6 17 3-3"
          />
        </svg>
      ),
    },

    /* ================= REVIEWS ================= */

    {
      name: "Reviews",

      path: "/admin/reviews",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m12 7.5 1.15 2.33 2.57.37-1.86 1.81.44 2.56L12 13.36l-2.3 1.21.44-2.56-1.86-1.81 2.57-.37L12 7.5Z"
          />
        </svg>
      ),
    },

    /* ================= COUPONS ================= */

    {
      name: "Coupons",

      path: "/admin/coupons",

      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="
              M3 7.5
              A2.5 2.5 0 0 1 5.5 5
              H18.5
              A2.5 2.5 0 0 1 21 7.5
              V9
              A3 3 0 0 0 21 15
              V16.5
              A2.5 2.5 0 0 1 18.5 19
              H5.5
              A2.5 2.5 0 0 1 3 16.5
              V15
              A3 3 0 0 0 3 9
              V7.5
              Z
            "
          />

          <path
            strokeLinecap="round"
            d="M9 9h.01"
          />

          <path
            strokeLinecap="round"
            d="M15 15h.01"
          />

          <path
            strokeLinecap="round"
            d="m9 15 6-6"
          />
        </svg>
      ),
    },
  ];

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-nexora-primary md:flex">
      {/* ================= BRAND ================= */}

      <div className="flex h-24 items-center border-b border-white/10 px-6">
        <div>
          <h1 className="text-xl font-black tracking-[0.22em] text-white">
            NEXORA
          </h1>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-nexora-copper" />

            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/45">
              Admin Console
            </p>
          </div>
        </div>
      </div>

      {/* ================= NAVIGATION ================= */}

      <div className="flex-1 px-4 py-7">
        <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.24em] text-white/30">
          Management
        </p>

        <nav className="space-y-1.5">
          {navItems.map(
            (item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path ===
                  "/admin"
                }
                className={({
                  isActive,
                }) => `
                  group
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3.5
                  py-3
                  text-sm
                  font-semibold
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? `
                        bg-white
                        text-nexora-primary
                        shadow-[0_8px_24px_rgba(0,0,0,0.12)]
                      `
                      : `
                        text-white/55
                        hover:bg-white/[0.07]
                        hover:text-white
                      `
                  }
                `}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {item.icon}
                </span>

                <span>
                  {item.name}
                </span>
              </NavLink>
            )
          )}
        </nav>
      </div>

      {/* ================= SIDEBAR FOOTER ================= */}

      <div className="border-t border-white/10 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />

          <div>
            <p className="text-[10px] font-semibold text-white/70">
              System operational
            </p>

            <p className="mt-0.5 text-[9px] text-white/30">
              NEXORA Commerce
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;