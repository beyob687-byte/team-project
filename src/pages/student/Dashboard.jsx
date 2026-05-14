import React from 'react';
import { CLUBS, USERS } from '../../utils/mockData';
import useAuthStore from '../../store/authStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Calendar, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const myClubs = [CLUBS.tech];
  const recommendations = [CLUBS.cultural];

  return (
    <div className="space-y-8 p-6">
      <header>
        <h1 className="text-3xl font-display font-bold text-text-1">Welcome back, {user?.first_name}!</h1>
        <p className="text-text-2">Here is what is happening in your clubs today.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> My Clubs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myClubs.map(club => (
                <Card key={club.id} className="hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <img src={club.logo} alt={club.name} className="w-12 h-12 rounded-lg" />
                    <div>
                      <h3 className="font-bold">{club.name}</h3>
                      <p className="text-xs text-text-2">{club.memberCount} members</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Upcoming Events
            </h2>
            <div className="space-y-4">
              {myClubs[0].events.map(event => (
                <div key={event.id} className="bg-surface p-4 rounded-xl border border-border-glow flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{event.title}</h4>
                    <p className="text-sm text-text-2">{event.date} • {event.location}</p>
                  </div>
                  <Badge variant="primary">RSVP'd</Badge>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Recommended for You
            </h3>
            <p className="text-sm text-text-2 mb-4">Based on your interest in {user.interests[0]}.</p>
            {recommendations.map(club => (
              <div key={club.id} className="flex items-center gap-3 p-2 hover:bg-surface rounded-lg transition-colors">
                <img src={club.logo} className="w-8 h-8 rounded" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{club.name}</p>
                </div>
                <button className="text-xs font-bold text-primary">View</button>
              </div>
            ))}
          </Card>

          <Card>
            <h3 className="font-bold mb-4">Your Achievements</h3>
            <div className="flex flex-wrap gap-2">
              {user?.badges?.map(badge => (
                <div key={badge} className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center border border-border-glow" title={badge}>
                  🏅
                </div>
              )) || <p className="text-sm text-text-2 italic">No achievements yet.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;