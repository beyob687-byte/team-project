import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import StatusBadge from "../../components/shared/StatusBadge";
import { clubManagementApi } from "../../api/clubManagement";

const Events = () => {
  const { clubId } = useParams();
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_datetime: "",
    end_datetime: "",
    event_type: "in_person",
    visibility: "public",
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await clubManagementApi.getEvents(clubId, {
        page: 1,
        limit: 100,
      });
      setEvents(data.items || []);
    } catch (error) {
      console.error("Failed to load events", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [clubId]);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return events;
    return events.filter((event) => {
      return [event.title, event.location, event.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [events, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await clubManagementApi.createEvent(clubId, {
        ...form,
        start_datetime: new Date(form.start_datetime).toISOString(),
        end_datetime: new Date(form.end_datetime).toISOString(),
        rsvp_required: false,
        waitlist_enabled: false,
      });
      setForm({
        title: "",
        description: "",
        location: "",
        start_datetime: "",
        end_datetime: "",
        event_type: "in_person",
        visibility: "public",
      });
      setShowForm(false);
      await loadEvents();
    } catch (error) {
      console.error("Failed to create event", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">
            Events
          </h1>
          <p className="text-text-2">Manage your club's events and RSVPs.</p>
        </div>
        <Button
          className="shadow-glow"
          onClick={() => setShowForm((current) => !current)}
        >
          <Plus className="w-4 h-4 mr-2" /> Create Event
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleSubmit}
            >
              <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <Input
                label="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <Input
                label="Start"
                type="datetime-local"
                value={form.start_datetime}
                onChange={(e) =>
                  setForm({ ...form, start_datetime: e.target.value })
                }
                required
              />
              <Input
                label="End"
                type="datetime-local"
                value={form.end_datetime}
                onChange={(e) =>
                  setForm({ ...form, end_datetime: e.target.value })
                }
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
                <Button type="submit" isLoading={saving}>
                  Publish Event
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

      <Card>
        <div className="p-4 border-b border-border-glow flex flex-col sm:flex-row items-center gap-4 bg-surface-2/30">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-2" />
            <Input
              placeholder="Search events..."
              className="pl-9 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y divide-border-glow/50">
          {loading ? (
            <div className="p-6 text-text-2">Loading events...</div>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const date = new Date(
                event.start_datetime || event.date || event.created_at,
              );
              return (
                <div
                  key={event.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-2/20 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-lg bg-surface-2 border border-border-glow flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <span className="text-xs text-primary font-bold uppercase">
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-xl font-display font-bold text-text-1 leading-none mt-0.5">
                        {date.getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-1 mb-1">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-text-2">
                        <span className="flex items-center">
                          <CalendarIcon className="w-3.5 h-3.5 mr-1" />{" "}
                          {date.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1" />{" "}
                          {event.location || "No location set"}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3.5 h-3.5 mr-1" />{" "}
                          {event.attendees_count || 0}/{event.capacity || "∞"}{" "}
                          RSVPs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:w-48 justify-end shrink-0">
                    <StatusBadge status={event.status} />
                    <button className="p-2 text-text-2 hover:text-text-1 hover:bg-surface-2 rounded-md transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-text-2">No events found.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Events;
