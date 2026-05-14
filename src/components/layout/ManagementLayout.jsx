import React from 'react';
import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  MessageSquare, 
  Briefcase, 
  BarChart3, 
  Settings,
  ShieldAlert,
  ListTodo,
  LogOut,
  ChevronLeft,
  Sun,
  Moon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import Avatar from '../ui/Avatar';

const SidebarItem = ({ to, icon: Icon, label, end = false }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,170,255,0.1)]' 
          : 'text-text-2 hover:bg-surface-2 hover:text-text-1'
        }
      `}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
};

const ManagementLayout = ({ isAdmin = false }) => {
  const { clubId } = useParams();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const officerLinks = [
    { to: `/clubs/${clubId}/manage`, icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: `/clubs/${clubId}/manage/members`, icon: Users, label: 'Members' },
    { to: `/clubs/${clubId}/manage/events`, icon: CalendarDays, label: 'Events' },
    { to: `/clubs/${clubId}/manage/posts`, icon: MessageSquare, label: 'Posts' },
    { to: `/clubs/${clubId}/manage/projects`, icon: Briefcase, label: 'Projects' },
    { to: `/clubs/${clubId}/manage/analytics`, icon: BarChart3, label: 'Analytics' },
    { to: `/clubs/${clubId}/manage/settings`, icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/admin/clubs', icon: Users, label: 'All Clubs' },
    { to: '/admin/moderation', icon: ShieldAlert, label: 'Moderation Queue' },
    { to: '/admin/users', icon: ListTodo, label: 'User Directory' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Platform Analytics' },
  ];

  const links = isAdmin ? adminLinks : officerLinks;

  return (
    <div className="flex h-screen bg-deep overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-surface border-r border-border-glow flex flex-col hidden md:flex">
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-border-glow">
          <button 
            onClick={() => navigate(isAdmin ? '/dashboard' : `/clubs/${clubId}`)}
            className="flex items-center gap-2 text-text-2 hover:text-text-1 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-display font-semibold truncate">
              {isAdmin ? 'Back to App' : 'Back to Club'}
            </span>
          </button>
        </div>

        {/* Club/Admin Info */}
        <div className="p-6 pb-2 border-b border-border-glow/50">
          <div className="flex items-center gap-3 mb-4">
            <Avatar size="md" className="ring-2 ring-primary/20 shadow-glow" />
            <div className="overflow-hidden">
              <h2 className="font-semibold text-text-1 truncate">
                {isAdmin ? 'University Admin' : 'Computer Science Club'}
              </h2>
              <p className="text-xs text-text-2 truncate">
                {isAdmin ? 'Superuser Access' : 'Management Portal'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-text-2 uppercase tracking-wider mb-3 ml-2">Menu</div>
          {links.map((link) => (
            <SidebarItem key={link.to} {...link} />
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border-glow bg-surface-2/30">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <Avatar src={user?.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-1 truncate">{user?.name || 'Officer'}</p>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={toggleTheme}
                className="p-1.5 text-text-2 hover:text-text-1 rounded-md hover:bg-surface-2 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button 
                onClick={handleLogout}
                className="p-1.5 text-text-2 hover:text-danger rounded-md hover:bg-danger/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-deep">
        {/* Mobile Header */}
        <header className="h-16 flex md:hidden items-center justify-between px-4 bg-surface border-b border-border-glow">
          <span className="font-display font-semibold">Management</span>
          <Avatar size="sm" />
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagementLayout;
