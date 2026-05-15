import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { postsApi } from "../../api/posts";
import { commentsApi } from "../../api/comments";
import { ArrowLeft, MessageCircle, Send, XCircle } from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/shared/EmptyState";
import PollWidget from "../../components/shared/PollWidget";
import { toast } from "../../components/ui/Toast";
import useAuthStore from "../../store/authStore";

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

const PostDetail = () => {
  const { clubId, postId } = useParams();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingCommentId, setIsDeletingCommentId] = useState(null);

  const loadPost = async () => {
    setIsLoadingPost(true);
    try {
      const data = await postsApi.getPost(clubId, postId);
      setPost(data);
    } catch (error) {
      setPost(null);
      toast.error(
        error.response?.data?.error?.message || "Failed to load post.",
      );
    } finally {
      setIsLoadingPost(false);
    }
  };

  const loadComments = async () => {
    setIsLoadingComments(true);
    try {
      const data = await commentsApi.getComments(clubId, postId);
      setComments(data?.items || []);
    } catch (error) {
      setComments([]);
      toast.error(
        error.response?.data?.error?.message || "Failed to load comments.",
      );
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (!clubId || !postId) return;
    loadPost();
    loadComments();
  }, [clubId, postId]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!commentContent.trim()) return;

    setIsSubmitting(true);
    try {
      await commentsApi.createComment(clubId, postId, commentContent);
      setCommentContent("");
      toast.success("Comment added successfully!");
      await loadComments();
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || "Failed to add comment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setIsDeletingCommentId(commentId);
    try {
      await commentsApi.deleteComment(clubId, postId, commentId);
      toast.success("Comment deleted successfully!");
      await loadComments();
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || "Failed to delete comment.",
      );
    } finally {
      setIsDeletingCommentId(null);
    }
  };

  if (isLoadingPost) return <Skeleton className="h-96 w-full" />;
  if (!post)
    return (
      <EmptyState
        title="Post not found"
        description="The post you are looking for does not exist."
        icon={XCircle}
      />
    );

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <Link
        to={`/clubs/${clubId}/posts`}
        className="inline-flex items-center text-sm text-text-2 hover:text-primary transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Club Timeline
      </Link>

      <div className="bg-surface rounded-lg border border-border-glow shadow-card p-4 md:p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Avatar
            src={post.author?.avatar_url}
            alt={post.author?.first_name}
            size="md"
          />
          <div>
            <p className="font-semibold text-text-1">
              {post.author?.first_name} {post.author?.last_name}
            </p>
            <p className="text-xs text-text-2">
              {formatRelativeTime(post.created_at)}
            </p>
          </div>
        </div>

        <p className="text-text-1 mb-4 leading-relaxed">{post.content}</p>

        {Array.isArray(post.images) && post.images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {post.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Post image ${index + 1}`}
                className="w-full h-auto rounded-md object-cover"
              />
            ))}
          </div>
        )}

        {post.post_type === "poll" && post.poll && (
          <div className="mt-4">
            <PollWidget
              clubId={clubId}
              postId={postId}
              initialPoll={post.poll}
            />
          </div>
        )}
      </div>

      <div
        id="comments"
        className="bg-surface rounded-lg border border-border-glow shadow-card p-4 md:p-6"
      >
        <h2 className="text-xl font-display font-bold text-text-1 mb-4">
          Comments ({comments.length})
        </h2>

        {user && (
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
            <Input
              type="text"
              placeholder="Add a comment..."
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              className="flex-1"
            />
            <Button type="submit" isLoading={isSubmitting}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}

        {isLoadingComments ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start gap-3 p-3 bg-surface-2 rounded-md"
              >
                <Avatar
                  src={comment.author?.avatar_url}
                  alt={comment.user_name}
                  size="sm"
                />
                <div>
                  <p className="font-semibold text-text-1 text-sm">
                    {comment.user_name}{" "}
                    <span className="text-xs text-text-3 font-normal">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                  </p>
                  <p className="text-text-2 text-sm">{comment.content}</p>
                  {(user?.id === comment.user_id ||
                    user?.user_type === "admin") && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-danger hover:underline mt-1"
                      disabled={isDeletingCommentId === comment.id}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Comments Yet"
            description="Be the first to comment!"
            icon={MessageCircle}
          />
        )}
      </div>
    </div>
  );
};

export default PostDetail;
