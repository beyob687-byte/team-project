import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  MessageSquare,
  ThumbsUp,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import AiBadge from "../../components/shared/AiBadge";
import { clubManagementApi } from "../../api/clubManagement";

const Posts = () => {
  const { clubId } = useParams();
  const [activeTab, setActiveTab] = useState("published");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    content: "",
    post_type: "general",
    visibility: "public",
  });

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await clubManagementApi.getPosts(clubId, {
        page: 1,
        limit: 100,
      });
      setPosts(data.items || []);
    } catch (error) {
      console.error("Failed to load posts", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [clubId]);

  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((post) => {
      return [post.content, post.post_type, post.visibility, post.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [posts, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await clubManagementApi.createPost(clubId, form);
      setForm({ content: "", post_type: "general", visibility: "public" });
      setShowForm(false);
      await loadPosts();
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setSaving(false);
    }
  };

  const visiblePosts = filteredPosts.filter((post) => {
    if (activeTab === "flagged") {
      return post.moderation_status === "flagged";
    }
    return post.status !== "archived";
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">Posts</h1>
          <p className="text-text-2">
            Manage club announcements, polls, and discussions.
          </p>
        </div>
        <Button
          className="shadow-glow"
          onClick={() => setShowForm((current) => !current)}
        >
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Post Type"
                  value={form.post_type}
                  onChange={(e) =>
                    setForm({ ...form, post_type: e.target.value })
                  }
                  placeholder="general"
                />
                <Input
                  label="Visibility"
                  value={form.visibility}
                  onChange={(e) =>
                    setForm({ ...form, visibility: e.target.value })
                  }
                  placeholder="public"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" isLoading={saving}>
                  Publish Post
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 border-b border-border-glow">
        <button
          className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "published" ? "border-primary text-primary" : "border-transparent text-text-2 hover:text-text-1"}`}
          onClick={() => setActiveTab("published")}
        >
          All Posts ({posts.length})
        </button>
        <button
          className={`pb-3 px-2 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "flagged" ? "border-warning text-warning" : "border-transparent text-text-2 hover:text-warning"}`}
          onClick={() => setActiveTab("flagged")}
        >
          <AlertTriangle className="w-4 h-4" /> Moderation Queue (0)
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-2" />
          <Input
            placeholder="Search posts..."
            className="pl-9 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <AiBadge />
      </div>

      <Card>
        <div className="p-4 border-b border-border-glow flex items-center bg-surface-2/30">
          <p className="text-sm text-text-2">
            Latest published posts from the club timeline.
          </p>
        </div>

        <div className="divide-y divide-border-glow/50">
          {loading ? (
            <div className="p-6 text-text-2">Loading posts...</div>
          ) : visiblePosts.length > 0 ? (
            visiblePosts.map((post) => (
              <div
                key={post.id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-2/20 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {(post.post_type || "general").replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-text-2">
                      {post.status || "published"}
                    </span>
                    {post.moderation_status &&
                      post.moderation_status !== "approved" && (
                        <Badge variant="default">
                          {post.moderation_status}
                        </Badge>
                      )}
                  </div>
                  <h3 className="text-lg font-bold text-text-1 mb-3">
                    {post.content}
                  </h3>

                  <div className="flex items-center gap-6 text-sm text-text-2">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> 0
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" /> 0
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4" /> 0
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <button className="p-2 text-text-2 hover:text-text-1 hover:bg-surface-2 rounded-md transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-text-2">No posts found.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Posts;
