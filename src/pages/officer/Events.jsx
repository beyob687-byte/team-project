import React, { useState } from 'react';
import { Plus, Search, Calendar as CalendarIcon, MapPin, Users, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import StatusBadge from '../../components/shared/StatusBadge';

const mockEvents = [
  { id: 1, title: 'Intro to React Workshop', date: '2024-06-15T14:00:00Z', location: 'Room 102', status: 'Published', attendees: 35, capacity: 50 },
  { id: 2, title: 'Spring Hackathon', date: '2024-07-20T09:00:00Z', location: 'Main Library', status: 'Draft', attendees: 0, capacity: 150 },
  { id: 3, title: 'Alumni Mixer', date: '2024-05-10T18:00:00Z', location: 'Student Center', status: 'Past', attendees: 80, capacity: 100 },
];

const Events = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">Events</h1>
          <p className="text-text-2">Manage your club's events and RSVPs.</p>
        </div>
        <Button className="shadow-glow"><Plus className="w-4 h-4 mr-2" /> Create Event</Button>
      </div>

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
          {mockEvents.map(event => {
            const date = new Date(event.date);
            return (
              <div key={event.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-2/20 transition-colors">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-lg bg-surface-2 border border-border-glow flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <span className="text-xs text-primary font-bold uppercase">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-xl font-display font-bold text-text-1 leading-none mt-0.5">{date.getDate()}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-1 mb-1">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-2">
                      <span className="flex items-center"><CalendarIcon className="w-3.5 h-3.5 mr-1" /> {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                      <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {event.location}</span>
                      <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> {event.attendees}/{event.capacity} RSVPs</span>
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
          })}
        </div>
      </Card>
    </div>
  );
};

export default Events;
