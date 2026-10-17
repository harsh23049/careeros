import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export function AIFeatureCard({ title, description, badge, buttonText = 'Launch', onAction }) {
  return (
    <Card hoverEffect className="flex flex-col justify-between space-y-4">
      <div>
        {badge && (
          <div className="mb-2">
            <Badge variant="primary">{badge}</Badge>
          </div>
        )}
        <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      <Button variant="primary" size="sm" onClick={onAction} className="w-full">
        {buttonText}
      </Button>
    </Card>
  );
}

export default AIFeatureCard;
