import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export default function Table({ children, className = '' }: TableProps) {
  return (
    <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
      {children}
    </table>
  );
}
