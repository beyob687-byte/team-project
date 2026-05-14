import React from 'react';
import { cn } from '../../utils/classNames';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-2", className)}
      {...props}
    />
  );
};

export default Skeleton;
