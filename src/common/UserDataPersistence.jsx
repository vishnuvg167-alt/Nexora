import {
  useEffect,
  useRef,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchCart,
  saveCart,
  clearCart,
} from "../redux/slices/cartSlice";

import {
  fetchWishlist,
  clearWishlist,
} from "../redux/slices/wishlistSlice";

const UserDataPersistence = () => {
  const dispatch = useDispatch();

  /* ================= USER ================= */

  const user = useSelector(
    (state) => state.auth.user
  );

  /* ================= CART ================= */

  const {
    items: cartItems,
    cartId,
    loading: cartLoading,
  } = useSelector(
    (state) => state.cart
  );

  /*
    Tracks which user's cart
    has finished loading.
  */

  const loadedCartUserId =
    useRef(null);

  /*
    Prevent saving immediately
    after fetchCart changes items.
  */

  const skipNextCartSave =
    useRef(false);

  /* =========================================
     LOAD USER DATA
  ========================================= */

  useEffect(() => {
    /* =====================================
       LOGGED OUT
    ===================================== */

    if (!user?.id) {
      loadedCartUserId.current =
        null;

      skipNextCartSave.current =
        false;

      dispatch(
        clearCart()
      );

      dispatch(
        clearWishlist()
      );

      return;
    }

    /* =====================================
       CART
    ===================================== */

    loadedCartUserId.current =
      null;

    skipNextCartSave.current =
      true;

    dispatch(
      fetchCart(user.id)
    )
      .unwrap()
      .then(() => {
        loadedCartUserId.current =
          user.id;
      })
      .catch((error) => {
        console.error(
          "Failed to load cart:",
          error
        );
      });

    /* =====================================
       WISHLIST
    ===================================== */

    dispatch(
      fetchWishlist(
        user.id
      )
    )
      .unwrap()
      .catch((error) => {
        console.error(
          "Failed to load wishlist:",
          error
        );
      });
  }, [
    user?.id,
    dispatch,
  ]);

  /* =========================================
     SAVE CART TO JSON SERVER
  ========================================= */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    if (cartLoading) {
      return;
    }

    /*
      Don't save until fetchCart
      has finished.
    */

    if (
      loadedCartUserId.current !==
      user.id
    ) {
      return;
    }

    /*
      fetchCart changes cartItems.

      We don't want that fetched
      data to immediately trigger
      another save request.
    */

    if (
      skipNextCartSave.current
    ) {
      skipNextCartSave.current =
        false;

      return;
    }

    dispatch(
      saveCart({
        userId:
          user.id,

        cartId,

        items:
          cartItems,
      })
    );
  }, [
    cartItems,
    cartId,
    cartLoading,
    user?.id,
    dispatch,
  ]);

  return null;
};

export default UserDataPersistence;