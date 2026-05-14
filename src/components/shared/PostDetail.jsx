import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../../api/posts';
import { commentsApi } from '../../api/comments';
import { ArrowLeft, MessageCircle, Send, XCircle } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import PollWidget from '../../components/shared/PollWidget';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '../../components/ui/Toast';
import useAuthStore from '../../store/authStore';

const PostDetail = () => {
  const { clubId, postId } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [commentContent, setCommentContent] = useState('');

  const { data: post, isLoading: isLoadingPost, isError: isErrorPost } = useQuery({
    queryKey: ['postDetail', clubId, postId],
    queryFn: () => postsApi.getPost(clubId, postId),
    staleTime: 5 * 60 * 1000,
  });

  const { data: commentsData, isLoading: isLoadingComments, isError: isErrorComments } = useQuery({
    queryKey: ['postComments', clubId, postId],
    queryFn: () => commentsApi.getComments(clubId, postId),
    staleTime: 1 * 60 * 1000,
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => commentsApi.createComment(clubId, postId, content),
    onSuccess: () => {
      setCommentContent('');
      queryClient.invalidateQueries(['postComments', clubId, postId]);
      toast.success('Comment added successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'Failed to add comment.');
      console.error(err);
    },
  });

  const handleDeleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(clubId, postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['postComments', clubId, postId]);
      toast.success('Comment deleted successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete comment.');
      console.error(err);
    },
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentContent.trim()) {
      createCommentMutation.mutate(commentContent);
    }
  };

  if (isLoadingPost) return <Skeleton className="h-96 w-full" />;
  if (isErrorPost || !post) return <EmptyState title="Post not found" description="The post you are looking for does not exist." icon={XCircle} />;

  const comments = commentsData?.items || [];

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <Link to={`/clubs/${clubId}/posts`} className="inline-flex items-center text-sm text-text-2 hover:text-primary transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Club Timeline
      </Link>

      <div className="bg-surface rounded-lg border border-border-glow shadow-card p-4 md:p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Avatar src={post.author?.avatar_url} alt={post.author?.first_name} size="md" />
          <div>
            <p className="font-semibold text-text-1">{post.author?.first_name} {post.author?.last_name}</p>
            <p className="text-xs text-text-2">{formatDistanceToNow(new Date(post.created_at))} ago</p>
          </div>
        </div>

        <p className="text-text-1 mb-4 leading-relaxed">{post.content}</p>

        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {post.images.map((img, index) => (
              <img key={index} src={img} alt={`Post image ${index + 1}`} className="w-full h-auto rounded-md object-cover" />
            ))}
          </div>
        )}

        {post.post_type === 'poll' && post.poll && (
          <div className="mt-4">
            <PollWidget clubId={clubId} postId={postId} initialPoll={post.poll} />
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div id="comments" className="bg-surface rounded-lg border border-border-glow shadow-card p-4 md:p-6">
        <h2 className="text-xl font-display font-bold text-text-1 mb-4">Comments ({comments.length})</h2>
        
        {user && (
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
            <Input
              type="text"
              placeholder="Add a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" isLoading={createCommentMutation.isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}

        {isLoadingComments ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isErrorComments ? (
          <p className="text-danger">Error loading comments.</p>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex items-start gap-3 p-3 bg-surface-2 rounded-md">
                <Avatar src={comment.author?.avatar_url} alt={comment.user_name} size="sm" />
                <div>
                  <p className="font-semibold text-text-1 text-sm">{comment.user_name} <span className="text-xs text-text-3 font-normal">{formatDistanceToNow(new Date(comment.created_at))} ago</span></p>
                  <p className="text-text-2 text-sm">{comment.content}</p>
                  {(user?.id === comment.user_id || user?.user_type === 'admin') && ( // Assuming admin can delete any comment
                    <button onClick={() => handleDeleteCommentMutation.mutate(comment.id)} className="text-xs text-danger hover:underline mt-1">Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No Comments Yet" description="Be the first to comment!" icon={MessageCircle} />
        )}
      </div>
    </div>
  );
};

export default PostDetail;