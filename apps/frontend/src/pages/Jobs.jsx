import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jobService from '../services/jobService';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

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

export function Jobs() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({
    jobTitle: '',
    company: '',
    location: '',
    jobUrl: '',
    description: '',
  });
  const [modalError, setModalError] = useState('');

  // Fetch jobs saved in CareerOS database
  const {
    data: responseData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobService.getJobs(),
  });

  // Extract jobs array safely
  const jobs = useMemo(() => {
    if (!responseData) return [];
    if (Array.isArray(responseData.data)) return responseData.data;
    if (Array.isArray(responseData)) return responseData;
    return [];
  }, [responseData]);

  // Filter jobs by search term
  const filteredJobs = useMemo(() => {
    if (!searchTerm.trim()) return jobs;
    const term = searchTerm.toLowerCase().trim();
    return jobs.filter(
      (job) =>
        job.jobTitle?.toLowerCase().includes(term) ||
        job.company?.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term)
    );
  }, [jobs, searchTerm]);

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: (newJob) => jobService.createJob(newJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsAddModalOpen(false);
      setModalForm({ jobTitle: '', company: '', location: '', jobUrl: '', description: '' });
      setModalError('');
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save job. Please check your inputs.';
      setModalError(msg);
    },
  });

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!modalForm.jobTitle.trim() || !modalForm.company.trim() || !modalForm.jobUrl.trim()) {
      setModalError('Job Title, Company, and Job URL are required.');
      return;
    }
    setModalError('');
    createJobMutation.mutate({
      jobTitle: modalForm.jobTitle.trim(),
      company: modalForm.company.trim(),
      location: modalForm.location.trim() || 'Remote',
      jobUrl: modalForm.jobUrl.trim(),
      description: modalForm.description.trim(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Listings & Saved Jobs</h2>
          <p className="text-sm text-slate-500">
            Jobs captured via the CareerOS Chrome Extension and manual entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5"
            title="Refresh saved jobs from backend"
          >
            <svg
              className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-600' : 'text-slate-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isFetching ? 'Syncing...' : 'Sync Extension'}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setModalError('');
              setIsAddModalOpen(true);
            }}
          >
            + Add New Job
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, company, or location..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
            Clear
          </Button>
        )}
      </div>

      {/* Error Banner */}
      {isError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between gap-3"
        >
          <span>Failed to load saved jobs: {error?.response?.data?.message || error?.message || 'Network error'}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((id) => (
            <Card key={id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredJobs.length === 0 && (
        <div className="py-16 text-center space-y-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {searchTerm ? 'No matching jobs found' : 'No jobs saved yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {searchTerm
                ? 'Try adjusting your search criteria or clear the filter.'
                : 'Jobs you save with the CareerOS Chrome Extension on LinkedIn, Indeed, or Glassdoor will appear here automatically.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-2">
            {searchTerm ? (
              <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                + Add Job Manually
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Job Cards List */}
      {!isLoading && !isError && filteredJobs.length > 0 && (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <Card key={job._id} hoverEffect className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="font-semibold text-base text-slate-900 dark:text-white hover:text-indigo-600 transition-colors truncate"
                  >
                    {job.jobTitle}
                  </Link>
                  {job.employmentType && (
                    <Badge variant="neutral">{job.employmentType}</Badge>
                  )}
                  {job.workMode && (
                    <Badge variant="info">{job.workMode}</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{job.company}</span>
                  {job.location && (
                    <>
                      <span>&bull;</span>
                      <span>{job.location}</span>
                    </>
                  )}
                  <span>&bull;</span>
                  <span>Captured {formatJobDate(job.createdAt)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {job.jobUrl && (
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Open original job posting"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                <Link to={`/jobs/${job._id}`}>
                  <Button variant="secondary" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Job Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Save a New Job</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track a listing manually in your CareerOS workspace</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4" noValidate>
              {modalError && (
                <div role="alert" className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.jobTitle}
                    onChange={(e) => setModalForm({ ...modalForm, jobTitle: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.company}
                    onChange={(e) => setModalForm({ ...modalForm, company: e.target.value })}
                    placeholder="e.g. Stripe"
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={modalForm.location}
                    onChange={(e) => setModalForm({ ...modalForm, location: e.target.value })}
                    placeholder="e.g. Remote, US or San Francisco"
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Job Posting URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={modalForm.jobUrl}
                    onChange={(e) => setModalForm({ ...modalForm, jobUrl: e.target.value })}
                    placeholder="https://company.com/jobs/123"
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description / Qualifications (optional)
                </label>
                <textarea
                  rows={3}
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  placeholder="Paste snippet or notes from job posting..."
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={createJobMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createJobMutation.isPending}
                >
                  {createJobMutation.isPending ? 'Saving Job...' : 'Save Job'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;
