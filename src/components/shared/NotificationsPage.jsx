import React, { useEffect, useState } from "react";
import { notificationsApi } from "../../api/notifications";
import { toast } from "../../components/ui/Toast";
import { MailOpen, RefreshCw, XCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/shared/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { Link } from "react-router-dom";

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

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const loadNotifications = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const data = await notificationsApi.getNotifications({ page, limit });
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
    loadNotifications();
  }, [page]);

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
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap mb-6">
        <h1 className="text-3xl font-display font-bold text-text-1">
          Your Notifications
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadNotifications}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          {notifications.some((notification) => !notification.is_read) && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Error loading notifications"
          description="Please try again later."
          icon={XCircle}
        />
      ) : notifications.length > 0 ? (
        <div className="divide-y divide-border-glow border border-border-glow rounded-lg overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 hover:bg-surface-2 transition-colors ${notif.is_read ? "text-text-2" : "bg-primary/5 text-text-1"}`}
            >
              <Link
                to={resolveNotificationLink(notif)}
                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
              >
                <p className="font-medium text-lg">
                  {notif.title || notif.type || "Notification"}
                </p>
                <p className="text-sm mt-1">
                  {notif.body || "No additional details provided."}
                </p>
                <p className="text-xs text-text-3 mt-2">
                  {formatRelativeTime(notif.created_at)}
                </p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Notifications"
          description="You're all caught up!"
          icon={MailOpen}
        />
      )}

      {notifications.length > 0 && (
        <div className="flex justify-center gap-4 mt-8">
          <Button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-text-1">Page {page}</span>
          <Button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={notifications.length < limit}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
