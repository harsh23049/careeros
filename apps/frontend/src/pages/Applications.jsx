import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const PIPELINE_COLUMNS = [
  { id: 'saved', title: 'Saved (2)', color: 'border-slate-200' },
  { id: 'applied', title: 'Applied (3)', color: 'border-sky-300' },
  { id: 'interview', title: 'Interview (1)', color: 'border-amber-300' },
  { id: 'offer', title: 'Offer (1)', color: 'border-emerald-300' },
];

export function Applications() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Application Pipeline</h2>
          <p className="text-sm text-slate-500">Track and advance your job applications across stages</p>
        </div>
        <Button variant="primary" size="sm">
          + New Application
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PIPELINE_COLUMNS.map((col) => (
          <div key={col.id} className="bg-slate-100/70 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {col.title}
              </span>
            </div>

            <Card hoverEffect className="space-y-2 bg-white dark:bg-slate-900">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Frontend Dev</span>
                <Badge variant="neutral">Remote</Badge>
              </div>
              <p className="text-xs text-slate-500">Acme Corp</p>
              <div className="text-[11px] text-slate-400 pt-1 flex justify-between">
                <span>Updated Oct 16</span>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Applications;
