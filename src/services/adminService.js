import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const loginAdmin = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  const response = await axios.get(`${API_URL}/users`, {
    params: {
      email: normalizedEmail,
    },
  });

  const admin = response.data.find(
    (user) =>
      user.email.toLowerCase() === normalizedEmail &&
      user.password === password &&
      user.role === "admin"
  );

  if (!admin) {
    throw new Error("Invalid admin credentials");
  }

  return admin;
};