import Badge from '../ui/Badge';

const statusVariants = {
  saved: 'neutral',
  applied: 'info',
  pending: 'info',
  oa: 'warning',
  interview: 'warning',
  offer: 'success',
  accepted: 'success',
  rejected: 'danger',
  withdrawn: 'neutral',
};

const statusLabels = {
  oa: 'Online Assessment',
};

export function ApplicationStatusBadge({ status = 'saved' }) {
  const normalized = (status || 'saved').toLowerCase();
  const variant = statusVariants[normalized] || 'neutral';
  const label = statusLabels[normalized] || (normalized.charAt(0).toUpperCase() + normalized.slice(1));

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
}

export default ApplicationStatusBadge;
