import React from 'react';
import { motion } from 'framer-motion';
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';

interface OverviewTabProps {
  theme: 'light' | 'dark';
  dashboardData: {
    activeJobs: number;
    totalCandidates: number;
    timeToHire: string;
    hiringRate: string;
    interviewConversionRate?: string;
  };
  trends: {
    activeJobs: { change: number; direction: 'up' | 'down' };
    totalCandidates: { change: number; direction: 'up' | 'down' };
    timeToHire: { change: number; direction: 'up' | 'down' };
    interviewConversionRate: { change: number; direction: 'up' | 'down' };
  };
}

const OverviewTab: React.FC<OverviewTabProps> = ({ theme, dashboardData, trends }) => {
  const sparklineData = (baseValue: number) => ({
    labels: Array(7).fill('').map((_, i) => `Day ${i + 1}`),
    datasets: [
      {
        data: Array(7).fill(0).map(() => baseValue * (0.8 + Math.random() * 0.4)),
        borderColor: '#3B82F6',
        fill: false,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  });

  const metrics = [
    { 
      title: 'Active Jobs', 
      value: dashboardData.activeJobs, 
      icon: BriefcaseIcon, 
      trend: trends.activeJobs,
      tooltip: 'Number of currently active job postings',
      details: 'This metric reflects the total number of job postings that are currently open and accepting applications.',
      sparkline: sparklineData(dashboardData.activeJobs),
    },
    { 
      title: 'Total Candidates', 
      value: dashboardData.totalCandidates, 
      icon: UserGroupIcon, 
      trend: trends.totalCandidates,
      tooltip: 'Total candidates across all jobs',
      details: 'This shows the total number of candidates who have applied to all active and past job postings.',
      sparkline: sparklineData(dashboardData.totalCandidates),
    },
    { 
      title: 'Time to Hire', 
      value: dashboardData.timeToHire, 
      icon: ClockIcon,
      trend: trends.timeToHire,
      tooltip: 'Average days to hire a candidate',
      details: 'This metric indicates the average number of days it takes to hire a candidate from the date of application.',
      sparkline: sparklineData(parseInt(dashboardData.timeToHire) || 0),
    },
    { 
      title: 'Hiring Rate', 
      value: dashboardData.hiringRate, 
      icon: ChartBarIcon,
      tooltip: 'Percentage of applicants hired',
      details: 'This percentage represents the ratio of hired candidates to the total number of applicants.',
      sparkline: sparklineData(parseFloat(dashboardData.hiringRate) || 0),
    },
    { 
      title: 'Interview Conversion Rate', 
      value: dashboardData.interviewConversionRate || '0%', 
      icon: ArrowTrendingUpIcon,
      trend: trends.interviewConversionRate,
      tooltip: 'Percentage of interviews leading to hires',
      details: 'This metric shows the percentage of interviewed candidates who were successfully hired.',
      sparkline: sparklineData(parseFloat(dashboardData.interviewConversionRate || '0') || 0),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <motion.div
          key={metric.title}
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-md hover:shadow-lg transition-shadow`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <metric.icon className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                {metric.title}
              </h3>
            </div>
            {metric.trend && (
              <div className="flex items-center space-x-1">
                {metric.trend.direction === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${metric.trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.trend.change}%
                </span>
              </div>
            )}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {metric.value}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {metric.tooltip}
              </p>
            </div>
            <div className="h-10 w-20">
              <Line
                data={metric.sparkline}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { display: false },
                    y: { display: false },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                  },
                }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default OverviewTab; 