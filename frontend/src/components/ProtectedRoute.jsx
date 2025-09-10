import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    const fallbackLoginRoutes = {
      admin: '/admin/login',
      user: '/login'
    };


    const roleToRedirect = allowedRoles[0];
    const loginRoute = fallbackLoginRoutes[roleToRedirect] || '/login';

    return <Navigate to={loginRoute} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
