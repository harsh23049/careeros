import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import applicationService from '../services/applicationService';
import jobService from '../services/jobService';
import { useAuth } from '../features/auth';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ApplicationStatusBadge from '../components/applications/ApplicationStatusBadge';

// Valid status enum values defined in backend application.model.js
const APPLICATION_STATUS_OPTIONS = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'pending', label: 'Pending' },
  { value: 'oa', label: 'Online Assessment (OA)' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer Received' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'pending', label: 'Pending' },
  { id: 'oa', label: 'OA' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'withdrawn', label: 'Withdrawn' },
];

const BOARD_COLUMNS = [
  {
    id: 'col-saved',
    title: 'Saved',
    statuses: ['saved'],
    color: 'border-slate-400/40 text-slate-700 dark:text-slate-300',
    headerBg: 'bg-slate-100/60 dark:bg-slate-800/40',
  },
  {
    id: 'col-applied',
    title: 'Applied & Pending',
    statuses: ['applied', 'pending'],
    color: 'border-sky-500/40 text-sky-700 dark:text-sky-300',
    headerBg: 'bg-sky-50/60 dark:bg-sky-950/20',
  },
  {
    id: 'col-oa',
    title: 'Assessments (OA)',
    statuses: ['oa'],
    color: 'border-amber-500/40 text-amber-700 dark:text-amber-300',
    headerBg: 'bg-amber-50/60 dark:bg-amber-950/20',
  },
  {
    id: 'col-interview',
    title: 'Interviewing',
    statuses: ['interview'],
    color: 'border-purple-500/40 text-purple-700 dark:text-purple-300',
    headerBg: 'bg-purple-50/60 dark:bg-purple-950/20',
  },
  {
    id: 'col-offer',
    title: 'Offers',
    statuses: ['offer', 'accepted'],
    color: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
    headerBg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
  },
  {
    id: 'col-closed',
    title: 'Closed',
    statuses: ['rejected', 'withdrawn'],
    color: 'border-rose-500/40 text-rose-700 dark:text-rose-300',
    headerBg: 'bg-rose-50/60 dark:bg-rose-950/20',
  },
];

function formatDisplayDate(dateString) {
  if (!dateString) return 'Recent';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export function Applications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Local UI filters and controls
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    jobId: '',
    status: 'saved',
    notes: '',
  });
  const [newAppError, setNewAppError] = useState('');

  const [activeHistoryApp, setActiveHistoryApp] = useState(null);
  const [appToDelete, setAppToDelete] = useState(null);

  // 1. Fetch user applications from backend (scoped strictly to authenticated user)
  const {
    data: appsResponse,
    isLoading: isAppsLoading,
    isError: isAppsError,
    error: appsError,
    isFetching: isAppsFetching,
    refetch: refetchApps,
  } = useQuery({
    queryKey: ['applications', user?._id],
    queryFn: () => applicationService.getApplications(),
    enabled: Boolean(user?._id),
  });

  // 2. Fetch user's saved jobs to populate dropdown in "+ New Application" modal
  const { data: jobsResponse } = useQuery({
    queryKey: ['jobs', user?._id],
    queryFn: () => jobService.getJobs(),
    enabled: Boolean(user?._id),
  });

  const savedJobs = useMemo(() => {
    if (!jobsResponse) return [];
    if (Array.isArray(jobsResponse.data)) return jobsResponse.data;
    if (Array.isArray(jobsResponse)) return jobsResponse;
    return [];
  }, [jobsResponse]);

  // Extract applications safely
  const applications = useMemo(() => {
    if (!appsResponse) return [];
    if (Array.isArray(appsResponse.data)) return appsResponse.data;
    if (Array.isArray(appsResponse)) return appsResponse;
    return [];
  }, [appsResponse]);

  // Status counts map for filter tabs
  const statusCounts = useMemo(() => {
    const counts = { all: applications.length };
    for (const app of applications) {
      const s = app.status?.toLowerCase() || 'saved';
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [applications]);

  // Filtered applications by status and search
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (statusFilter !== 'all') {
      result = result.filter(
        (app) => (app.status?.toLowerCase() || 'saved') === statusFilter
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((app) => {
        const title = app.job?.jobTitle?.toLowerCase() || '';
        const company = app.job?.company?.toLowerCase() || '';
        const location = app.job?.location?.toLowerCase() || '';
        const notes = app.notes?.toLowerCase() || '';
        return (
          title.includes(term) ||
          company.includes(term) ||
          location.includes(term) ||
          notes.includes(term)
        );
      });
    }

    return result;
  }, [applications, statusFilter, searchTerm]);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  // Mutation: Update application status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, newStatus }) => {
      setStatusUpdatingId(applicationId);
      return await applicationService.updateApplication(applicationId, {
        status: newStatus,
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate queries so Applications, Dashboard, and Jobs all sync
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      const statusLabel =
        APPLICATION_STATUS_OPTIONS.find((o) => o.value === variables.newStatus)?.label ||
        variables.newStatus;
      showFeedback('success', `Application status updated to "${statusLabel}"`);
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update application status';
      showFeedback('error', msg);
    },
    onSettled: () => {
      setStatusUpdatingId(null);
    },
  });

  // Mutation: Create new application
  const createApplicationMutation = useMutation({
    mutationFn: async (payload) => {
      return await applicationService.createApplication(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsNewModalOpen(false);
      setNewAppForm({ jobId: '', status: 'saved', notes: '' });
      setNewAppError('');
      showFeedback('success', 'New application created successfully');
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create application';
      setNewAppError(msg);
    },
  });

  // Mutation: Delete application
  const deleteApplicationMutation = useMutation({
    mutationFn: async (applicationId) => {
      return await applicationService.deleteApplication(applicationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setAppToDelete(null);
      showFeedback('success', 'Application removed from pipeline');
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete application';
      showFeedback('error', msg);
    },
  });

  const handleStatusChange = (applicationId, newStatus, currentStatus) => {
    if (newStatus === currentStatus || statusUpdatingId) return;
    updateStatusMutation.mutate({ applicationId, newStatus });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newAppForm.jobId) {
      setNewAppError('Please select a saved job from your workspace');
      return;
    }
    setNewAppError('');
    createApplicationMutation.mutate({
      job: newAppForm.jobId,
      status: newAppForm.status,
      notes: newAppForm.notes.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Application Pipeline
          </h2>
          <p className="text-sm text-slate-500">
            Track and advance your job applications across active stages
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchApps()}
            disabled={isAppsFetching}
            className="flex items-center gap-1.5"
            title="Refresh applications"
          >
            <svg
              className={`w-3.5 h-3.5 ${
                isAppsFetching ? 'animate-spin text-indigo-600' : 'text-slate-500'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{isAppsFetching ? 'Refreshing...' : 'Refresh'}</span>
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Board View"
            >
              Board
            </button>
          </div>

          {/* New Application Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setNewAppError('');
              setIsNewModalOpen(true);
            }}
          >
            + New Application
          </Button>
        </div>
      </div>

      {/* Floating Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === 'success' ? '✔' : '✖'}</span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            &times;
          </button>
        </div>
      )}

      {/* Search Bar & Status Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search applications by role, company, location, or notes..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
              Clear
            </Button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {FILTER_TABS.map((tab) => {
            const count = statusCounts[tab.id] || 0;
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error State */}
      {isAppsError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between gap-3"
        >
          <span>
            Failed to load applications:{' '}
            {appsError?.response?.data?.message || appsError?.message || 'Network error'}
          </span>
          <Button variant="outline" size="sm" onClick={() => refetchApps()}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isAppsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-2/3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
                </div>
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
              </div>
              <div className="h-8 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
            </Card>
          ))}
        </div>
      )}

      {/* Empty State: No applications exist at all */}
      {!isAppsLoading && !isAppsError && applications.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              No applications tracked yet
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Start advancing your career pipeline by saving jobs from LinkedIn or creating an application for any saved job.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to="/jobs">
              <Button variant="outline" size="sm">
                Browse Saved Jobs
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setNewAppError('');
                setIsNewModalOpen(true);
              }}
            >
              + Create Application
            </Button>
          </div>
        </div>
      )}

      {/* Empty State: Filter or Search returned 0 */}
      {!isAppsLoading && !isAppsError && applications.length > 0 && filteredApplications.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 space-y-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No applications match your criteria
          </p>
          <p className="text-xs text-slate-500">
            {searchTerm && `Search: "${searchTerm}"`}
            {searchTerm && statusFilter !== 'all' && ' • '}
            {statusFilter !== 'all' && `Status: "${statusFilter}"`}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* VIEW MODE 1: LIST / CARD VIEW */}
      {!isAppsLoading && !isAppsError && viewMode === 'list' && filteredApplications.length > 0 && (
        <div className="space-y-3">
          {filteredApplications.map((app) => {
            const jobTitle = app.job?.jobTitle || 'Untitled Role';
            const company = app.job?.company || 'Company Unspecified';
            const location = app.job?.location || 'Remote';
            const isUpdating = statusUpdatingId === app._id;
            const appliedDate = app.appliedAt || app.createdAt;

            return (
              <Card
                key={app._id}
                hoverEffect
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                {/* Left Section: Job & Company Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {app.job?._id ? (
                      <Link
                        to={`/jobs/${app.job._id}`}
                        className="font-semibold text-base text-slate-900 dark:text-white hover:text-indigo-600 transition-colors truncate"
                      >
                        {jobTitle}
                      </Link>
                    ) : (
                      <span className="font-semibold text-base text-slate-900 dark:text-white truncate">
                        {jobTitle}
                      </span>
                    )}

                    {app.job?.workMode && (
                      <Badge variant="neutral">{app.job.workMode}</Badge>
                    )}
                    {app.job?.employmentType && (
                      <Badge variant="neutral">{app.job.employmentType}</Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {company}
                    </span>
                    <span>&bull;</span>
                    <span>{location}</span>
                    <span>&bull;</span>
                    <span>Applied / Created {formatDisplayDate(appliedDate)}</span>
                  </p>

                  {/* Notes / Resume / Cover Letter tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                    {app.source === 'extension-assisted' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                        <span>⚡</span>
                        <span>Assisted Apply</span>
                      </span>
                    )}
                    {app.resume?.title && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                        <span>📄</span>
                        <span className="truncate max-w-[150px]">{app.resume.title}</span>
                      </span>
                    )}
                    {app.coverLetter?.title && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                        <span>✉️</span>
                        <span className="truncate max-w-[150px]">{app.coverLetter.title}</span>
                      </span>
                    )}
                    {app.notes && (
                      <span className="text-[11px] text-slate-400 italic truncate max-w-sm">
                        "{app.notes}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Section: Status Selector & Actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Status Dropdown with Live Mutation */}
                  <div className="relative">
                    <label htmlFor={`status-select-${app._id}`} className="sr-only">
                      Update status for {jobTitle}
                    </label>
                    <select
                      id={`status-select-${app._id}`}
                      disabled={isUpdating}
                      value={app.status || 'saved'}
                      onChange={(e) =>
                        handleStatusChange(app._id, e.target.value, app.status)
                      }
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                    >
                      {APPLICATION_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {isUpdating && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                      </span>
                    )}
                  </div>

                  {/* Timeline History Button */}
                  {app.statusHistory?.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveHistoryApp(app)}
                      title="View status history timeline"
                      className="text-xs text-slate-500 hover:text-indigo-600"
                    >
                      History ({app.statusHistory.length})
                    </Button>
                  )}

                  {/* External Job Link */}
                  {app.job?.jobUrl && (
                    <a
                      href={app.job.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Open job URL"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setAppToDelete(app)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Remove application"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: PIPELINE BOARD VIEW */}
      {!isAppsLoading && !isAppsError && viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 items-start">
          {BOARD_COLUMNS.map((col) => {
            const colApps = filteredApplications.filter((app) =>
              col.statuses.includes(app.status?.toLowerCase() || 'saved')
            );

            return (
              <div
                key={col.id}
                className="bg-slate-100/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 space-y-3 min-h-[350px]"
              >
                {/* Column Header */}
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-xl ${col.headerBg} border ${col.color}`}
                >
                  <span className="font-bold text-xs uppercase tracking-wider">
                    {col.title}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80">
                    {colApps.length}
                  </span>
                </div>

                {/* Column Application Cards */}
                <div className="space-y-2.5">
                  {colApps.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl">
                      No applications
                    </div>
                  ) : (
                    colApps.map((app) => {
                      const isUpdating = statusUpdatingId === app._id;
                      return (
                        <Card
                          key={app._id}
                          className="p-3.5 space-y-2.5 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate block">
                              {app.job?.jobTitle || 'Untitled Position'}
                            </span>
                            <ApplicationStatusBadge status={app.status} />
                          </div>

                          <p className="text-xs text-slate-500 truncate">
                            {app.job?.company || 'Company Unspecified'}
                          </p>

                          {app.source === 'extension-assisted' && (
                            <div className="pt-0.5">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                                <span>⚡</span>
                                <span>Assisted</span>
                              </span>
                            </div>
                          )}

                          <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                            <span>{formatDisplayDate(app.appliedAt || app.createdAt)}</span>

                            {/* Quick Status Select */}
                            <select
                              disabled={isUpdating}
                              value={app.status || 'saved'}
                              onChange={(e) =>
                                handleStatusChange(app._id, e.target.value, app.status)
                              }
                              className="text-[10px] py-1 px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                            >
                              {APPLICATION_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Create New Application */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Add Application to Pipeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Associate one of your saved jobs with an active pipeline status
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4" noValidate>
              {newAppError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300"
                >
                  {newAppError}
                </div>
              )}

              {savedJobs.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-2">
                  <p className="font-semibold">No saved jobs available</p>
                  <p>
                    Applications must be attached to a saved job in your account. Please save a job first via the Chrome extension or the Jobs page.
                  </p>
                  <Link to="/jobs" onClick={() => setIsNewModalOpen(false)}>
                    <Button variant="primary" size="sm" className="mt-1">
                      Go to Saved Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="new-app-job-select"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Select Saved Job *
                    </label>
                    <select
                      id="new-app-job-select"
                      required
                      value={newAppForm.jobId}
                      onChange={(e) =>
                        setNewAppForm({ ...newAppForm, jobId: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Choose a job to apply to --</option>
                      {savedJobs.map((job) => (
                        <option key={job._id} value={job._id}>
                          {job.jobTitle} at {job.company}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="new-app-status-select"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Initial Status *
                    </label>
                    <select
                      id="new-app-status-select"
                      value={newAppForm.status}
                      onChange={(e) =>
                        setNewAppForm({ ...newAppForm, status: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {APPLICATION_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="new-app-notes"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Notes (optional)
                    </label>
                    <textarea
                      id="new-app-notes"
                      rows="2"
                      value={newAppForm.notes}
                      onChange={(e) =>
                        setNewAppForm({ ...newAppForm, notes: e.target.value })
                      }
                      placeholder="e.g. Applied via recruiter referral, follow up next week"
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsNewModalOpen(false)}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      disabled={createApplicationMutation.isPending}
                    >
                      {createApplicationMutation.isPending
                        ? 'Creating...'
                        : 'Add Application'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Application Status History Timeline */}
      {activeHistoryApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Status History
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeHistoryApp.job?.jobTitle} at {activeHistoryApp.job?.company}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveHistoryApp(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6">
                {(activeHistoryApp.statusHistory || []).map((entry, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900" />
                    <div className="flex items-center gap-2">
                      <ApplicationStatusBadge status={entry.status} />
                      <span className="text-xs text-slate-400">
                        {formatDisplayDate(entry.changedAt)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {entry.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveHistoryApp(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {appToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Remove Application?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove the application for{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {appToDelete.job?.jobTitle || 'this job'}
                </span>{' '}
                from your pipeline? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAppToDelete(null)}
                disabled={deleteApplicationMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteApplicationMutation.mutate(appToDelete._id)}
                disabled={deleteApplicationMutation.isPending}
              >
                {deleteApplicationMutation.isPending ? 'Removing...' : 'Yes, Remove'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Applications;
