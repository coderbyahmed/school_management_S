import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FullPageLoader from './common/FullPageLoader';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, role, loading, DASHBOARD_ROUTES } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirectPath = DASHBOARD_ROUTES[role] || '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
