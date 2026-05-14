import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Share2, CalendarPlus, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Skeleton from '../../components/ui/Skeleton';
import StatusBadge from '../../components/shared/StatusBadge';
import { toast } from '../../components/ui/Toast';
import { eventsApi } from '../../api/events';

const EventDetail = () => {
  const { clubId, eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [isRSVPd, setIsRSVPd] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [myRsvp, setMyRsvp] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      try {
        const data = await eventsApi.getEvent(clubId, eventId);
        setEvent(data.event);
        setMyRsvp(data.myRsvp);
        setIsRSVPd(!!data.myRsvp && data.myRsvp.status !== 'cancelled');
      } catch (err) {
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [clubId, eventId]);

  const handleRSVP = async () => {
    setRsvpLoading(true);
    try {
      const data = await eventsApi.rsvpEvent(clubId, eventId);
      setMyRsvp(data.rsvp);
      setIsRSVPd(true);
      toast.success('Successfully RSVP\'d to event!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.info('Event link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="w-full h-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="w-3/4 h-10 mb-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-2/3 h-4" />
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.start_datetime);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link to={`/clubs/${clubId}`} className="inline-flex items-center text-sm text-text-2 hover:text-primary transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back
      </Link>

      {/* Cover Image */}
      <div className="w-full h-64 md:h-80 bg-surface-2 rounded-xl border border-border-glow overflow-hidden relative mb-8">
        {event.cover_image_url ? (
          <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Calendar className="w-20 h-20 text-primary/20" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <StatusBadge status={event.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-1 mb-4">{event.title}</h1>
          </div>

          <div className="prose prose-invert max-w-none text-text-2">
            <div dangerouslySetInnerHTML={{ __html: event.description }} />
          </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-surface border border-border-glow rounded-xl p-6 shadow-card space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text-1">{eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <p className="text-sm text-text-2">{eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text-1">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text-1">Event capacity: {event.capacity || 'Unlimited'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-glow space-y-3">
              {isRSVPd ? (
                <div className="w-full py-3 px-4 rounded-lg bg-success/10 border border-success/30 text-success text-center font-medium flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  You're going!
                </div>
              ) : (
                <Button 
                  className="w-full shadow-glow" 
                  onClick={handleRSVP} 
                  isLoading={rsvpLoading}
                >
                  RSVP Now
                </Button>
              )}
              
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 px-0" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button variant="outline" className="flex-1 px-0">
                  <CalendarPlus className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default EventDetail;
