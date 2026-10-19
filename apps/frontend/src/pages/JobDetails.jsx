import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import jobService from '../services/jobService';
import { useAuth } from '../features/auth';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import AssistApplyModal from '../components/jobs/AssistApplyModal';

function formatJobDate(dateString) {
  if (!dateString) return 'Recently';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [isAssistApplyOpen, setIsAssistApplyOpen] = useState(false);

  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['job', id, user?._id],
    queryFn: () => jobService.getJobById(id),
    enabled: Boolean(id) && Boolean(user?._id),
  });

  const job = responseData?.data || responseData;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <Card className="p-6 space-y-3">
          <div className="h-7 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </Card>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/jobs" className="hover:text-indigo-600 transition-colors">Jobs</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">Job Details</span>
        </div>
        <div role="alert" className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
            {error?.response?.data?.message || 'Job not found or failed to load.'}
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
            <Link to="/jobs">
              <Button variant="secondary" size="sm">
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/jobs" className="hover:text-indigo-600 transition-colors">Jobs</Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-xs">{job.jobTitle}</span>
      </div>

      {/* Main Job Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{job.jobTitle}</h2>
            {job.workMode && <Badge variant="info">{job.workMode}</Badge>}
            {job.employmentType && <Badge variant="neutral">{job.employmentType}</Badge>}
          </div>
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-800 dark:text-slate-200">{job.company}</span>
            {job.location && <> &bull; {job.location}</>}
            <span> &bull; Added {formatJobDate(job.createdAt)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAssistApplyOpen(true)}
            className="flex items-center gap-1.5 shadow-xs font-semibold"
            title="Launch Assisted Apply with CareerOS Chrome Extension"
          >
            <span>⚡ Assist Apply</span>
          </Button>
          {job.jobUrl && (
            <a href={job.jobUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <span>View Posting</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Button>
            </a>
          )}
          <Link to="/ai-tools">
            <Button variant="secondary" size="sm">
              Analyze with AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          {job.description ? (
            <div>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mt-2">
                {job.description}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No detailed description provided for this job.
            </div>
          )}

          {Array.isArray(job.requirements) && job.requirements.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2">Requirements</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2">Responsibilities</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {job.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Sidebar Info Card */}
        <div className="space-y-4">
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Company</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{job.company}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Location</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{job.location || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Captured On</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{formatJobDate(job.createdAt)}</span>
              </div>
              {job.jobUrl && (
                <div className="pt-2">
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1"
                  >
                    <span>External Posting Link</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              )}
            </div>
          </Card>

          {Array.isArray(job.skills) && job.skills.length > 0 && (
            <Card className="space-y-3">
              <CardHeader>
                <CardTitle>Identified Skills</CardTitle>
              </CardHeader>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {job.skills.map((skill, i) => (
                  <Badge key={i} variant="primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Assisted Apply Handoff Modal */}
      <AssistApplyModal
        job={job}
        isOpen={isAssistApplyOpen}
        onClose={() => setIsAssistApplyOpen(false)}
      />
    </div>
  );
}

export default JobDetails;
