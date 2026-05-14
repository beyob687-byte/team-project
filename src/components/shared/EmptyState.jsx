import React from 'react';
import { Inbox } from 'lucide-react';
import Button from '../ui/Button';

const EmptyState = ({ 
  icon: Icon = Inbox, 
  title = "No Data Found", 
  description = "There is nothing to display here at the moment.", 
  actionLabel, 
  onAction,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-border-glow rounded-card bg-surface-2/20 ${className}`}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-2 mb-6 shadow-glow">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-display font-bold text-text-1 mb-2">{title}</h3>
      <p className="text-text-2 max-w-md mb-8">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
