import {
  useSelector,
} from "react-redux";

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

const AdminProtectedRoute = () => {
  const location =
    useLocation();

  /* ================= AUTH ================= */

  const {
    user,
    isAuthenticated,
  } = useSelector(
    (state) => state.auth
  );

  /* =====================================================
     NOT LOGGED IN
  ===================================================== */

  if (
    !isAuthenticated ||
    !user
  ) {
    return (
      <Navigate
        to="/login"
        state={{
          from:
            location.pathname,
        }}
        replace
      />
    );
  }

  /* =====================================================
     NOT AN ADMIN
  ===================================================== */

  if (
    user.role !== "admin"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* =====================================================
     ADMIN ALLOWED
  ===================================================== */

  return <Outlet />;
};

export default AdminProtectedRoute;