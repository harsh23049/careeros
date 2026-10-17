import Badge from '../ui/Badge';

const statusVariants = {
  saved: 'neutral',
  applied: 'info',
  interview: 'warning',
  offer: 'success',
  rejected: 'danger',
};

export function ApplicationStatusBadge({ status = 'saved' }) {
  const normalized = status.toLowerCase();
  const variant = statusVariants[normalized] || 'neutral';

  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default ApplicationStatusBadge;
