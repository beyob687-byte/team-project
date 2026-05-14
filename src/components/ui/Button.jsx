import React from 'react';
import { cn } from '../../utils/classNames';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', isLoading, children, ...props }, ref) => {
  
  const baseStyles = "inline-flex items-center justify-center rounded-btn font-semibold transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-deep disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-deep hover:bg-primary-dim hover:shadow-glow focus-visible:ring-primary",
    secondary: "bg-secondary text-white hover:bg-secondary-dim hover:shadow-glow focus-visible:ring-secondary",
    outline: "bg-transparent text-primary border border-primary/30 hover:bg-primary/10 hover:border-primary/60 focus-visible:ring-primary",
    danger: "bg-danger text-white hover:bg-red-600 hover:shadow-glow focus-visible:ring-danger",
    ghost: "bg-transparent text-text-2 hover:bg-surface hover:text-text-1 focus-visible:ring-primary",
  };

  const sizes = {
    default: "px-5 py-2.5",
    sm: "px-3 py-1.5 text-sm",
    lg: "px-8 py-3 text-lg",
    icon: "p-2",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
