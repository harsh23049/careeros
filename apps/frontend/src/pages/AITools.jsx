import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const AI_FEATURES = [
  {
    title: 'Job Description Analyzer',
    description: 'Extract tech stacks, requirements, and keywords from any job listing via Gemini AI.',
    badge: 'Analyzer',
    actionText: 'Analyze Job',
  },
  {
    title: 'Resume & Job Matcher',
    description: 'Calculate match scores, highlight missing skills, and suggest targeted revisions.',
    badge: 'Matching',
    actionText: 'Match Resume',
  },
  {
    title: 'AI Cover Letter Generator',
    description: 'Create hyper-tailored cover letters aligning your profile with the employer requirements.',
    badge: 'Generator',
    actionText: 'Generate Cover Letter',
  },
];

export function AITools() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Career Tools</h2>
          <Badge variant="primary">Gemini Engine</Badge>
        </div>
        <p className="text-sm text-slate-500">Supercharge your applications with automated intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AI_FEATURES.map((tool) => (
          <Card key={tool.title} hoverEffect className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Badge variant="info">{tool.badge}</Badge>
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">{tool.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{tool.description}</p>
            </div>
            <Button variant="primary" size="sm" className="w-full">
              {tool.actionText}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AITools;
