import React, { ReactNode } from 'react';
import Card from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatCard({ title, value, change, icon, trend = 'up' }: StatCardProps) {
  const renderTrendIcon = () => {
    if (!change) return null;
    
    const isPositive = !change.startsWith('-');
    const actualTrend = trend === 'neutral' ? 'neutral' : isPositive ? 'up' : 'down';
    
    switch (actualTrend) {
      case 'up':
        return (
          <span className="text-green-600 dark:text-green-400 flex items-center text-xs">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {change}
          </span>
        );
      case 'down':
        return (
          <span className="text-red-600 dark:text-red-400 flex items-center text-xs">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            {change}
          </span>
        );
      default:
        return (
          <span className="text-gray-600 dark:text-gray-400 flex items-center text-xs">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
            {change}
          </span>
        );
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-4">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-semibold">{value}</p>
          {renderTrendIcon()}
        </div>
      </div>
    </Card>
  );
}
