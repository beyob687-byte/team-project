import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Menu,
  User,
  LogOut,
  Settings,
  Sun,
  Moon,
  Shield,
  Building,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import useUiStore from "../../store/uiStore";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import NotificationBell from "./NotificationBell";

const TopNavBar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-30 w-full bg-surface/80 backdrop-blur-md border-b border-border-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo & Search */}
          <div className="flex items-center gap-6 flex-1">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-deep font-display font-bold text-xl group-hover:shadow-glow transition-all">
                U
              </div>
              <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
                Uni<span className="text-primary">Clubs</span>
              </span>
            </Link>

            <div className="hidden md:flex max-w-md w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-2" />
              <input
                type="text"
                placeholder="Search clubs, events..."
                className="w-full bg-deep border border-border-glow rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,170,255,0.2)] transition-all"
              />
            </div>
          </div>

          {/* Right: Nav items */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle — always visible */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-surface-2 transition-colors focus:outline-none text-text-2 hover:text-text-1"
              title={
                theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/discover"
                  className="text-sm font-medium text-text-2 hover:text-text-1 hidden sm:block"
                >
                  Discover
                </Link>

                <NotificationBell />

                {/* Profile Dropdown (simplified as a hover group for now) */}
                <div className="relative group cursor-pointer">
                  <div className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-2 transition-colors">
                    <Avatar
                      src={user?.avatar}
                      alt={user?.name}
                      size="sm"
                      className="ring-2 ring-primary/20"
                    />
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-glow rounded-card shadow-glow opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <div className="p-3 border-b border-border-glow">
                      <p className="text-sm font-medium truncate">
                        {user?.name || "Student"}
                      </p>
                      <p className="text-xs text-text-2 truncate">
                        {user?.email || "student@uni.edu"}
                      </p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-text-2 hover:text-text-1 hover:bg-surface-2 rounded-md transition-colors"
                      >
                        <User className="w-4 h-4" /> My Profile
                      </Link>

                      {user?.roles?.includes("University Admin") && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-text-2 hover:text-primary hover:bg-surface-2 rounded-md transition-colors"
                        >
                          <Shield className="w-4 h-4" /> Admin Portal
                        </Link>
                      )}

                      {user?.roles?.includes("Officer") && (
                        <Link
                          to="/clubs/1/manage"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-text-2 hover:text-primary hover:bg-surface-2 rounded-md transition-colors"
                        >
                          <Building className="w-4 h-4" /> Manage Club
                        </Link>
                      )}

                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-text-2 hover:text-text-1 hover:bg-surface-2 rounded-md transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-md transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-text-2 hover:text-text-1 transition-colors"
                >
                  Sign In
                </Link>
                <Button size="sm" onClick={() => navigate("/register")}>
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md hover:bg-surface-2 text-text-2">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-deep selection:bg-primary/30">
      <TopNavBar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Simple Footer */}
      <footer className="w-full border-t border-border-glow bg-surface py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center text-deep font-display font-bold text-xs">
              U
            </div>
            <span className="font-display font-semibold text-sm">UniClubs</span>
          </div>
          <p className="text-sm text-text-2">
            &copy; {new Date().getFullYear()} UniClubs Platform. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
