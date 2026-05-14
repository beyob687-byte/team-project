import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './components/layout/MainLayout';
import ManagementLayout from './components/layout/ManagementLayout';

// Shared
import Skeleton from './components/ui/Skeleton';
import RequireAuth from './components/layout/RequireAuth';
import RequireRole from './components/layout/RequireRole';

// Lazy loaded pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));

// Student Pages
const Dashboard = React.lazy(() => import('./pages/student/Dashboard'));
const Discover = React.lazy(() => import('./pages/student/Discover'));
const ClubProfile = React.lazy(() => import('./pages/student/ClubProfile'));
const EventDetail = React.lazy(() => import('./pages/student/EventDetail'));
const Profile = React.lazy(() => import('./pages/student/Profile'));

// Officer Pages
const ManageDashboard = React.lazy(() => import('./pages/officer/ManageDashboard'));
const ManageMembers = React.lazy(() => import('./pages/officer/Members'));
const ManageEvents = React.lazy(() => import('./pages/officer/Events'));
const ManagePosts = React.lazy(() => import('./pages/officer/Posts'));
const ManageProjects = React.lazy(() => import('./pages/officer/Projects'));
const ManageAnalytics = React.lazy(() => import('./pages/officer/Analytics'));
const ManageSettings = React.lazy(() => import('./pages/officer/Settings'));

// Admin Pages
const AdminOverview = React.lazy(() => import('./pages/admin/AdminOverview'));
const AdminClubs = React.lazy(() => import('./pages/admin/AllClubs'));
const AdminRegistrationReview = React.lazy(() => import('./pages/admin/ClubRegistrationReview'));
const AdminModeration = React.lazy(() => import('./pages/admin/Moderation'));
const AdminUsers = React.lazy(() => import('./pages/admin/Users'));
const AdminAnalytics = React.lazy(() => import('./pages/admin/AdminAnalytics'));


const PageLoader = () => (
  <div className="min-h-screen bg-deep flex items-center justify-center">
    <div className="w-full max-w-md p-8">
      <Skeleton className="h-8 w-3/4 mb-6 rounded-md" />
      <Skeleton className="h-32 w-full mb-4 rounded-card" />
      <Skeleton className="h-32 w-full rounded-card" />
    </div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public / Student Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} /> {/* Redirects to dashboard or discover based on auth */}
          <Route path="/discover" element={<Discover />} />
          <Route path="/clubs/:clubId" element={<ClubProfile />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          
          {/* Protected Student Routes */}
          <Route element={<RequireAuth />}>
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Club Officer Routes */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireRole role="Officer" />}>
            <Route path="/clubs/:clubId/manage" element={<ManagementLayout />}>
              <Route index element={<ManageDashboard />} />
              <Route path="members" element={<ManageMembers />} />
              <Route path="events" element={<ManageEvents />} />
              <Route path="posts" element={<ManagePosts />} />
              <Route path="projects" element={<ManageProjects />} />
              <Route path="analytics" element={<ManageAnalytics />} />
              <Route path="settings" element={<ManageSettings />} />
            </Route>
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireRole role="University Admin" />}>
            <Route path="/admin" element={<ManagementLayout isAdmin={true} />}>
              <Route index element={<AdminOverview />} />
              <Route path="clubs" element={<AdminClubs />} />
              <Route path="clubs/requests/:requestId" element={<AdminRegistrationReview />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>
        </Route>
        
        <Route path="*" element={
            <div className="min-h-screen bg-deep flex items-center justify-center text-text-1">
                <div className="text-center">
                    <h1 className="text-4xl font-display mb-4">404</h1>
                    <p className="text-text-2 mb-6">Page not found</p>
                    <a href="/" className="btn-primary">Return Home</a>
                </div>
            </div>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;
