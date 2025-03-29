import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, error, className = '', ...rest }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none 
            focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
            ${error 
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:text-red-400' 
              : 'border-gray-300 dark:border-gray-700'}
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200
            ${className}
          `}
          {...rest}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
