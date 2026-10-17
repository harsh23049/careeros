import Card from '../ui/Card';

export function StatCard({ title, value, subtitle, icon }) {
  return (
    <Card hoverEffect>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
        {icon && <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">{icon}</div>}
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
        {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
      </div>
    </Card>
  );
}

export default StatCard;
