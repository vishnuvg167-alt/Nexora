import { configureStore } from "@reduxjs/toolkit";

import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import wishlistReducer from "./slices/wishlistSlice";
import orderReducer from "./slices/orderSlice";
import reviewReducer from "./slices/reviewSlice";
import addressReducer from "./slices/addressSlice";
import returnReducer from "./slices/returnSlice";
import replacementReducer from "./slices/replacementSlice";
import adminUserReducer from "./slices/adminUserSlice";
import inventoryReducer from "./slices/inventorySlice";
import comparisonReducer from "./slices/comparisonSlice";
import notificationReducer from "./slices/notificationSlice";

/* ================= STORE ================= */

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    auth: authReducer,
    wishlist: wishlistReducer,
    orders: orderReducer,
    reviews: reviewReducer,
    addresses: addressReducer,
    returns: returnReducer,
    replacements: replacementReducer,
    adminUsers: adminUserReducer,
    inventory: inventoryReducer,
    comparison: comparisonReducer,
    notifications: notificationReducer,
  },
});