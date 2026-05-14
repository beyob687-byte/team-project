import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/classNames';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  className,
  size = 'md' 
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[95vh]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-deep/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Panel */}
      <div 
        className={cn(
          "relative z-50 w-full flex flex-col bg-surface border border-border-glow shadow-glow rounded-card overflow-hidden animate-slide-up mx-4",
          sizes[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-glow bg-surface-2/30">
          <h2 id="modal-title" className="text-xl font-display font-semibold text-text-1">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-text-2 hover:text-text-1 hover:bg-surface-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className={cn("p-6 overflow-y-auto", size === 'full' && "flex-1")}>
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border-glow bg-surface-2/30 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
