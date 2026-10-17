import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl mb-4 border border-indigo-200 dark:border-indigo-800">
        404
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
        Page Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved to another location.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
