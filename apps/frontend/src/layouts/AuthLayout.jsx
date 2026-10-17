import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/login" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            C
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
            Career<span className="text-indigo-600 dark:text-indigo-400">OS</span>
          </span>
        </Link>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          AI-Powered Job Application Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl sm:px-10">
          <Outlet />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} CareerOS. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
