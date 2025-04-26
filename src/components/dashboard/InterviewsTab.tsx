import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BriefcaseIcon,
  PlusIcon,
  VideoCameraIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

interface Interview {
  id: number;
  candidate: string;
  position: string;
  time: string;
  date: string;
}

interface InterviewsTabProps {
  theme: 'light' | 'dark';
  interviews: Interview[];
  onScheduleInterview: () => void;
}

const InterviewsTab: React.FC<InterviewsTabProps> = ({ theme, interviews, onScheduleInterview }) => {
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const today = new Date();
  const filteredInterviews = interviews.filter(interview => {
    const interviewDate = new Date(`${interview.date} ${interview.time}`);
    if (filter === 'upcoming') return interviewDate >= today;
    if (filter === 'past') return interviewDate < today;
    return true;
  });

  const groupedInterviews = filteredInterviews.reduce((acc, interview) => {
    if (!acc[interview.date]) {
      acc[interview.date] = [];
    }
    acc[interview.date].push(interview);
    return acc;
  }, {} as Record<string, Interview[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'upcoming' | 'past' | 'all')}
            className={`px-3 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="all">All</option>
          </select>
          <div className="flex items-center rounded-lg border ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-2 rounded-l-lg ${
                view === 'calendar'
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-900'
                  : ''
              }`}
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 rounded-r-lg ${
                view === 'list'
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-900'
                  : ''
              }`}
            >
              <ClockIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onScheduleInterview}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          <PlusIcon className="h-5 w-5" />
          <span>Schedule Interview</span>
        </motion.button>
      </div>

      {/* Interviews Grid/List */}
      {view === 'calendar' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedInterviews).map(([date, dayInterviews]) => (
            <motion.div
              key={date}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl ${
                theme === 'dark'
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-white border border-gray-200'
              } shadow-md`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <div className="space-y-4">
                {dayInterviews.map((interview) => (
                  <motion.div
                    key={interview.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="h-5 w-5 text-blue-400" />
                          <span className={`font-medium ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {interview.candidate}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                          <span className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {interview.position}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-5 w-5 text-gray-400" />
                          <span className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {interview.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-2 rounded-full ${
                            theme === 'dark'
                              ? 'bg-gray-600 hover:bg-gray-500'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          <VideoCameraIcon className="h-5 w-5 text-blue-400" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-2 rounded-full ${
                            theme === 'dark'
                              ? 'bg-gray-600 hover:bg-gray-500'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          <ChatBubbleLeftIcon className="h-5 w-5 text-blue-400" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className={`rounded-xl overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}>
          <table className="w-full">
            <thead>
              <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Time</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Candidate</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Position</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInterviews.map((interview) => (
                <motion.tr
                  key={interview.id}
                  whileHover={{ backgroundColor: theme === 'dark' ? '#374151' : '#F3F4F6' }}
                >
                  <td className={`px-6 py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {new Date(interview.date).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {interview.time}
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {interview.candidate}
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {interview.position}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <VideoCameraIcon className="h-5 w-5 text-blue-400" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <ChatBubbleLeftIcon className="h-5 w-5 text-blue-400" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InterviewsTab; 