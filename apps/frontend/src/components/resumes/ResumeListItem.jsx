import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export function ResumeListItem({ resume, onSelect }) {
  if (!resume) return null;

  return (
    <Card hoverEffect className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-white">{resume.title || resume.fileName}</span>
            {resume.isDefault && <Badge variant="primary">Default</Badge>}
          </div>
          <p className="text-xs text-slate-400">{resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : 'Active'}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => onSelect && onSelect(resume)}>
        Select
      </Button>
    </Card>
  );
}

export default ResumeListItem;
