import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Plus,
  Clock,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import StatusBadge from "../../components/shared/StatusBadge";
import EmptyState from "../../components/shared/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/Toast";
import { projectsApi } from "../../api/projects";

const statusOptions = [
  { label: "All", value: "" },
  { label: "Planning", value: "planning" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

const visibilityOptions = [
  { label: "Public", value: "public" },
  { label: "Members Only", value: "members_only" },
];

const emptyForm = {
  title: "",
  description: "",
  status: "planning",
  visibility: "public",
  start_date: "",
  end_date: "",
  outcome: "",
  cover_image: null,
};

const formatDate = (value) => {
  if (!value) return "No date set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatProjectStatus = (status) => {
  switch (status) {
    case "planning":
      return "Planning";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return status || "Unknown";
  }
};

const Projects = () => {
  const { clubId } = useParams();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadProjects = async () => {
    if (!clubId) return;

    setIsLoading(true);
    try {
      const response = await projectsApi.getProjects(clubId, {
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setProjects(response?.items || []);
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || "Failed to load projects.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [clubId, statusFilter]);

  const projectStats = useMemo(() => {
    const counts = projects.reduce(
      (accumulator, project) => {
        accumulator.total += 1;
        accumulator[project.status] = (accumulator[project.status] || 0) + 1;
        return accumulator;
      },
      { total: 0, planning: 0, in_progress: 0, completed: 0 },
    );

    return counts;
  }, [projects]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === "cover_image") {
      setForm((current) => ({ ...current, cover_image: files?.[0] || null }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!clubId) return;

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("status", form.status);
      payload.append("visibility", form.visibility);
      if (form.start_date) payload.append("start_date", form.start_date);
      if (form.end_date) payload.append("end_date", form.end_date);
      if (form.outcome) payload.append("outcome", form.outcome);
      if (form.cover_image) payload.append("cover_image", form.cover_image);

      await projectsApi.createProject(clubId, payload);
      toast.success("Project created successfully.");
      resetForm();
      await loadProjects();
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || "Failed to create project.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!clubId) return;
    const confirmed = window.confirm(
      "Delete this project? This cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await projectsApi.deleteProject(clubId, projectId);
      toast.success("Project deleted.");
      await loadProjects();
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || "Failed to delete project.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">
            Projects
          </h1>
          <p className="text-text-2">
            Track ongoing club initiatives and milestones from the backend.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadProjects} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => setShowForm((current) => !current)}>
            <Plus className="w-4 h-4 mr-2" />{" "}
            {showForm ? "Close Form" : "New Project"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-text-2 text-sm">Total</p>
            <p className="text-2xl font-bold text-text-1">
              {projectStats.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-text-2 text-sm">Planning</p>
            <p className="text-2xl font-bold text-text-1">
              {projectStats.planning}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-text-2 text-sm">In Progress</p>
            <p className="text-2xl font-bold text-text-1">
              {projectStats.in_progress}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-text-2 text-sm">Completed</p>
            <p className="text-2xl font-bold text-text-1">
              {projectStats.completed}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value || "all"}
            onClick={() => setStatusFilter(option.value)}
            className={`px-4 py-2 rounded-full border text-sm transition-colors ${statusFilter === option.value ? "border-primary bg-primary/10 text-primary" : "border-border-glow text-text-2 hover:text-text-1 hover:border-primary/50"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-2">
                <Input
                  name="title"
                  label="Project Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-2 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-md border border-border-glow bg-surface-2 px-4 py-3 text-text-1 outline-none focus:border-primary"
                  placeholder="Describe the project goals and scope"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-2 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-md border border-border-glow bg-surface-2 px-4 py-3 text-text-1 outline-none focus:border-primary"
                >
                  {statusOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-2 mb-2">
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={form.visibility}
                  onChange={handleChange}
                  className="w-full rounded-md border border-border-glow bg-surface-2 px-4 py-3 text-text-1 outline-none focus:border-primary"
                >
                  {visibilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Input
                  name="start_date"
                  label="Start Date"
                  type="date"
                  value={form.start_date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  name="end_date"
                  label="End Date"
                  type="date"
                  value={form.end_date}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  name="outcome"
                  label="Outcome"
                  value={form.outcome}
                  onChange={handleChange}
                  placeholder="What should success look like?"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-2 mb-2">
                  Cover Image
                </label>
                <div className="flex items-center gap-3 rounded-md border border-dashed border-border-glow bg-surface-2/40 px-4 py-3">
                  <ImageIcon className="w-4 h-4 text-text-2" />
                  <input
                    name="cover_image"
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="text-sm text-text-2"
                  />
                </div>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" isLoading={isSaving}>
                  Create Project
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-card" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col overflow-hidden">
              {project.cover_image_url ? (
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="h-40 w-full object-cover"
                />
              ) : null}
              <CardContent className="p-6 flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-3">
                  <StatusBadge status={formatProjectStatus(project.status)} />
                  <button
                    className="text-text-2 hover:text-text-1"
                    onClick={() => handleDelete(project.id)}
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-text-1 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-text-2 line-clamp-4">
                    {project.description || "No description provided."}
                  </p>
                </div>

                {project.outcome ? (
                  <div className="rounded-md bg-surface-2/50 border border-border-glow p-3 text-sm text-text-2">
                    <span className="font-medium text-text-1">Outcome:</span>{" "}
                    {project.outcome}
                  </div>
                ) : null}

                <div className="space-y-3 mt-auto border-t border-border-glow/50 pt-4 text-sm text-text-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Start{" "}
                      {formatDate(project.start_date)}
                    </span>
                    <span>
                      {project.visibility === "members_only"
                        ? "Members only"
                        : "Public"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>Created {formatDate(project.created_at)}</span>
                    <span>{project.likes_count || 0} likes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects yet"
          description="Create the first club project and it will appear here from the live backend."
          actionLabel="Create Project"
          onAction={() => setShowForm(true)}
        />
      )}
    </div>
  );
};

export default Projects;
