import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Hash } from "lucide-react";
import { postsApi } from "../../api/posts";
import { eventsApi } from "../../api/events";
import { projectsApi } from "../../api/projects";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/shared/EmptyState";
import { toast } from "../../components/ui/Toast";

const emptyForm = {
  content: "",
  postType: "general",
  visibility: "public",
  images: [],
  videoUrl: "",
  linkedEventId: "",
  linkedProjectId: "",
  pollQuestion: "",
  pollOptions: ["", ""],
  pollMultipleChoice: false,
  pollResultsVisibility: "after_close",
  pollExpiresAt: "",
};

const PostForm = () => {
  const { clubId, postId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(postId);

  const [form, setForm] = useState(emptyForm);
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      if (!clubId) return;

      setLoading(true);
      try {
        const [eventsResponse, projectsResponse] = await Promise.all([
          eventsApi.getEvents(clubId, { limit: 100 }),
          projectsApi.getProjects(clubId, { limit: 100 }),
        ]);

        if (!ignore) {
          setEvents(eventsResponse?.items || []);
          setProjects(projectsResponse?.items || []);
        }

        if (isEdit) {
          const existing = await postsApi.getPost(clubId, postId);
          if (!ignore && existing) {
            setForm({
              content: existing.content || "",
              postType: existing.post_type || "general",
              visibility: existing.visibility || "public",
              images: existing.images || [],
              videoUrl: existing.video_url || "",
              linkedEventId: existing.linked_event?.id || "",
              linkedProjectId: existing.linked_project?.id || "",
              pollQuestion: existing.poll?.question || "",
              pollOptions: (existing.poll?.options || []).map(
                (option) => option.option_text || "",
              ),
              pollMultipleChoice: Boolean(existing.poll?.multiple_choice),
              pollResultsVisibility:
                existing.poll?.results_visibility || "after_close",
              pollExpiresAt: existing.poll?.expires_at
                ? new Date(existing.poll.expires_at).toISOString().slice(0, 16)
                : "",
            });
          }
        }
      } catch (error) {
        toast.error(
          error.response?.data?.error?.message || "Failed to load post data.",
        );
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [clubId, isEdit, postId]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageChange = (event) => {
    setForm((current) => ({
      ...current,
      images: [...current.images, ...Array.from(event.target.files || [])],
    }));
  };

  const addPollOption = () => {
    setForm((current) => ({
      ...current,
      pollOptions: [...current.pollOptions, ""],
    }));
  };

  const updatePollOption = (index, value) => {
    setForm((current) => {
      const pollOptions = [...current.pollOptions];
      pollOptions[index] = value;
      return { ...current, pollOptions };
    });
  };

  const removePollOption = (index) => {
    setForm((current) => ({
      ...current,
      pollOptions: current.pollOptions.filter(
        (_, optionIndex) => optionIndex !== index,
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!clubId) return;

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("content", form.content);
      payload.append("post_type", form.postType);
      payload.append("visibility", form.visibility);
      if (form.videoUrl) payload.append("video_url", form.videoUrl);
      if (form.linkedEventId)
        payload.append("linked_event_id", form.linkedEventId);
      if (form.linkedProjectId)
        payload.append("linked_project_id", form.linkedProjectId);

      form.images.forEach((file) => {
        if (file instanceof File) {
          payload.append("images", file);
        }
      });

      if (form.postType === "poll") {
        payload.append("question", form.pollQuestion);
        payload.append(
          "poll_options",
          JSON.stringify(
            form.pollOptions.filter((option) => option.trim() !== ""),
          ),
        );
        payload.append("multiple_choice", String(form.pollMultipleChoice));
        payload.append("results_visibility", form.pollResultsVisibility);
        if (form.pollExpiresAt) {
          payload.append(
            "expires_at",
            new Date(form.pollExpiresAt).toISOString(),
          );
        }
      }

      if (isEdit) {
        await postsApi.updatePost(
          clubId,
          postId,
          Object.fromEntries(payload.entries()),
        );
        toast.success("Post updated successfully!");
        navigate(`/clubs/${clubId}/posts/${postId}`);
      } else {
        await postsApi.createPost(clubId, payload);
        toast.success("Post created successfully!");
        navigate(`/clubs/${clubId}/posts`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
          `Failed to ${isEdit ? "update" : "create"} post.`,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Post" : "Create New Post"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-2 mb-2">
                Post Content
              </label>
              <textarea
                value={form.content}
                onChange={(event) => updateField("content", event.target.value)}
                placeholder="What's on your mind?"
                className="w-full min-h-[140px] rounded-md border border-border-glow bg-surface-2 px-4 py-3 text-text-1 outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-2 mb-2">
                Post Type
              </label>
              <select
                value={form.postType}
                onChange={(event) =>
                  updateField("postType", event.target.value)
                }
                disabled={isEdit}
                className="w-full rounded-md border border-border-glow bg-surface-2 px-4 py-3 text-text-1 outline-none focus:border-primary"
              >
                <option value="general">General Announcement</option>
                <option value="event_promotion">Event Promotion</option>
                <option value="project_highlight">Project Highlight</option>
                <option value="poll">Poll</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-2 mb-2">
                Visibility
              </label>
              <select
                value={form.visibility}
                onChange={(event) =>
                  updateField("visibility", event.target.value)
                }
                className="w-full rounded-md border border-border-glow bg-surface-2 px-4 py-3 text-text-1 outline-none focus:border-primary"
              >
                <option value="public">Public</option>
                <option value="members_only">Members Only</option>
              </select>
            </div>

            {form.postType === "event_promotion" && (
              <div>
                <label className="block text-sm font-medium text-text-2 mb-2">
                  Link to Event
                </label>
                <select
                  value={form.linkedEventId}
                  onChange={(event) =>
                    updateField("linkedEventId", event.target.value)
                  }
                  className="w-full rounded-md border border-border-glow bg-surface-2 px-4 py-3 text-text-1 outline-none focus:border-primary"
                >
                  <option value="">Select an event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.postType === "project_highlight" && (
              <div>
                <label className="block text-sm font-medium text-text-2 mb-2">
                  Link to Project
                </label>
                <select
                  value={form.linkedProjectId}
                  onChange={(event) =>
                    updateField("linkedProjectId", event.target.value)
                  }
                  className="w-full rounded-md border border-border-glow bg-surface-2 px-4 py-3 text-text-1 outline-none focus:border-primary"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.postType === "poll" && (
              <div className="space-y-4 p-4 border border-border-glow rounded-md">
                <h3 className="font-bold text-text-1 flex items-center gap-2">
                  <Hash className="w-5 h-5" /> Poll Details
                </h3>

                <div>
                  <label className="block text-sm font-medium text-text-2 mb-2">
                    Poll Question
                  </label>
                  <input
                    value={form.pollQuestion}
                    onChange={(event) =>
                      updateField("pollQuestion", event.target.value)
                    }
                    className="w-full rounded-md border border-border-glow bg-surface-2 px-4 py-3 text-text-1 outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-2">
                    Options
                  </label>
                  {form.pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={option}
                        onChange={(event) =>
                          updatePollOption(index, event.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        className="w-full rounded-md border border-border-glow bg-surface-2 px-4 py-3 text-text-1 outline-none focus:border-primary"
                        required
                      />
                      {form.pollOptions.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removePollOption(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addPollOption}
                  >
                    Add Option
                  </Button>
                </div>

                <label className="flex items-center gap-2 text-sm text-text-2">
                  <input
                    type="checkbox"
                    checked={form.pollMultipleChoice}
                    onChange={(event) =>
                      updateField("pollMultipleChoice", event.target.checked)
                    }
                  />
                  Allow Multiple Choices
                </label>

                <div>
                  <label className="block text-sm font-medium text-text-2 mb-2">
                    Results Visibility
                  </label>
                  <select
                    value={form.pollResultsVisibility}
                    onChange={(event) =>
                      updateField("pollResultsVisibility", event.target.value)
                    }
                    className="w-full rounded-md border border-border-glow bg-surface-2 px-4 py-3 text-text-1 outline-none focus:border-primary"
                  >
                    <option value="after_vote">After Vote</option>
                    <option value="always">Always</option>
                    <option value="after_close">After Close</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-2 mb-2">
                    Poll Expires At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={form.pollExpiresAt}
                    onChange={(event) =>
                      updateField("pollExpiresAt", event.target.value)
                    }
                    className="w-full rounded-md border border-border-glow bg-surface-2 px-4 py-3 text-text-1 outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-2 mb-2">
                Images
              </label>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>

            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.images.map((file, index) => (
                  <img
                    key={index}
                    src={
                      file instanceof File ? URL.createObjectURL(file) : file
                    }
                    alt={`Preview ${index}`}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-2 mb-2">
                Video URL (YouTube/Vimeo link)
              </label>
              <Input
                type="url"
                value={form.videoUrl}
                onChange={(event) =>
                  updateField("videoUrl", event.target.value)
                }
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <Button type="submit" isLoading={saving}>
              {isEdit ? "Save Changes" : "Create Post"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostForm;
