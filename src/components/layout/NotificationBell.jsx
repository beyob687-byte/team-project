import React, { useEffect, useRef, useState } from "react";
import { Bell, MailOpen, XCircle } from "lucide-react";
import { notificationsApi } from "../../api/notifications";
import { Link } from "react-router-dom";
import { toast } from "../ui/Toast";

const formatRelativeTime = (value) => {
  if (!value) return "just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const resolveNotificationLink = (notification) => {
  const link = notification?.data?.link;
  return typeof link === "string" && link.trim() ? link : "/notifications";
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const data = await notificationsApi.getNotifications({ limit: 5 });
      setNotifications(data?.items || []);
      setUnreadCount(data?.unread_count || 0);
    } catch (error) {
      setIsError(true);
      toast.error(
        error.response?.data?.error?.message || "Failed to load notifications.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      await loadNotifications();
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
          "Failed to mark notification as read.",
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      toast.success("All notifications marked as read.");
      await loadNotifications();
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
          "Failed to mark all notifications as read.",
      );
    }
  };

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-text-2 hover:text-primary transition-colors"
        aria-label="Open notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 bg-surface border border-border-glow rounded-lg shadow-lg z-50"
        >
          <div className="p-4 border-b border-border-glow flex justify-between items-center">
            <h3 className="font-bold text-text-1">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          {isLoading ? (
            <div className="p-4 text-text-2">Loading...</div>
          ) : isError ? (
            <div className="p-4 text-danger flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Failed to load notifications
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-border-glow">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 hover:bg-surface-2 transition-colors ${notif.is_read ? "text-text-2" : "bg-primary/5 text-text-1"}`}
                >
                  <Link
                    to={resolveNotificationLink(notif)}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <p className="font-medium text-sm">
                      {notif.title || notif.type || "Notification"}
                    </p>
                    <p className="text-xs">
                      {notif.body || "No additional details provided."}
                    </p>
                    <p className="text-xs text-text-3 mt-1">
                      {formatRelativeTime(notif.created_at)}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-text-2">No new notifications.</div>
          )}
          <div className="p-2 border-t border-border-glow text-center">
            <Link
              to="/notifications"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
