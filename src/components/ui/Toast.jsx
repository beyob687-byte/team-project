import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '../../utils/classNames';

// Global toast state manager
let toastCounter = 0;
let addToastListener = null;

export const toast = {
  success: (message, options) => emitToast({ type: 'success', message, ...options }),
  error: (message, options) => emitToast({ type: 'error', message, ...options }),
  warning: (message, options) => emitToast({ type: 'warning', message, ...options }),
  info: (message, options) => emitToast({ type: 'info', message, ...options }),
};

const emitToast = (toast) => {
  if (addToastListener) {
    addToastListener({ ...toast, id: ++toastCounter });
  } else {
    // Lazy mount container if it doesn't exist
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    
    const root = createRoot(container);
    root.render(<ToastContainer initialToast={{ ...toast, id: ++toastCounter }} />);
  }
};

const Toast = ({ id, type = 'info', message, duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for exit animation
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-primary" />
  };

  const styles = {
    success: 'border-success/30 shadow-[0_4px_20px_rgba(16,185,129,0.15)]',
    error: 'border-danger/30 shadow-[0_4px_20px_rgba(239,68,68,0.15)]',
    warning: 'border-warning/30 shadow-[0_4px_20px_rgba(245,158,11,0.15)]',
    info: 'border-primary/30 shadow-[0_4px_20px_rgba(0,170,255,0.15)]'
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-card bg-surface p-4 shadow-lg border transition-all duration-300 ease-out",
        styles[type],
        isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"
      )}
      role="alert"
    >
      <div className="shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1 text-sm font-medium text-text-1">
        {message}
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 p-1 rounded-full text-text-2 hover:text-text-1 hover:bg-surface-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = ({ initialToast }) => {
  const [toasts, setToasts] = useState(initialToast ? [initialToast] : []);

  useEffect(() => {
    addToastListener = (newToast) => {
      setToasts((current) => [...current, newToast]);
    };
    return () => { addToastListener = null; };
  }, []);

  const removeToast = (id) => {
    setToasts((current) => current.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none sm:top-6 sm:right-6">
      {toasts.map(t => (
        <Toast key={t.id} {...t} onClose={removeToast} />
      ))}
    </div>
  );
};

export default Toast;
