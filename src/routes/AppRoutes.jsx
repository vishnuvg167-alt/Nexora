import {
  Routes,
  Route,
} from "react-router-dom";

/* ================= LAYOUT ================= */

import StoreLayout from "../components/layout/StoreLayout";
import AdminLayout from "../admin/layouts/AdminLayout";

/* ================= STORE PAGES ================= */

import Home from "../pages/Home";
import ProductList from "../components/products/ProductList";
import ProductDetails from "../pages/ProductDetails";
import Compare from "../pages/Compare";
import Cart from "../pages/Cart";
import Wishlist from "../pages/Wishlist";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Account from "../pages/Account";
import NotFound from "../pages/NotFound";

/* ================= STORE GUARDS ================= */

import ProtectedRoute from "./ProtectedRoutes";
import GuestRoute from "./GuestRoute";

/* ================= ADMIN ================= */

import AdminDashboard from "../admin/pages/AdminDashboard";
import AdminProducts from "../admin/pages/AdminProducts";
import AdminInventory from "../admin/pages/AdminInventory";
import AdminUsers from "../admin/pages/AdminUsers";
import AdminOrders from "../admin/pages/AdminOrders";
import AdminReturns from "../admin/pages/AdminReturns";
import AdminReplacements from "../admin/pages/AdminReplacements";
import AdminReviews from "../admin/pages/AdminReviews";
import AdminCoupons from "../admin/pages/AdminCoupons";

import AdminProtectedRoute from "../admin/components/AdminProtectedRoute";

/* =====================================================
   ROUTES
===================================================== */

const AppRoutes = () => {
  return (
    <Routes>
      {/* =================================================
          STORE
      ================================================= */}

      <Route element={<StoreLayout />}>
        {/* ================= PUBLIC ================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/products"
          element={<ProductList />}
        />

        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/compare"
          element={<Compare />}
        />

        {/* ================= GUEST ================= */}

        <Route
          element={<GuestRoute />}
        >
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />
        </Route>

        {/* ================= PROTECTED CUSTOMER ================= */}

        <Route
          element={<ProtectedRoute />}
        >
          <Route
            path="/account"
            element={<Account />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />
        </Route>
      </Route>

      {/* =================================================
          ADMIN
      ================================================= */}

      <Route
        element={
          <AdminProtectedRoute />
        }
      >
        <Route
          element={<AdminLayout />}
        >
          {/* ================= DASHBOARD ================= */}

          <Route
            path="/admin"
            element={
              <AdminDashboard />
            }
          />

          {/* ================= PRODUCTS ================= */}

          <Route
            path="/admin/products"
            element={
              <AdminProducts />
            }
          />

          {/* ================= INVENTORY ================= */}

          <Route
            path="/admin/inventory"
            element={
              <AdminInventory />
            }
          />

          {/* ================= USERS ================= */}

          <Route
            path="/admin/users"
            element={
              <AdminUsers />
            }
          />

          {/* ================= ORDERS ================= */}

          <Route
            path="/admin/orders"
            element={
              <AdminOrders />
            }
          />

          {/* ================= RETURNS ================= */}

          <Route
            path="/admin/returns"
            element={
              <AdminReturns />
            }
          />

          {/* ================= REPLACEMENTS ================= */}

          <Route
            path="/admin/replacements"
            element={
              <AdminReplacements />
            }
          />

          {/* ================= REVIEWS ================= */}

          <Route
            path="/admin/reviews"
            element={
              <AdminReviews />
            }
          />

          {/* ================= COUPONS ================= */}

          <Route
            path="/admin/coupons"
            element={
              <AdminCoupons />
            }
          />
        </Route>
      </Route>

      {/* =================================================
          404
      ================================================= */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
};

export default AppRoutes;