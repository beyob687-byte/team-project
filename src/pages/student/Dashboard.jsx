import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ClubCard from '../../components/shared/ClubCard';
import EventCard from '../../components/shared/EventCard';
import Avatar from '../../components/ui/Avatar';
import Skeleton from '../../components/ui/Skeleton';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Mock data for initial render
  const [data, setData] = useState({ myClubs: [], recommendations: [], upcomingEvents: [] });

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData({
        myClubs: [
          { id: 1, name: 'Computer Science Society', logo: null, role: 'Member' },
          { id: 2, name: 'Photography Club', logo: null, role: 'Officer' },
          { id: 3, name: 'Debate Team', logo: null, role: 'Member' },
        ],
        recommendations: [
          { id: 4, name: 'Robotics Team', description: 'Build and program robots for competitive events.', category: 'STEM', memberCount: 45, status: 'Active' },
          { id: 5, name: 'Design Co.', description: 'A community of UI/UX designers and graphic artists.', category: 'Arts', memberCount: 120, status: 'Active' },
        ],
        upcomingEvents: [
          { id: 101, title: 'Intro to React Workshop', date: new Date(Date.now() + 86400000).toISOString(), location: 'Building 4, Room 102', attendeeCount: 35, club: { name: 'Computer Science Society' } },
          { id: 102, title: 'Campus Photo Walk', date: new Date(Date.now() + 172800000).toISOString(), location: 'Main Quad', attendeeCount: 15, club: { name: 'Photography Club' } },
        ]
      });
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-10 pb-10">
      
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-surface to-surface-2 p-8 rounded-card border border-border-glow shadow-card">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1 mb-2">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Student'}</span>
          </h1>
          <p className="text-text-2">You have {data.upcomingEvents.length} events coming up this week.</p>
        </div>
        <Link to="/discover" className="btn-primary flex items-center gap-2 group">
          <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" /> 
          Discover Clubs
        </Link>
      </section>

      {/* My Clubs Strip */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-text-1 flex items-center gap-2">
            My Clubs
          </h2>
          <Link to="/profile" className="text-sm font-medium text-primary hover:text-primary-dim flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0 w-24">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-20 h-3" />
              </div>
            ))
          ) : data.myClubs.length > 0 ? (
            data.myClubs.map(club => (
              <Link key={club.id} to={`/clubs/${club.id}`} className="flex flex-col items-center gap-2 shrink-0 w-24 group snap-start">
                <div className="relative">
                  <Avatar src={club.logo} alt={club.name} size="xl" className="group-hover:ring-4 ring-primary/30 transition-all shadow-md group-hover:shadow-glow" />
                  {club.role === 'Officer' && (
                    <span className="absolute -bottom-1 -right-1 bg-secondary w-5 h-5 rounded-full border-2 border-deep flex items-center justify-center text-[10px] font-bold text-white shadow-glow" title="Officer">
                      ★
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-text-1 text-center line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {club.name}
                </span>
              </Link>
            ))
          ) : (
            <div className="w-full text-center py-6 text-text-2 bg-surface border border-border-glow border-dashed rounded-card">
              You haven't joined any clubs yet. <Link to="/discover" className="text-primary hover:underline">Find one today!</Link>
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* For You - Recommendations */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-text-1">For You</h2>
          </div>
          <p className="text-sm text-text-2 mb-4">AI-powered recommendations based on your major and interests.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-card" />)
            ) : (
              data.recommendations.map(club => (
                <ClubCard key={club.id} club={club} isRecommendation={true} />
              ))
            )}
          </div>
        </section>

        {/* Upcoming Events Widget */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold text-text-1 mb-6">Upcoming Events</h2>
          
          <div className="flex flex-col gap-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
            ) : data.upcomingEvents.length > 0 ? (
              data.upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="text-center py-8 text-text-2 bg-surface rounded-card border border-border-glow">
                No upcoming events.
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
