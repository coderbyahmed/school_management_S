import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FullPageLoader from './common/FullPageLoader';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
