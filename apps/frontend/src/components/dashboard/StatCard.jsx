import { Link } from 'react-router-dom';
import Card from '../ui/Card';

export function StatCard({ title, value, subtitle, icon, to, isLoading = false }) {
  const content = (
    <Card hoverEffect className={to ? 'cursor-pointer' : ''}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        {isLoading ? (
          <div className="h-9 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        ) : (
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </span>
        )}
        {isLoading ? (
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        ) : (
          subtitle && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </span>
          )
        )}
      </div>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="block group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}

export default StatCard;
