import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  fetchNotifications,
  markNotificationAsReadThunk,
  markAllNotificationsAsReadThunk,
  deleteNotificationThunk,
} from "../../redux/slices/notificationSlice";

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const {
    items: notifications,
    loading,
    markingAll,
    updatingNotificationId,
    deletingNotificationId,
  } = useSelector((state) => state.notifications);

  /* ================= UNREAD COUNT ================= */

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    dispatch(fetchNotifications(user.id));
  }, [dispatch, isAuthenticated, user?.id]);

  /* ================= CLICK OUTSIDE ================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ================= ROUTE ================= */

  const getNotificationRoute = (notification) => {
    const type = String(notification.type || "general").toLowerCase();

    const routes = {
      order: "/orders",
      return: "/orders",
      refund: "/orders",
      account: "/account",
    };

    return routes[type] || null;
  };

  /* ================= HANDLERS ================= */

  const handleToggle = () => {
    setIsOpen((open) => !open);
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await dispatch(
          markNotificationAsReadThunk(notification.id)
        ).unwrap();
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }

    setIsOpen(false);

    const route = getNotificationRoute(notification);

    if (route) {
      navigate(route);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0 || markingAll) return;

    dispatch(markAllNotificationsAsReadThunk(notifications));
  };

  const handleDelete = (event, notificationId) => {
    event.stopPropagation();

    dispatch(deleteNotificationThunk(notificationId));
  };

  /* ================= AUTH GUARD ================= */

  if (!isAuthenticated || !user?.id) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* ================= BELL ================= */}

      <button
        type="button"
        onClick={handleToggle}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
          isOpen
            ? "bg-nexora-primary-soft text-nexora-primary"
            : "text-nexora-text hover:bg-nexora-primary-soft hover:text-nexora-primary"
        }`}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
      >
        <BellIcon />

        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 min-w-5 -translate-y-1 translate-x-1 items-center justify-center rounded-full bg-nexora-copper px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ================= DROPDOWN ================= */}

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+14px)] z-[70] w-[calc(100vw-2rem)] max-w-[390px] overflow-hidden rounded-[1.5rem] border border-nexora-border bg-nexora-surface shadow-[0_24px_70px_rgba(18,63,50,0.16)] sm:w-[390px]">
          {/* ================= HEADER ================= */}

          <div className="flex items-center justify-between border-b border-nexora-border px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-[-0.02em] text-nexora-text">
                  Notifications
                </h3>

                {unreadCount > 0 && (
                  <span className="rounded-full bg-nexora-primary-soft px-2 py-1 text-[9px] font-bold text-nexora-primary">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <p className="mt-1 text-[11px] text-nexora-muted">
                Updates about your orders and account
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="shrink-0 text-[10px] font-bold text-nexora-primary transition hover:text-nexora-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {markingAll ? "Updating..." : "Mark all read"}
              </button>
            )}
          </div>

          {/* ================= CONTENT ================= */}

          <div className="max-h-[430px] overflow-y-auto">
            {loading ? (
              <NotificationSkeleton />
            ) : notifications.length === 0 ? (
              <EmptyNotifications />
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  updating={
                    String(updatingNotificationId) ===
                    String(notification.id)
                  }
                  deleting={
                    String(deletingNotificationId) ===
                    String(notification.id)
                  }
                  onClick={handleNotificationClick}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* =====================================================
   NOTIFICATION ITEM
===================================================== */

const NotificationItem = ({
  notification,
  updating,
  deleting,
  onClick,
  onDelete,
}) => {
  const type = notification.type || "general";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(notification)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick(notification);
        }
      }}
      className={`group relative flex w-full cursor-pointer gap-3 border-b border-nexora-border px-5 py-4 text-left transition last:border-b-0 ${
        notification.isRead
          ? "bg-nexora-surface hover:bg-nexora-ivory/70"
          : "bg-nexora-primary-soft/40 hover:bg-nexora-primary-soft/60"
      } ${updating ? "pointer-events-none opacity-60" : ""}`}
    >
      {/* ================= TYPE ICON ================= */}

      <NotificationTypeIcon type={type} />

      {/* ================= CONTENT ================= */}

      <div className="min-w-0 flex-1 pr-7">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-xs font-bold leading-5 text-nexora-text">
            {notification.title}
          </p>

          {!notification.isRead && (
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-nexora-primary"
              aria-label="Unread"
            />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-nexora-muted">
          {notification.message}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-nexora-taupe">
            {formatNotificationDate(notification.createdAt)}
          </p>

          {isNavigableNotification(notification) && (
            <>
              <span className="h-1 w-1 rounded-full bg-nexora-border" />

              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-nexora-primary">
                View details →
              </span>
            </>
          )}
        </div>
      </div>

      {/* ================= DELETE ================= */}

      <button
        type="button"
        onClick={(event) => onDelete(event, notification.id)}
        disabled={deleting}
        className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-nexora-taupe opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Delete notification"
      >
        {deleting ? (
          <span className="text-[9px]">...</span>
        ) : (
          <CloseIcon />
        )}
      </button>
    </div>
  );
};

/* =====================================================
   NAVIGABLE NOTIFICATION
===================================================== */

const isNavigableNotification = (notification) => {
  const type = String(notification.type || "").toLowerCase();

  return ["order", "return", "refund", "account"].includes(type);
};

/* =====================================================
   TYPE ICON
===================================================== */

const NotificationTypeIcon = ({ type }) => {
  const styles = {
    order: "bg-blue-50 text-blue-600",
    return: "bg-amber-50 text-amber-700",
    refund: "bg-emerald-50 text-emerald-700",
    account: "bg-nexora-primary-soft text-nexora-primary",
    general: "bg-nexora-taupe-soft text-nexora-muted",
  };

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        styles[type] || styles.general
      }`}
    >
      {type === "order" ? (
        <PackageIcon />
      ) : type === "return" ? (
        <ReturnIcon />
      ) : type === "refund" ? (
        <RefundIcon />
      ) : (
        <BellIcon className="h-4 w-4" />
      )}
    </div>
  );
};

/* =====================================================
   EMPTY STATE
===================================================== */

const EmptyNotifications = () => {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-nexora-primary-soft text-nexora-primary">
        <BellIcon />
      </div>

      <h4 className="mt-4 text-sm font-bold text-nexora-text">
        You're all caught up
      </h4>

      <p className="mx-auto mt-1.5 max-w-[230px] text-[11px] leading-5 text-nexora-muted">
        New order, return and refund updates will appear here.
      </p>
    </div>
  );
};

/* =====================================================
   LOADING
===================================================== */

const NotificationSkeleton = () => {
  return (
    <div className="space-y-1 p-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex animate-pulse gap-3 rounded-xl px-2 py-3"
        >
          <div className="h-9 w-9 shrink-0 rounded-xl bg-nexora-taupe-soft" />

          <div className="flex-1">
            <div className="h-3 w-2/5 rounded bg-nexora-taupe-soft" />
            <div className="mt-2 h-2.5 w-4/5 rounded bg-nexora-taupe-soft" />
            <div className="mt-2 h-2 w-1/4 rounded bg-nexora-taupe-soft" />
          </div>
        </div>
      ))}
    </div>
  );
};

/* =====================================================
   DATE
===================================================== */

const formatNotificationDate = (date) => {
  if (!date) return "Recently";

  const createdAt = new Date(date);

  if (Number.isNaN(createdAt.getTime())) {
    return "Recently";
  }

  const now = new Date();
  const difference = now.getTime() - createdAt.getTime();

  if (difference < 0) {
    return "Just now";
  }

  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return createdAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

/* =====================================================
   ICONS
===================================================== */

const BellIcon = ({ className = "h-5 w-5" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 21h4"
      />
    </svg>
  );
};

const PackageIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 7.5 8 4.5 8-4.5M12 12v9"
      />
    </svg>
  );
};

const ReturnIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 7 5 11l4 4"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 11h9a5 5 0 0 1 5 5v1"
      />
    </svg>
  );
};

const RefundIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 9.5c-.5-.7-1.3-1-2.4-1-1.3 0-2.1.6-2.1 1.5 0 2.4 5 1 5 3.5 0 1-.9 1.8-2.5 1.8-1.2 0-2.2-.4-2.8-1.2M12.5 7v10"
      />
    </svg>
  );
};

const CloseIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6l12 12M18 6 6 18"
      />
    </svg>
  );
};

export default NotificationBell;