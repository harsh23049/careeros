import { useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/jobs': 'Job Listings & Saved Jobs',
  '/applications': 'Applications Tracker',
  '/resumes': 'Resume Management',
  '/ai-tools': 'AI Career Tools',
  '/settings': 'Account Settings',
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export function Header({ onMenuClick }) {
  const location = useLocation();
  const { user } = useAuth();

  const getTitle = () => {
    if (location.pathname.startsWith('/jobs/')) {
      return 'Job Details';
    }
    return routeTitles[location.pathname] || 'CareerOS';
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            {getTitle()}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          AI Engine Ready
        </div>
        {user?.avatar?.url ? (
          <img
            src={user.avatar.url}
            alt={user.fullName || 'User'}
            className="w-8 h-8 rounded-full object-cover border border-indigo-200 dark:border-indigo-700"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-center text-xs border border-indigo-200 dark:border-indigo-700">
            {getInitials(user?.fullName || user?.username || 'U')}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
