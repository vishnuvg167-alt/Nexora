import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getAllUsers = async () => {
  const response = await axios.get(
    `${API_URL}/users`
  );

  return response.data;
};

export const updateUserBlockStatus = async (
  userId,
  isBlocked
) => {
  const response = await axios.patch(
    `${API_URL}/users/${userId}`,
    {
      isBlocked,
    }
  );

  return response.data;
};