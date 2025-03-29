import { ReactNode } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string | ReactNode;
  className?: string;
}

export default function Alert({ type, message, className = '' }: AlertProps) {
  const typeStyles = {
    success: 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-400 dark:border-green-800',
    error: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-400 dark:border-red-800',
    warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-400 dark:border-yellow-800',
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-400 dark:border-blue-800',
  };
  
  const icons = {
    success: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 102 0v-5a1 1 0 00-2 0v5z" clipRule="evenodd" />
      </svg>
    ),
  };
  
  return (
    <div className={`rounded-md p-4 border-l-4 ${typeStyles[type]} ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          {icons[type]}
        </div>
        <div>
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
      </div>
    </div>
  );
}
