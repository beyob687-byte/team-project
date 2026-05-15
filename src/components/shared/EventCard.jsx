import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Avatar from '../ui/Avatar';
import StatusBadge from './StatusBadge';

const EventCard = memo(function EventCard({ event }) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', minute: '2-digit' 
  });

  return (
    <Link to={`/events/${event.id}`} className="block h-full">
      <Card className="h-full flex flex-col hover:-translate-y-2 group cursor-pointer overflow-hidden border-border-glow">
        
        {/* Event Image Placeholder */}
        <div className="h-32 w-full bg-surface-2 relative overflow-hidden">
          {event.coverImage ? (
            <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface-2 to-primary/10 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-primary/30" />
            </div>
          )}
          <div className="absolute top-2 right-2">
             <StatusBadge status={event.status || 'Upcoming'} />
          </div>
          {/* Date Chip */}
          <div className="absolute top-2 left-2 bg-deep/80 backdrop-blur-md border border-border-glow rounded-md px-2 py-1 text-center min-w-[50px]">
            <span className="block text-xs text-primary font-bold uppercase leading-none mb-1">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
            <span className="block text-lg font-display font-bold leading-none">{eventDate.getDate()}</span>
          </div>
        </div>

        <CardContent className="flex-1 flex flex-col p-5">
          <div className="flex items-center gap-2 mb-3">
            <Avatar src={event.club?.logo} size="sm" />
            <span className="text-xs text-text-2 font-medium truncate">{event.club?.name}</span>
          </div>

          <h3 className="font-display font-bold text-lg text-text-1 group-hover:text-primary transition-colors line-clamp-2 mb-3">
            {event.title}
          </h3>
          
          <div className="space-y-2 mt-auto">
            <div className="flex items-center text-sm text-text-2">
              <Calendar className="w-4 h-4 mr-2 text-primary/70 shrink-0" />
              <span className="truncate">{formattedDate} • {formattedTime}</span>
            </div>
            
            <div className="flex items-center text-sm text-text-2">
              <MapPin className="w-4 h-4 mr-2 text-primary/70 shrink-0" />
              <span className="truncate">{event.location || 'Online'}</span>
            </div>

            <div className="flex items-center text-sm text-text-2">
              <Users className="w-4 h-4 mr-2 text-primary/70 shrink-0" />
              <span className="truncate">
                {event.attendeeCount || 0} attending
                {event.capacity && ` • ${event.capacity - (event.attendeeCount || 0)} spots left`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

export default EventCard;
