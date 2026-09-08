import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FullPageLoader from './common/FullPageLoader/FullPageLoader';

const LOGIN_ROUTES = {
  admin: '/admin/login',
  teacher: '/teacher/login',
  student: '/student/login',
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, role, loading, DASHBOARD_ROUTES } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const adminToken = params.get('adminAccessToken');
    const adminRefreshToken = params.get('adminRefreshToken');
    const adminUser = params.get('adminUser');
    const adminRole = params.get('adminRole');

    if (adminToken && adminRefreshToken && adminUser && adminRole) {
      try {
        const parsedUser = JSON.parse(adminUser);
        sessionStorage.setItem('accessToken', adminToken);
        sessionStorage.setItem('refreshToken', adminRefreshToken);
        sessionStorage.setItem('user', JSON.stringify(parsedUser));
        sessionStorage.setItem('role', adminRole);
        sessionStorage.setItem('isAdminAccess', 'true');

        const cleanUrl = location.pathname;
        window.history.replaceState({}, '', cleanUrl);

        window.location.reload();
      } catch {
        // ignore parse errors
      }
    }
  }, [location]);

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    const path = location.pathname;
    if (path.startsWith('/admin')) return <Navigate to={LOGIN_ROUTES.admin} replace />;
    if (path.startsWith('/teacher')) return <Navigate to={LOGIN_ROUTES.teacher} replace />;
    if (path.startsWith('/student')) return <Navigate to={LOGIN_ROUTES.student} replace />;
    return <Navigate to={LOGIN_ROUTES.admin} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirectPath = LOGIN_ROUTES[role] || DASHBOARD_ROUTES[role] || '/admin/login';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
