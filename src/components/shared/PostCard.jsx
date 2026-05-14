import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Calendar, Folder, Link as LinkIcon } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import PollWidget from './PollWidget'; // New component
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ clubId, post }) => {
  const renderLinkedEntity = () => {
    if (post.linked_event) {
      return (
        <Link to={`/clubs/${clubId}/events/${post.linked_event.id}`} className="block p-3 bg-surface-2 rounded-md border border-border-glow hover:border-primary/50 transition-colors mt-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-text-1">Event: {post.linked_event.title}</p>
              <p className="text-xs text-text-2">Click to view event details</p>
            </div>
          </div>
        </Link>
      );
    }
    if (post.linked_project) {
      return (
        <Link to={`/clubs/${clubId}/projects/${post.linked_project.id}`} className="block p-3 bg-surface-2 rounded-md border border-border-glow hover:border-primary/50 transition-colors mt-4">
          <div className="flex items-center gap-3">
            <Folder className="w-5 h-5 text-secondary" />
            <div>
              <p className="font-medium text-text-1">Project: {post.linked_project.title}</p>
              <p className="text-xs text-text-2">Click to view project details</p>
            </div>
          </Link>
        );
    }
    return null;
  };

  return (
    <div className="bg-surface rounded-lg border border-border-glow shadow-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar src={post.author?.avatar_url} alt={post.author?.first_name} size="md" />
          <div>
            <p className="font-semibold text-text-1">{post.author?.first_name} {post.author?.last_name}</p>
            <p className="text-xs text-text-2">{formatDistanceToNow(new Date(post.created_at))} ago</p>
          </div>
        </div>
        <Badge variant="outline">{post.post_type.replace('_', ' ')}</Badge>
      </div>

      <Link to={`/clubs/${clubId}/posts/${post.id}`} className="block">
        <p className="text-text-1 mb-4 leading-relaxed">{post.content}</p>
      </Link>

      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {post.images.map((img, index) => (
            <img key={index} src={img} alt={`Post image ${index + 1}`} className="w-full h-auto rounded-md object-cover" />
          ))}
        </div>
      )}

      {post.video_url && (
        <div className="mt-4">
          <a href={post.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline text-sm">
            <LinkIcon className="w-4 h-4 mr-1" /> Watch Video
          </a>
        </div>
      )}

      {renderLinkedEntity()}

      {post.post_type === 'poll' && post.poll && (
        <div className="mt-4">
          <PollWidget clubId={clubId} postId={post.id} initialPoll={post.poll} />
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-glow">
        <Link to={`/clubs/${clubId}/posts/${post.id}#comments`} className="flex items-center gap-1 text-text-2 hover:text-primary transition-colors">
          <MessageCircle className="w-4 h-4" /> {post.comments_count || 0} Comments
        </Link>
        {/* Likes are not in backend for posts, so skipping */}
      </div>
    </div>
  );
};

export default PostCard;