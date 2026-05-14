import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../../api/posts';
import { clubsApi } from '../../api/clubs'; // To check officer role
import { PlusCircle, MessageSquare, XCircle } from 'lucide-react';
import PostCard from '../../components/shared/PostCard';
import EmptyState from '../../components/shared/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';

const postTypes = ['all', 'general', 'event_promotion', 'project_highlight', 'poll'];

const ClubPosts = () => {
  const { clubId } = useParams();
  const [selectedType, setSelectedType] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: postsData, isLoading: isLoadingPosts, isError: isErrorPosts } = useQuery({
    queryKey: ['clubPosts', clubId, selectedType, page, limit],
    queryFn: () => postsApi.getPosts(clubId, {
      page,
      limit,
      type: selectedType === 'all' ? undefined : selectedType,
    }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: membershipData } = useQuery({
    queryKey: ['myMembership', clubId],
    queryFn: () => clubsApi.getMyMembership(clubId),
    staleTime: Infinity,
  });

  const isOfficer = membershipData?.membership?.role && ['president', 'vice_president', 'secretary', 'event_coordinator'].includes(membershipData.membership.role);

  const posts = postsData?.posts || [];
  const pagination = postsData?.pagination || { total: 0, page: 1, limit: 10 };

  if (isErrorPosts) {
    return <EmptyState title="Error loading posts" description="Failed to fetch club posts." icon={XCircle} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold text-text-1">Club Timeline</h1>
        {isOfficer && (
          <Link to={`/clubs/${clubId}/posts/new`}>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" /> Create Post
            </Button>
          </Link>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
        {postTypes.map(type => (
          <button
            key={type}
            onClick={() => { setSelectedType(type); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedType === type ? 'bg-primary text-deep' : 'bg-surface border border-border-glow text-text-2 hover:border-primary/50'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoadingPosts ? (
        <div className="space-y-6">
          {Array(limit).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post.id} clubId={clubId} post={post} />
          ))}
          {pagination.total > limit && (
            <div className="flex justify-center gap-4 mt-8">
              <Button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>Previous</Button>
              <span className="text-text-1">Page {page} of {Math.ceil(pagination.total / limit)}</span>
              <Button onClick={() => setPage(prev => prev + 1)} disabled={page * limit >= pagination.total}>Next</Button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState title="No posts found" description="This club hasn't made any posts yet, or none match your filter." icon={MessageSquare} />
      )}
    </div>
  );
};

export default ClubPosts;