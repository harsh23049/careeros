import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import jobService from '../services/jobService';
import applicationService from '../services/applicationService';
import { useAuth } from '../features/auth';
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/dashboard/StatCard';
import ApplicationStatusBadge from '../components/applications/ApplicationStatusBadge';

function formatAppDate(dateString) {
  if (!dateString) return 'Recent';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recent';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName ? user.fullName.trim().split(' ')[0] : null;

  // 1. Fetch saved jobs from verified GET /api/v1/jobs endpoint scoped to authenticated user
  const {
    data: jobsResponse,
    isLoading: isJobsLoading,
    isError: isJobsError,
    error: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ['jobs', user?._id],
    queryFn: () => jobService.getJobs(),
    enabled: Boolean(user?._id),
  });

  // 2. Fetch application pipeline from verified GET /api/v1/applications endpoint scoped to authenticated user
  const {
    data: appsResponse,
    isLoading: isAppsLoading,
    isError: isAppsError,
    error: appsError,
    refetch: refetchApps,
  } = useQuery({
    queryKey: ['applications', user?._id],
    queryFn: () => applicationService.getApplications(),
    enabled: Boolean(user?._id),
  });

  // Extract jobs array safely
  const jobs = useMemo(() => {
    if (!jobsResponse) return [];
    if (Array.isArray(jobsResponse.data)) return jobsResponse.data;
    if (Array.isArray(jobsResponse)) return jobsResponse;
    return [];
  }, [jobsResponse]);

  // Extract applications array safely from API response wrapper
  const applications = useMemo(() => {
    if (!appsResponse) return [];
    if (Array.isArray(appsResponse.data)) return appsResponse.data;
    if (Array.isArray(appsResponse)) return appsResponse;
    return [];
  }, [appsResponse]);

  // Derived metrics from verified backend jobs and application data
  const metrics = useMemo(() => {
    const interviews = applications.filter((app) => app.status?.toLowerCase() === 'interview');
    const offers = applications.filter((app) =>
      ['offer', 'accepted'].includes(app.status?.toLowerCase())
    );
    const inProgress = applications.filter((app) =>
      ['applied', 'pending', 'oa', 'interview'].includes(app.status?.toLowerCase())
    );

    return {
      savedCount: jobs.length,
      totalCount: applications.length,
      interviewCount: interviews.length,
      offerCount: offers.length,
      inProgressCount: inProgress.length,
    };
  }, [jobs, applications]);

  // Recent applications subset ordered by creation / update
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.createdAt || b.appliedAt || 0) - new Date(a.createdAt || a.appliedAt || 0))
      .slice(0, 5);
  }, [applications]);

  const hasAnyError = isJobsError || isAppsError;
  const handleRetryAll = () => {
    if (isJobsError) refetchJobs();
    if (isAppsError) refetchApps();
  };

  return (
    <div className="space-y-6">
      {/* Banner / Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 mb-3">
            <span>✨</span> AI-Powered Job Pipeline
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {firstName ? `Welcome back, ${firstName}` : 'Welcome to CareerOS'}
          </h2>
          <p className="text-indigo-200 text-sm mt-1 max-w-xl">
            Track your job hunt, analyze postings with Gemini AI, and auto-match your resumes.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/jobs">
            <Button variant="secondary" size="sm">
              Browse Jobs
            </Button>
          </Link>
          <Link to="/ai-tools">
            <Button variant="primary" size="sm">
              Launch AI Tools
            </Button>
          </Link>
        </div>
      </div>

      {/* API Error Notification */}
      {hasAnyError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Unable to load live pipeline data:{' '}
              {jobsError?.response?.data?.message ||
                appsError?.response?.data?.message ||
                jobsError?.message ||
                appsError?.message ||
                'Network connection error'}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRetryAll} className="shrink-0">
            Retry Connection
          </Button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Saved Jobs: Driven by GET /api/v1/jobs (same as /jobs page) */}
        <StatCard
          title="Saved Jobs"
          value={isJobsError ? '—' : metrics.savedCount}
          subtitle={
            isJobsError
              ? 'Failed to load'
              : metrics.savedCount === 1
              ? '1 job saved'
              : `${metrics.savedCount} jobs saved`
          }
          to="/jobs"
          isLoading={isJobsLoading}
          icon={
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          }
        />

        {/* 2. Total Applications: Driven by GET /api/v1/applications */}
        <StatCard
          title="Applications"
          value={isAppsError ? '—' : metrics.totalCount}
          subtitle={
            isAppsError
              ? 'Failed to load'
              : metrics.inProgressCount > 0
              ? `${metrics.inProgressCount} in progress`
              : 'Total in pipeline'
          }
          to="/applications"
          isLoading={isAppsLoading}
          icon={
            <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        {/* 3. Interviews: Driven by GET /api/v1/applications */}
        <StatCard
          title="Interviews"
          value={isAppsError ? '—' : metrics.interviewCount}
          subtitle={
            isAppsError
              ? 'Failed to load'
              : metrics.interviewCount > 0
              ? `${metrics.interviewCount} scheduled`
              : 'None scheduled'
          }
          to="/applications"
          isLoading={isAppsLoading}
          icon={
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />

        {/* 4. Offers: Driven by GET /api/v1/applications */}
        <StatCard
          title="Offers"
          value={isAppsError ? '—' : metrics.offerCount}
          subtitle={
            isAppsError
              ? 'Failed to load'
              : metrics.offerCount > 0
              ? `${metrics.offerCount} received`
              : 'No active offers'
          }
          to="/applications"
          isLoading={isAppsLoading}
          icon={
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent Pipeline Preview & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Overview of your active application pipeline</CardDescription>
            </div>
            <Link to="/applications" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all &rarr;
            </Link>
          </CardHeader>

          {/* Loading Skeleton */}
          {isAppsLoading && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-3">
              {[1, 2, 3].map((skeletonId) => (
                <div key={skeletonId} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isAppsLoading && !isAppsError && recentApplications.length === 0 && (
            <div className="py-10 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  No applications tracked yet
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save job postings or track your submissions to build your pipeline.
                </p>
              </div>
              <div className="pt-1">
                <Link to="/jobs">
                  <Button variant="secondary" size="sm">
                    Browse Available Jobs
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* List of Applications */}
          {!isAppsLoading && !isAppsError && recentApplications.length > 0 && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-3">
              {recentApplications.map((item) => {
                const role = item.job?.jobTitle || item.jobTitle || 'Untitled Position';
                const company = item.job?.company || item.company || 'Company not specified';
                const date = formatAppDate(item.appliedAt || item.createdAt);

                return (
                  <div key={item._id} className="py-3 flex items-center justify-between text-sm">
                    <div className="min-w-0 pr-3">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {role}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {company}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <ApplicationStatusBadge status={item.status} />
                      <span className="text-xs text-slate-400">{date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common workflow shortcuts</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3 mt-4">
            <Link
              to="/jobs"
              className="block p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Add a Job</p>
              <p className="text-xs text-slate-500">Track a new listing or paste a URL</p>
            </Link>
            <Link
              to="/resumes"
              className="block p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Upload Resume</p>
              <p className="text-xs text-slate-500">Add your latest PDF resume</p>
            </Link>
            <Link
              to="/ai-tools"
              className="block p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Generate Cover Letter</p>
              <p className="text-xs text-slate-500">AI tailored to job and resume</p>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
