import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Calendar, Clock, MapPin, ExternalLink, Globe, Instagram, Github, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Skeleton from '../../components/ui/Skeleton';
import EventCard from '../../components/shared/EventCard';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/shared/EmptyState';
import { clubsApi } from '../../api/clubs';

const ClubProfile = () => {
  const { clubId } = useParams();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState(null);
  const [myMembership, setMyMembership] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [joinStatus, setJoinStatus] = useState(null); // null | 'pending' | 'sent'

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [clubData, membership] = await Promise.all([
          clubsApi.getClub(clubId),
          clubsApi.getMyMembership(clubId)
        ]);
        setClub(clubData);
        setMyMembership(membership);
      } catch (err) {
        console.error("Error loading club profile", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [clubId]);

  const handleJoin = async () => {
    setJoinStatus('pending');
    try {
      const result = await clubsApi.joinClub(clubId);
      setJoinStatus(result.joined ? 'active' : 'sent');
    } catch (err) {
      setJoinStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-full h-64 rounded-xl" />
        <div className="flex items-end gap-4 -mt-16 px-8 relative z-10">
          <Skeleton className="w-32 h-32 rounded-full border-4 border-deep" />
          <div className="flex-1 pb-4">
            <Skeleton className="w-1/3 h-8 mb-2" />
            <Skeleton className="w-1/4 h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!club) return <EmptyState title="Club not found" description="The club you are looking for does not exist." />;

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'events', label: `Events (${club.upcoming_events?.length || 0})` },
    { id: 'projects', label: `Projects (${club.public_projects?.length || 0})` },
    { id: 'members', label: `Members (${club.member_count})` },
  ];

  return (
    <div className="space-y-8">
      {/* Cover & Header */}
      <div className="relative rounded-xl overflow-hidden bg-surface border border-border-glow shadow-card">
        <div className="h-48 md:h-64 w-full bg-gradient-to-r from-primary/30 to-secondary/30 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <StatusBadge status={club.status} />
          </div>
        </div>
        
        <div className="px-6 md:px-10 pb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20 relative z-10">
            <Avatar src={club.logo_url} alt={club.name} className="w-32 h-32 md:w-40 md:h-40 ring-4 ring-surface shadow-glow" />
            
            <div className="flex-1 pb-2">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-text-1 mb-2">{club.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-text-2">
                <Badge variant="outline">{club.category}</Badge>
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {club.member_count} Members</div>
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Est. {new Date(club.created_at).getFullYear()}</div>
              </div>
            </div>

            <div className="flex gap-3 pb-2 w-full md:w-auto">
              {joinStatus === 'sent' ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-btn bg-success/10 border border-success/30 text-success font-semibold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Request Sent!
                </div>
              ) : myMembership ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-btn bg-primary/10 border border-primary/30 text-primary font-semibold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {myMembership.role.replace('_', ' ')}
                </div>
              ) : (
                <Button
                  className="w-full md:w-auto shadow-glow"
                  isLoading={joinStatus === 'pending'}
                  onClick={handleJoin}
                  disabled={club.membership_policy === 'invite_only'}
                >
                  {club.membership_policy === 'invite_only' ? 'Invite Only' : 'Request to Join'}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-t border-border-glow px-6 md:px-10 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-2 hover:text-text-1 hover:border-border-glow'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'about' && (
            <div className="bg-surface rounded-card border border-border-glow p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-display font-bold text-text-1 mb-3">About Us</h3>
                <p className="text-text-2 leading-relaxed">{club.mission_statement}</p>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              {club.upcoming_events?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {club.upcoming_events.map(event => (
                    <EventCard key={event.id} event={{...event, date: event.start_datetime, club: { name: club.name, logo: club.logo_url }}} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No upcoming events" description="This club hasn't scheduled any events yet." icon={Calendar} />
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              {club.public_projects?.length > 0 ? (
                club.public_projects.map(project => (
                  <div key={project.id} className="bg-surface rounded-card border border-border-glow p-6 flex justify-between items-start hover:border-primary/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-text-1 mb-1">{project.title}</h4>
                      <p className="text-sm text-text-2">{project.description}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                ))
              ) : (
                <EmptyState title="No projects" description="This club doesn't have any active projects." />
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <EmptyState title="Member Roster" description="Roster visibility depends on your membership status and club privacy settings." icon={Users} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface rounded-card border border-border-glow p-6 space-y-6">
            <h3 className="font-display font-bold text-text-1">Connect</h3>
            
            <div className="space-y-4">
              {club.social_links?.website && (
                <a href={club.social_links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-text-2 hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-primary/10">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="flex-1 truncate">Website</span>
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </a>
              )}
              {club.social_links?.instagram && (
                <a href={`https://instagram.com/${club.social_links.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-text-2 hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-primary/10">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span className="flex-1 truncate">{club.social_links.instagram}</span>
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </a>
              )}
              {club.social_links?.github && (
                <a href={`https://github.com/${club.social_links.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-text-2 hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-primary/10">
                    <Github className="w-5 h-5" />
                  </div>
                  <span className="flex-1 truncate">github.com/{club.social_links.github}</span>
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubProfile;
