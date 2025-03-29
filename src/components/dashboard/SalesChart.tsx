import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import Card from '@/components/ui/Card';
import { useThemeStore } from '@/store/theme';

interface SalesChartProps {
  data: {
    labels: string[];
    data: number[];
  };
  title?: string;
}

export default function SalesChart({ data, title = 'Sales Overview' }: SalesChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    if (!chartRef.current) return;

    const isDarkMode = theme === 'dark';
    const textColor = isDarkMode ? '#e5e7eb' : '#374151';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Revenue',
          data: data.data,
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: textColor,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            titleColor: isDarkMode ? '#e5e7eb' : '#111827',
            bodyColor: isDarkMode ? '#d1d5db' : '#374151',
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `$${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: gridColor,
              drawBorder: false,
            },
            ticks: {
              color: textColor,
              font: {
                size: 10
              }
            }
          },
          y: {
            grid: {
              color: gridColor,
              drawBorder: false,
            },
            ticks: {
              color: textColor,
              font: {
                size: 10
              },
              callback: function(value) {
                return '$' + value;
              }
            },
            beginAtZero: true
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, theme]);

  return (
    <Card>
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      <div className="p-4">
        <div className="h-64">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </Card>
  );
}
