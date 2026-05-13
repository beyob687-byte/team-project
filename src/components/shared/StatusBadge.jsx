import React from 'react';
import Badge from '../ui/Badge';

const StatusBadge = ({ status, className }) => {
  const getStatusConfig = (s) => {
    switch (s?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'published':
        return { variant: 'success', label: s };
      case 'pending':
      case 'planning':
      case 'waitlisted':
        return { variant: 'warning', label: s };
      case 'suspended':
      case 'declined':
      case 'cancelled':
      case 'removed':
        return { variant: 'danger', label: s };
      case 'draft':
      case 'past':
        return { variant: 'default', label: s };
      case 'members only':
      case 'invite only':
        return { variant: 'secondary', label: s };
      case 'ongoing':
        return { variant: 'primary', label: s };
      default:
        return { variant: 'outline', label: s || 'Unknown' };
    }
  };

  const { variant, label } = getStatusConfig(status);

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
