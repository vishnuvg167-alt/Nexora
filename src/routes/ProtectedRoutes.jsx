import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

const ProtectedRoute = () => {
  const location =
    useLocation();

  const {
    user,
    isAuthenticated,
  } = useSelector(
    (state) => state.auth
  );

  /* ================= NOT LOGGED IN ================= */

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

  /* ================= ADMIN ================= */

  if (
    user.role === "admin"
  ) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  /* ================= CUSTOMER ================= */

  return <Outlet />;
};

export default ProtectedRoute;