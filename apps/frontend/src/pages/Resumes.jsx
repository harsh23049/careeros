import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export function Resumes() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resumes</h2>
          <p className="text-sm text-slate-500">Store and customize resumes for AI matching and tailoring</p>
        </div>
        <Button variant="primary" size="sm">
          + Upload New Resume
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card hoverEffect className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Software_Engineer_2026.pdf</h4>
                  <Badge variant="primary">Default</Badge>
                </div>
                <p className="text-xs text-slate-500">Updated 5 days ago &bull; 142 KB</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm">Preview</Button>
            <Button variant="secondary" size="sm">Match to Job</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Resumes;
