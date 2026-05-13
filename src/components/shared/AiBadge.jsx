import React from 'react';
import Badge from '../ui/Badge';
import { Sparkles } from 'lucide-react';

const AiBadge = ({ className }) => {
  return (
    <Badge variant="primary" className={`gap-1 shadow-glow ${className}`}>
      <Sparkles className="w-3 h-3 text-primary" />
      <span className="font-semibold tracking-wide text-[10px] uppercase">AI</span>
    </Badge>
  );
};

export default AiBadge;
