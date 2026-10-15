import {
  createSlice,
} from "@reduxjs/toolkit";

/* ================= SAVED SESSION ================= */

const savedUser =
  localStorage.getItem("user");

/* ================= INITIAL STATE ================= */

const initialState = {
  user: savedUser
    ? JSON.parse(savedUser)
    : null,

  isAuthenticated:
    Boolean(savedUser),
};

/* ================= AUTH SLICE ================= */

const authSlice =
  createSlice({
    name: "auth",

    initialState,

    reducers: {
      /* ================= LOGIN ================= */

      login: (
        state,
        action
      ) => {
        const user =
          action.payload;

        /*
          Only store information
          required by the frontend.

          Never store the password.
        */

        const safeUser = {
          id: user.id,
          name: user.name,
          email: user.email,

          role:
            user.role ||
            "customer",
        };

        state.user =
          safeUser;

        state.isAuthenticated =
          true;

        localStorage.setItem(
          "user",
          JSON.stringify(
            safeUser
          )
        );
      },

      /* ================= LOGOUT ================= */

      logout: (state) => {
        state.user = null;

        state.isAuthenticated =
          false;

        localStorage.removeItem(
          "user"
        );
      },
    },
  });

/* ================= ACTIONS ================= */

export const {
  login,
  logout,
} = authSlice.actions;

/* ================= REDUCER ================= */

export default authSlice.reducer;