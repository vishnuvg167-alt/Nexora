import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

const GuestRoute = () => {
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
    return <Outlet />;
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

  return (
    <Navigate
      to="/"
      replace
    />
  );
};

export default GuestRoute;