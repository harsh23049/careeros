import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export function JobCard({ job }) {
  if (!job) return null;

  return (
    <Card hoverEffect className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Link to={`/jobs/${job.id || job._id}`} className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
            {job.jobTitle || job.title}
          </Link>
          {job.matchScore && <Badge variant="primary">Match {job.matchScore}%</Badge>}
        </div>
        <p className="text-xs text-slate-500">
          {job.company} &bull; {job.location || 'Remote'}
        </p>
      </div>
      <Link to={`/jobs/${job.id || job._id}`}>
        <Button variant="secondary" size="sm">
          Details
        </Button>
      </Link>
    </Card>
  );
}

export default JobCard;
