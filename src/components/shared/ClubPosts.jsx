import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { postsApi } from "../../api/posts";
import { clubsApi } from "../../api/clubs"; // To check officer role
import { PlusCircle, MessageSquare, XCircle } from "lucide-react";
import PostCard from "../../components/shared/PostCard";
import EmptyState from "../../components/shared/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";

const postTypes = [
  "all",
  "general",
  "event_promotion",
  "project_highlight",
  "poll",
];

const ClubPosts = () => {
  const { clubId } = useParams();
  const [selectedType, setSelectedType] = useState("all");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const limit = 10;

  const [membershipData, setMembershipData] = useState(null);

  useEffect(() => {
    let alive = true;

    const loadPosts = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await postsApi.getPosts(clubId, { page: 1, limit: 50 });
        if (alive) {
          setPosts(data?.items || []);
        }
      } catch (loadError) {
        if (alive) {
          setPosts([]);
          setError(true);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    const loadMembership = async () => {
      try {
        const data = await clubsApi.getMyMembership(clubId);
        if (alive) {
          setMembershipData(data);
        }
      } catch (loadError) {
        if (alive) {
          setMembershipData(null);
        }
      }
    };

    loadPosts();
    loadMembership();

    return () => {
      alive = false;
    };
  }, [clubId]);

  const isOfficer =
    membershipData?.role &&
    ["president", "vice_president", "secretary", "event_coordinator"].includes(
      membershipData.role,
    );

  const filteredPosts =
    selectedType === "all"
      ? posts
      : posts.filter((post) => post.post_type === selectedType);

  if (error) {
    return (
      <EmptyState
        title="Error loading posts"
        description="Failed to fetch club posts."
        icon={XCircle}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold text-text-1">
          Club Timeline
        </h1>
        {isOfficer && (
          <Link to={`/clubs/${clubId}/posts/new`}>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" /> Create Post
            </Button>
          </Link>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
        {postTypes.map((type) => (
          <button
            key={type}
            onClick={() => {
              setSelectedType(type);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedType === type
                ? "bg-primary text-deep"
                : "bg-surface border border-border-glow text-text-2 hover:border-primary/50"
            }`}
          >
            {type.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array(limit)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} clubId={clubId} post={post} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No posts found"
          description="This club hasn't made any posts yet, or none match your filter."
          icon={MessageSquare}
        />
      )}
    </div>
  );
};

export default ClubPosts;
