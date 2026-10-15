import api from "./api";

/* =====================================================
   CUSTOMER AUTH
===================================================== */

export const getUserByEmail = async (email) => {
  const response = await api.get(
    `/users?email=${encodeURIComponent(email)}`
  );

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post(
    "/users",
    userData
  );

  return response.data;
};

export const loginUser = async (
  email,
  password
) => {
  const response = await api.get(
    `/users?email=${encodeURIComponent(email)}`
  );

  const users = response.data;

  const user = users.find(
    (user) =>
      user.password === password
  );

  return user || null;
};

/* =====================================================
   ADMIN USER MANAGEMENT
===================================================== */

/* ================= GET CUSTOMERS ================= */

export const getAllUsers = async () => {
  const response = await api.get(
    "/users"
  );

  /*
    Admin accounts should not appear
    inside customer management.
  */

  return response.data.filter(
    (user) =>
      user.role !== "admin"
  );
};

/* ================= GET USER ================= */

export const getUserById = async (
  userId
) => {
  const response = await api.get(
    `/users/${userId}`
  );

  return response.data;
};

/* ================= UPDATE USER ================= */

export const updateUser = async (
  userId,
  userData
) => {
  const response = await api.patch(
    `/users/${userId}`,
    userData
  );

  return response.data;
};

/* ================= BLOCK / UNBLOCK ================= */

export const updateUserBlockStatus =
  async (
    userId,
    isBlocked
  ) => {
    const response =
      await api.patch(
        `/users/${userId}`,
        {
          isBlocked,
        }
      );

    return response.data;
  };