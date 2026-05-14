import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';
import { toast } from '../../components/ui/Toast';
import { MailOpen, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/shared/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', { page, limit }],
    queryFn: () => notificationsApi.getNotifications({ page, limit }),
    staleTime: 5 * 60 * 1000,
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

  const notifications = data?.notifications || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10 };

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold text-text-1">Your Notifications</h1>
        {notifications.some(n => !n.is_read) && (
          <Button variant="outline" onClick={handleMarkAllAsRead} isLoading={markAllAsReadMutation.isLoading}>
            Mark All as Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(limit).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : isError ? (
        <EmptyState title="Error loading notifications" description="Please try again later." icon={XCircle} />
      ) : notifications.length > 0 ? (
        <div className="divide-y divide-border-glow border border-border-glow rounded-lg overflow-hidden">
          {notifications.map(notif => (
            <div key={notif.id} className={`p-4 hover:bg-surface-2 transition-colors ${notif.is_read ? 'text-text-2' : 'bg-primary/5 text-text-1'}`}>
              <Link to={notif.data?.link || '#'} onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}>
                <p className="font-medium text-lg">{notif.title}</p>
                <p className="text-sm mt-1">{notif.body}</p>
                <p className="text-xs text-text-3 mt-2">{formatDistanceToNow(new Date(notif.created_at))} ago</p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No Notifications" description="You're all caught up!" icon={MailOpen} />
      )}

      {pagination.total > limit && (
        <div className="flex justify-center gap-4 mt-8">
          <Button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>Previous</Button>
          <span className="text-text-1">Page {page} of {Math.ceil(pagination.total / limit)}</span>
          <Button onClick={() => setPage(prev => prev + 1)} disabled={page * limit >= pagination.total}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;