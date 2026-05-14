import React, { useState, useRef, useEffect } from 'react';
import { Bell, MailOpen, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';
import useSocket from '../../hooks/useSocket';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns'; // Assuming date-fns is installed
import { toast } from '../ui/Toast';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();
  useSocket(); // Initialize socket connection and invalidate queries on new notification

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', { limit: 5 }],
    queryFn: () => notificationsApi.getNotifications({ limit: 5 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
    onError: (err) => {
      toast.error('Failed to mark notification as read.');
      console.error(err);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('All notifications marked as read.');
    },
    onError: (err) => {
      toast.error('Failed to mark all notifications as read.');
      console.error(err);
    },
  });

  const unreadCount = data?.unread_count || 0;
  const notifications = data?.notifications || [];

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <button ref={bellRef} onClick={() => setIsOpen(!isOpen)} className="relative text-text-2 hover:text-primary transition-colors">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
        )}
      </button>

      {isOpen && (
        <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 bg-surface border border-border-glow rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border-glow flex justify-between items-center">
            <h3 className="font-bold text-text-1">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="text-sm text-primary hover:underline">Mark all as read</button>
            )}
          </div>
          {isLoading ? (
            <div className="p-4 text-text-2">Loading...</div>
          ) : isError ? (
            <div className="p-4 text-danger flex items-center gap-2"><XCircle className="w-4 h-4" /> Failed to load notifications</div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-border-glow">
              {notifications.map(notif => (
                <div key={notif.id} className={`p-3 hover:bg-surface-2 transition-colors ${notif.is_read ? 'text-text-2' : 'bg-primary/5 text-text-1'}`}>
                  <Link to={notif.data?.link || '#'} onClick={() => handleMarkAsRead(notif.id)}>
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-xs">{notif.body}</p>
                    <p className="text-xs text-text-3 mt-1">{formatDistanceToNow(new Date(notif.created_at))} ago</p>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-text-2">No new notifications.</div>
          )}
          <div className="p-2 border-t border-border-glow text-center">
            <Link to="/notifications" className="text-sm text-primary hover:underline">View All</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;