import React from 'react';
import { cn } from '../../utils/classNames';

const Avatar = ({ src, alt, fallback, size = 'md', className, ...props }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl'
  };

  const baseClasses = "relative flex shrink-0 overflow-hidden rounded-full border border-border-glow bg-surface-2";

  return (
    <div className={cn(baseClasses, sizes[size], className)} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-medium text-text-1 bg-surface-2 uppercase">
          {fallback || alt?.charAt(0) || '?'}
        </div>
      )}
    </div>
  );
};

export default Avatar;
