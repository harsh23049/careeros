import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const SAMPLE_JOBS = [
  {
    id: 'job-101',
    title: 'Senior Frontend Engineer',
    company: 'Stripe',
    location: 'Remote, US',
    type: 'Full-time',
    matchScore: 94,
    dateAdded: '2 days ago',
  },
  {
    id: 'job-102',
    title: 'Full Stack Engineer (React & Node)',
    company: 'Linear',
    location: 'San Francisco, CA',
    type: 'Full-time',
    matchScore: 88,
    dateAdded: '3 days ago',
  },
  {
    id: 'job-103',
    title: 'Staff Software Engineer',
    company: 'Vercel',
    location: 'Remote',
    type: 'Full-time',
    matchScore: 76,
    dateAdded: '5 days ago',
  },
];

export function Jobs() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Listings</h2>
          <p className="text-sm text-slate-500">Manage and track jobs you want to apply for</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Import from Extension
          </Button>
          <Button variant="primary" size="sm">
            + Add New Job
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {SAMPLE_JOBS.map((job) => (
          <Card key={job.id} hoverEffect className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link to={`/jobs/${job.id}`} className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                  {job.title}
                </Link>
                <Badge variant="primary">AI Match {job.matchScore}%</Badge>
              </div>
              <p className="text-xs text-slate-500">
                {job.company} &bull; {job.location} &bull; {job.type}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{job.dateAdded}</span>
              <Link to={`/jobs/${job.id}`}>
                <Button variant="secondary" size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Jobs;
