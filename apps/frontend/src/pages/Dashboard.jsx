import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

// Static placeholder metric data
const PLACEHOLDER_STATS = [
  {
    title: 'Saved Jobs',
    count: '12',
    change: '+3 this week',
    variant: 'primary',
    icon: (
      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    title: 'Applications',
    count: '8',
    change: '2 pending review',
    variant: 'info',
    icon: (
      <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Interviews',
    count: '3',
    change: '1 scheduled tomorrow',
    variant: 'warning',
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Offers',
    count: '1',
    change: 'Active offer',
    variant: 'success',
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Banner / Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 mb-3">
            <span>✨</span> AI-Powered Job Pipeline
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Welcome to CareerOS
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

      {/* Temporary Placeholder Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Note:</span> The metrics below are static UI placeholders. Real-time data will connect in subsequent phases.
        </div>
        <Badge variant="warning">Placeholder UI</Badge>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLACEHOLDER_STATS.map((stat) => (
          <Card key={stat.title} hoverEffect>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {stat.count}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {stat.change}
              </span>
            </div>
          </Card>
        ))}
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
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-3">
            {[
              { role: 'Senior Frontend Engineer', company: 'Stripe', status: 'Interview', date: 'Oct 15' },
              { role: 'Full Stack Developer', company: 'Linear', status: 'Applied', date: 'Oct 14' },
              { role: 'Product Engineer', company: 'Vercel', status: 'Saved', date: 'Oct 12' },
            ].map((item, index) => (
              <div key={index} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{item.role}</p>
                  <p className="text-xs text-slate-500">{item.company}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={item.status === 'Interview' ? 'warning' : item.status === 'Applied' ? 'info' : 'neutral'}>
                    {item.status}
                  </Badge>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common workflow shortcuts</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3 mt-4">
            <Link to="/jobs" className="block p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Add a Job</p>
              <p className="text-xs text-slate-500">Track a new listing or paste a URL</p>
            </Link>
            <Link to="/resumes" className="block p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Upload Resume</p>
              <p className="text-xs text-slate-500">Add your latest PDF resume</p>
            </Link>
            <Link to="/ai-tools" className="block p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
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
