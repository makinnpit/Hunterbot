import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

interface AnalyticsTabProps {
  analyticsData: {
    applicationsOverTime: { date: string; count: number }[];
    candidateSources: { source: string; count: number }[];
    hiringFunnel: { stage: string; count: number }[];
  };
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ analyticsData }) => {
  const stageChartData = {
    labels: ['Applied', 'Interviewed', 'Shortlisted', 'Hired'],
    datasets: [
      {
        data: [60, 28, 15, 8],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#A855F7'],
        borderColor: ['#2563EB', '#9333EA'],
        borderWidth: 1,
      },
    ],
  };

  const hiringRateChartData = {
    labels: ['Current', 'Previous'],
    datasets: [
      {
        label: 'Hiring Rate (%)',
        data: [15, 12], // Using static values since hiringRate is no longer in the props
        backgroundColor: ['#3B82F6', '#A855F7'],
        borderColor: ['#2563EB', '#9333EA'],
        borderWidth: 1,
      },
    ],
  };

  const timeSeriesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Applications',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: '#3B82F6',
        tension: 0.3,
      },
      {
        label: 'Interviews',
        data: [28, 48, 40, 19, 86, 27],
        borderColor: '#10B981',
        tension: 0.3,
      },
    ],
  };

  const exportChart = (chartId: string) => {
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${chartId}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <select className={`bg-transparent border rounded-lg px-3 py-2`}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last year</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select className={`bg-transparent border rounded-lg px-3 py-2`}>
            <option>All Jobs</option>
            <option>Active Jobs</option>
            <option>Archived Jobs</option>
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Stages Chart */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`p-6 rounded-xl bg-white border border-gray-200 shadow-md`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Candidate Stages
            </h3>
            <button
              onClick={() => exportChart('stageChart')}
              className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-500"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
          <div className="h-64">
            <Doughnut
              id="stageChart"
              data={stageChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#6b7280',
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Hiring Rate Comparison */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`p-6 rounded-xl bg-white border border-gray-200 shadow-md`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Hiring Rate Comparison
            </h3>
            <button
              onClick={() => exportChart('hiringRateChart')}
              className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-500"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
          <div className="h-64">
            <Bar
              id="hiringRateChart"
              data={hiringRateChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: '#e5e7eb',
                    },
                    ticks: {
                      color: '#6b7280',
                    },
                  },
                  x: {
                    grid: {
                      color: '#e5e7eb',
                    },
                    ticks: {
                      color: '#6b7280',
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Time Series Chart */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`p-6 rounded-xl bg-white border border-gray-200 shadow-md lg:col-span-2`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Applications & Interviews Trend
            </h3>
            <button
              onClick={() => exportChart('timeSeriesChart')}
              className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-500"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
          <div className="h-64">
            <Line
              id="timeSeriesChart"
              data={timeSeriesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: '#e5e7eb',
                    },
                    ticks: {
                      color: '#6b7280',
                    },
                  },
                  x: {
                    grid: {
                      color: '#e5e7eb',
                    },
                    ticks: {
                      color: '#6b7280',
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#6b7280',
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsTab; 