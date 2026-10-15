import api from "./api";

/* ================= GET USER NOTIFICATIONS ================= */

export const getNotificationsByUserId = async (userId) => {
  const response = await api.get("/notifications", {
    params: {
      userId: String(userId),
    },
  });

  return response.data;
};

/* ================= CREATE NOTIFICATION ================= */

export const createNotification = async (notificationData) => {
  const response = await api.post("/notifications", notificationData);

  return response.data;
};

/* ================= MARK AS READ ================= */

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}`, {
    isRead: true,
  });

  return response.data;
};

/* ================= MARK ALL AS READ ================= */

export const markAllNotificationsAsRead = async (notifications) => {
  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead
  );

  const responses = await Promise.all(
    unreadNotifications.map((notification) =>
      api.patch(`/notifications/${notification.id}`, {
        isRead: true,
      })
    )
  );

  return responses.map((response) => response.data);
};

/* ================= DELETE NOTIFICATION ================= */

export const deleteNotification = async (notificationId) => {
  await api.delete(`/notifications/${notificationId}`);

  return notificationId;
};