import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Share2, CalendarPlus, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Skeleton from '../../components/ui/Skeleton';
import StatusBadge from '../../components/shared/StatusBadge';
import { toast } from '../../components/ui/Toast';

const EventDetail = () => {
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [isRSVPd, setIsRSVPd] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate API fetch
    const timer = setTimeout(() => {
      setEvent({
        id: eventId,
        title: 'Intro to React Workshop',
        description: '<p>Join us for a hands-on workshop where we will build a modern web application from scratch using React, Vite, and Tailwind CSS. No prior React experience is required, but basic JavaScript knowledge is recommended.</p><h3>What to bring:</h3><ul><li>Your laptop</li><li>Charger</li><li>A thirst for knowledge</li></ul><p>Pizza and drinks will be provided!</p>',
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        location: 'Building 4, Room 102',
        capacity: 50,
        attendeeCount: 35,
        status: 'Upcoming',
        coverImage: null,
        club: {
          id: 1,
          name: 'Computer Science Society',
          logo: null
        }
      });
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [eventId]);

  const handleRSVP = async () => {
    setRsvpLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    setIsRSVPd(true);
    setEvent(prev => ({ ...prev, attendeeCount: prev.attendeeCount + 1 }));
    setRsvpLoading(false);
    toast.success('Successfully RSVP\'d to event!');
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

  const eventDate = new Date(event.date);
  const isFull = event.capacity && event.attendeeCount >= event.capacity;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link to="/dashboard" className="inline-flex items-center text-sm text-text-2 hover:text-primary transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back
      </Link>

      {/* Cover Image */}
      <div className="w-full h-64 md:h-80 bg-surface-2 rounded-xl border border-border-glow overflow-hidden relative mb-8">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
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
            <Link to={`/clubs/${event.club.id}`} className="inline-flex items-center gap-3 p-2 pr-4 rounded-full bg-surface-2/50 border border-border-glow hover:border-primary/50 transition-colors">
              <Avatar src={event.club.logo} size="sm" />
              <span className="text-sm font-medium text-text-1">Hosted by <span className="text-primary">{event.club.name}</span></span>
            </Link>
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
                  <p className="font-medium text-text-1">{event.attendeeCount} / {event.capacity || '∞'} attending</p>
                  {event.capacity && (
                    <div className="w-full h-1.5 bg-deep rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isFull ? 'bg-danger' : 'bg-primary'}`} 
                        style={{ width: `${Math.min((event.attendeeCount / event.capacity) * 100, 100)}%` }}
                      />
                    </div>
                  )}
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
                  disabled={isFull}
                  isLoading={rsvpLoading}
                >
                  {isFull ? 'Waitlist Full' : 'RSVP Now'}
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
