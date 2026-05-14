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

// Mock club database – keyed by string ID
const MOCK_CLUBS = {
  '1': {
    name: 'Computer Science Society', category: 'STEM', status: 'Active', memberCount: 250,
    foundingDate: '2015-09-01', gradientFrom: 'from-blue-500/30', gradientTo: 'to-cyan-400/20',
    description: 'The largest tech community on campus. Weekly workshops, hackathons, and networking with industry professionals.',
    longDescription: '<p>Welcome to CSS! We believe in learning by doing. Projects range from simple web apps to complex ML models.</p>',
    socials: { website: 'https://css.uni.edu', instagram: '@uni_css', github: 'uni-css' },
    events: [
      { id: 101, title: 'Intro to React Workshop', date: new Date(Date.now() + 86400000).toISOString(), location: 'Building 4, Room 102', attendeeCount: 35 },
      { id: 102, title: 'Spring Hackathon', date: new Date(Date.now() + 604800000).toISOString(), location: 'Main Library', attendeeCount: 150 },
    ],
    members: [
      { id: 1, name: 'Alice Smith', role: 'President', avatar: null },
      { id: 2, name: 'Bob Jones', role: 'VP', avatar: null },
    ],
    projects: [{ id: 1, title: 'Campus Map App', status: 'Active', description: 'Building a new interactive campus map.' }]
  },
  '2': {
    name: 'Photography Club', category: 'Arts', status: 'Active', memberCount: 85,
    foundingDate: '2018-02-14', gradientFrom: 'from-pink-500/30', gradientTo: 'to-orange-400/20',
    description: 'Capture moments and learn the art of visual storytelling through photowalks and darkroom sessions.',
    longDescription: '<p>Join us for weekly photowalks, darkroom sessions, and exhibition opportunities at the end of each semester.</p>',
    socials: { website: 'https://photo.uni.edu', instagram: '@uni_photo', github: null },
    events: [
      { id: 201, title: 'Golden Hour Photowalk', date: new Date(Date.now() + 172800000).toISOString(), location: 'Main Quad', attendeeCount: 12 },
    ],
    members: [{ id: 1, name: 'Sara Lee', role: 'President', avatar: null }],
    projects: [{ id: 1, title: 'Annual Photo Exhibition', status: 'Active', description: 'End-of-year gallery showcase.' }]
  },
  '3': {
    name: 'Debate Team', category: 'Professional', status: 'Invite Only', memberCount: 40,
    foundingDate: '2010-01-10', gradientFrom: 'from-yellow-500/30', gradientTo: 'to-amber-400/20',
    description: 'Hone your public speaking and critical thinking skills. Compete in regional and national tournaments.',
    longDescription: '<p>We compete in British Parliamentary and World Schools formats. Open practice sessions every Thursday.</p>',
    socials: { website: null, instagram: '@uni_debate', github: null },
    events: [
      { id: 301, title: 'Open Practice Session', date: new Date(Date.now() + 259200000).toISOString(), location: 'Humanities Building, Room 3', attendeeCount: 20 },
    ],
    members: [{ id: 1, name: 'Marcus T.', role: 'President', avatar: null }],
    projects: [{ id: 1, title: 'Regional Tournament Prep', status: 'Active', description: 'Preparing for the spring regional.' }]
  },
  '4': {
    name: 'Robotics Team', category: 'STEM', status: 'Active', memberCount: 45,
    foundingDate: '2017-09-01', gradientFrom: 'from-green-500/30', gradientTo: 'to-emerald-400/20',
    description: 'Build and program robots for national competitive events. All engineering levels welcome.',
    longDescription: '<p>We compete in the FIRST Robotics Competition and VEX Robotics. Meetings every Tuesday and Friday.</p>',
    socials: { website: null, instagram: '@uni_robotics', github: 'uni-robotics' },
    events: [
      { id: 401, title: 'Robot Build Day', date: new Date(Date.now() + 345600000).toISOString(), location: 'Engineering Lab', attendeeCount: 30 },
    ],
    members: [{ id: 1, name: 'James K.', role: 'Captain', avatar: null }],
    projects: [{ id: 1, title: 'FRC Season Bot', status: 'Active', description: 'Current competition robot build.' }]
  },
  '5': {
    name: 'Design Co.', category: 'Arts', status: 'Active', memberCount: 120,
    foundingDate: '2019-03-15', gradientFrom: 'from-purple-500/30', gradientTo: 'to-violet-400/20',
    description: 'A vibrant community of UI/UX designers and graphic artists. Portfolio reviews and industry talks.',
    longDescription: '<p>Weekly design critiques, Figma workshops, and guest talks from senior designers at top companies.</p>',
    socials: { website: 'https://designco.uni.edu', instagram: '@uni_design', github: null },
    events: [
      { id: 501, title: 'Portfolio Review Night', date: new Date(Date.now() + 432000000).toISOString(), location: 'Arts Centre', attendeeCount: 50 },
    ],
    members: [{ id: 1, name: 'Nadia M.', role: 'Lead', avatar: null }],
    projects: [{ id: 1, title: 'University App Redesign', status: 'Active', description: 'Redesigning the student portal.' }]
  },
  '6': {
    name: 'Tennis Club', category: 'Sports', status: 'Active', memberCount: 60,
    foundingDate: '2012-06-01', gradientFrom: 'from-lime-500/30', gradientTo: 'to-green-400/20',
    description: 'Weekly matches, training sessions, and inter-university tournaments for all skill levels.',
    longDescription: '<p>Courts are booked every Monday and Wednesday evening. Beginners coaching available on Saturdays.</p>',
    socials: { website: null, instagram: '@uni_tennis', github: null },
    events: [
      { id: 601, title: 'Inter-Uni Tournament', date: new Date(Date.now() + 1209600000).toISOString(), location: 'Sports Complex', attendeeCount: 40 },
    ],
    members: [{ id: 1, name: 'Lena B.', role: 'Captain', avatar: null }],
    projects: [{ id: 1, title: 'Summer League', status: 'Planning', description: 'Organising the summer inter-club league.' }]
  },
};

const ClubProfile = () => {
  const { clubId } = useParams();
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [joinStatus, setJoinStatus] = useState(null); // null | 'pending' | 'sent'

  useEffect(() => {
    setLoading(true);
    setJoinStatus(null);
    const timer = setTimeout(() => {
      // Use string ID to look up — handles both numeric and string IDs from routes
      const found = MOCK_CLUBS[String(clubId)] || MOCK_CLUBS['1'];
      setClub({ ...found, id: clubId });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [clubId]);

  const handleJoin = () => {
    setJoinStatus('pending');
    setTimeout(() => setJoinStatus('sent'), 1000);
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
    { id: 'events', label: `Events (${club.events.length})` },
    { id: 'projects', label: `Projects (${club.projects.length})` },
    { id: 'members', label: `Members (${club.memberCount})` },
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
            <Avatar src={club.logo} alt={club.name} className="w-32 h-32 md:w-40 md:h-40 ring-4 ring-surface shadow-glow" />
            
            <div className="flex-1 pb-2">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-text-1 mb-2">{club.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-text-2">
                <Badge variant="outline">{club.category}</Badge>
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {club.memberCount} Members</div>
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Est. {new Date(club.foundingDate).getFullYear()}</div>
              </div>
            </div>

            <div className="flex gap-3 pb-2 w-full md:w-auto">
              {joinStatus === 'sent' ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-btn bg-success/10 border border-success/30 text-success font-semibold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Request Sent!
                </div>
              ) : (
                <Button
                  className="w-full md:w-auto shadow-glow"
                  isLoading={joinStatus === 'pending'}
                  onClick={handleJoin}
                  disabled={club.status === 'Invite Only'}
                >
                  {club.status === 'Invite Only' ? 'Invite Only' : 'Request to Join'}
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
                <p className="text-text-2 leading-relaxed">{club.description}</p>
              </div>
              <div className="prose prose-invert max-w-none text-text-2" dangerouslySetInnerHTML={{ __html: club.longDescription }} />
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              {club.events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {club.events.map(event => (
                    <EventCard key={event.id} event={{...event, club: { name: club.name, logo: club.logo }}} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No upcoming events" description="This club hasn't scheduled any events yet." icon={Calendar} />
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              {club.projects.length > 0 ? (
                club.projects.map(project => (
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
            <div className="bg-surface rounded-card border border-border-glow overflow-hidden">
              <div className="px-6 py-4 border-b border-border-glow flex justify-between items-center bg-surface-2/30">
                <h3 className="font-display font-bold text-text-1">Public Roster</h3>
              </div>
              <div className="divide-y divide-border-glow/50">
                {club.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={member.avatar} alt={member.name} />
                      <span className="font-medium text-text-1">{member.name}</span>
                    </div>
                    <Badge variant={member.role === 'Member' ? 'outline' : 'primary'}>{member.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface rounded-card border border-border-glow p-6 space-y-6">
            <h3 className="font-display font-bold text-text-1">Connect</h3>
            
            <div className="space-y-4">
              {club.socials.website && (
                <a href={club.socials.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-text-2 hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-primary/10">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="flex-1 truncate">Website</span>
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </a>
              )}
              {club.socials.instagram && (
                <a href={`https://instagram.com/${club.socials.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-text-2 hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-primary/10">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span className="flex-1 truncate">{club.socials.instagram}</span>
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </a>
              )}
              {club.socials.github && (
                <a href={`https://github.com/${club.socials.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-text-2 hover:text-primary transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-primary/10">
                    <Github className="w-5 h-5" />
                  </div>
                  <span className="flex-1 truncate">github.com/{club.socials.github}</span>
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
