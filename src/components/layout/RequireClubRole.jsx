import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import Skeleton from "../ui/Skeleton";
import { clubsApi } from "../../api/clubs";
import useAuthStore from "../../store/authStore";

const CLUB_MANAGER_ROLES = [
  "president",
  "vice_president",
  "secretary",
  "event_coordinator",
];

const RequireClubRole = ({ allowedRoles = CLUB_MANAGER_ROLES, children }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [membership, setMembership] = useState(null);
  const [loadingMembership, setLoadingMembership] = useState(true);
  const { clubId } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, checkAuth]);

  useEffect(() => {
    let isMounted = true;

    const loadMembership = async () => {
      if (!isAuthenticated || !clubId) {
        return;
      }

      setLoadingMembership(true);
      try {
        const result = await clubsApi.getMyMembership(clubId);
        if (isMounted) {
          setMembership(result?.membership || result || null);
        }
      } catch (error) {
        if (isMounted) {
          setMembership(null);
        }
      } finally {
        if (isMounted) {
          setLoadingMembership(false);
        }
      }
    };

    loadMembership();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, clubId]);

  if (isLoading || loadingMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep">
        <div className="space-y-4 text-center">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <p className="text-text-2 text-sm">Checking club access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!membership || !allowedRoles.includes(membership.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default RequireClubRole;
