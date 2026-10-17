import { useParams, Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export function JobDetails() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/jobs" className="hover:text-indigo-600 transition-colors">Jobs</Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium">Job #{id}</span>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Senior Frontend Engineer</h2>
            <Badge variant="primary">Match 94%</Badge>
          </div>
          <p className="text-sm text-slate-500">Stripe &bull; San Francisco, CA (Remote) &bull; Added 2 days ago</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Analyze with AI
          </Button>
          <Button variant="primary" size="sm">
            Generate Application
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <CardHeader>
            <CardTitle>Job Description & Responsibilities</CardTitle>
          </CardHeader>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              Stripe is looking for a Senior Frontend Engineer to build world-class user interfaces across our developer dashboard and payment checkout flows.
            </p>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 pt-2">Key Qualifications</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <li>5+ years of experience with React, TypeScript, and modern CSS systems</li>
              <li>Track record of building accessible and performant web applications</li>
              <li>Experience collaborating with design systems and product engineers</li>
            </ul>
          </div>
        </Card>

        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>AI Match Breakdown</CardTitle>
          </CardHeader>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1 font-medium">
                <span>Skills Alignment</span>
                <span className="text-emerald-600">95%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 font-medium">
                <span>Experience Relevance</span>
                <span className="text-indigo-600">90%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default JobDetails;
