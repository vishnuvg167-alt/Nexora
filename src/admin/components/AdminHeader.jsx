import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import {
  logout,
} from "../../redux/slices/authSlice";

const AdminHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ================= AUTH ================= */

  const { user } = useSelector(
    (state) => state.auth
  );

  /* ================= ADMIN INITIAL ================= */

  const adminInitial =
    user?.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "A";

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    dispatch(logout());

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-18
        items-center
        justify-between
        border-b
        border-nexora-border
        bg-nexora-ivory/95
        px-5
        backdrop-blur-xl
        sm:px-6
        lg:px-8
      "
    >
      {/* ================= SEARCH ================= */}

      <div className="hidden md:block">
        <div className="relative">

          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              left-4
              flex
              items-center
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="
                h-4
                w-4
                text-nexora-muted
              "
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="m20 20-3.5-3.5" />
            </svg>
          </div>

          <input
            type="text"
            placeholder="Search anything..."
            className="
              w-72
              rounded-xl
              border
              border-nexora-border
              bg-nexora-surface
              py-2.5
              pl-10
              pr-4
              text-sm
              text-nexora-text
              outline-none
              transition
              placeholder:text-nexora-muted
              focus:border-nexora-primary/40
              focus:ring-2
              focus:ring-nexora-primary/10
            "
          />

        </div>
      </div>

      {/* ================= MOBILE BRAND ================= */}

      <div className="md:hidden">
        <p
          className="
            text-sm
            font-black
            tracking-[0.18em]
            text-nexora-primary
          "
        >
          NEXORA
        </p>
      </div>

      {/* ================= ADMIN ================= */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        {/* AVATAR */}

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-nexora-primary
            text-sm
            font-bold
            text-white
          "
        >
          {adminInitial}
        </div>

        {/* ADMIN INFO */}

        <div
          className="
            hidden
            text-right
            sm:block
          "
        >
          <p
            className="
              text-sm
              font-semibold
              text-nexora-text
            "
          >
            {user?.name ||
              "NEXORA Admin"}
          </p>

          <p
            className="
              mt-0.5
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-nexora-taupe
            "
          >
            Administrator
          </p>
        </div>

        {/* DIVIDER */}

        <div
          className="
            hidden
            h-8
            w-px
            bg-nexora-border
            sm:block
          "
        />

        {/* LOGOUT */}

        <button
          type="button"
          onClick={handleLogout}
          className="
            rounded-xl
            border
            border-nexora-border
            bg-nexora-surface
            px-4
            py-2.5
            text-xs
            font-semibold
            text-nexora-muted
            transition
            hover:border-nexora-primary/20
            hover:bg-nexora-primary-soft
            hover:text-nexora-primary
          "
        >
          Logout
        </button>

      </div>
    </header>
  );
};

export default AdminHeader;