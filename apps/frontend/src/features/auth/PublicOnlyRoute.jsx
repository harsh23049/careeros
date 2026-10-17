import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 animate-pulse mb-4">
          C
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Loading...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    const origin = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={origin} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
