import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  CheckIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { 
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Chip,
  Pagination,
  IconButton,
} from '@mui/material';
import format from 'date-fns/format';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  interviewScore?: number;
  resumeUrl?: string;
  lastUpdated: Date;
  skills: string[];
  experience: number;
  education: string;
  location: string;
  salary?: string;
  notes?: string;
}

interface CandidatesTabProps {
  theme: 'light' | 'dark';
  onSelectCandidate: (id: string) => void;
}

const CandidatesTab: React.FC<CandidatesTabProps> = ({ theme, onSelectCandidate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'lastUpdated' | 'status'>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [itemsPerPage] = useState(10);

  // Mock data - Replace with actual data fetching
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Mark Lloyd Cuizon',
      email: 'marklloydcuizon@gmail.com',
      phone: '+63 917 123 4567',
      jobTitle: 'AI Engineer',
      status: 'interview',
      interviewScore: 4.5,
      resumeUrl: '/resumes/marklloydcuizon.pdf',
      lastUpdated: new Date('2024-03-15'),
      skills: ['React', 'TypeScript', 'Node.js', 'Firebase', 'AWS', 'Docker', 'Kubernetes'],
      experience: 5,
      education: 'Bachelor of Science in Computer Science',
      location: 'Cebu, Philippines',
      salary: '$150,000 - $180,000',
      notes: 'Strong technical background, excellent communication skills',
    },
    // Add more mock candidates here
  ]);

  const statusColors = {
    new: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300' },
    screening: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300' },
    interview: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300' },
    offer: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300' },
    hired: { bg: 'bg-emerald-100 dark:bg-emerald-900', text: 'text-emerald-700 dark:text-emerald-300' },
    rejected: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300' },
  };

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'lastUpdated') {
        return sortOrder === 'desc' 
          ? b.lastUpdated.getTime() - a.lastUpdated.getTime()
          : a.lastUpdated.getTime() - b.lastUpdated.getTime();
      }
      if (sortBy === 'name') {
        return sortOrder === 'desc'
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      }
      return sortOrder === 'desc'
        ? b.status.localeCompare(a.status)
        : a.status.localeCompare(b.status);
    });

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const currentCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusFilterClose = (status: string) => {
    setStatusFilter(status);
    setAnchorEl(null);
    setCurrentPage(1);
  };

  const handleSort = (field: 'name' | 'lastUpdated' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSelectCandidate = (id: string) => {
    setSelectedCandidates(prev => {
      if (prev.includes(id)) {
        return prev.filter(cid => cid !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleDownloadResume = (url: string) => {
    // Implement resume download logic
    console.log('Downloading resume:', url);
  };

  const getStatusFilterText = (currentFilter: string) => {
    return currentFilter === 'all' ? 'All Status' : currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidates..."
              className={`flex-1 bg-transparent border-none focus:outline-none text-sm ${
                theme === 'dark' ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outlined"
            startIcon={<FunnelIcon className="h-5 w-5" />}
            onClick={handleStatusFilterClick}
            sx={{
              borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
              color: theme === 'dark' ? '#E5E7EB' : '#374151',
              '&:hover': {
                borderColor: theme === 'dark' ? '#6B7280' : '#D1D5DB',
              },
            }}
          >
            {getStatusFilterText(statusFilter)}
          </Button>
          {selectedCandidates.length > 0 && (
            <Button
              variant="contained"
              onClick={() => setShowComparison(true)}
              sx={{
                bgcolor: '#3B82F6',
                '&:hover': { bgcolor: '#2563EB' },
              }}
            >
              Compare ({selectedCandidates.length})
            </Button>
          )}
        </div>
      </div>

      {/* Candidates Table */}
      <div className={`rounded-lg border ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      } overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
              <tr>
                <th className="w-8 p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-600"
                      checked={selectedCandidates.length === currentCandidates.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCandidates(currentCandidates.map(c => c.id));
                        } else {
                          setSelectedCandidates([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Candidate
                    </span>
                    {sortBy === 'name' && (
                      <ChevronDownIcon 
                        className={`h-4 w-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                      />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    Contact
                  </span>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Status
                    </span>
                    {sortBy === 'status' && (
                      <ChevronDownIcon 
                        className={`h-4 w-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                      />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastUpdated')}
                >
                  <div className="flex items-center gap-2">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Last Updated
                    </span>
                    {sortBy === 'lastUpdated' && (
                      <ChevronDownIcon 
                        className={`h-4 w-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                      />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {currentCandidates.map((candidate) => (
                <motion.tr
                  key={candidate.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
                >
                  <td className="p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 dark:border-gray-600"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => handleSelectCandidate(candidate.id)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {candidate.name}
                        </div>
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {candidate.jobTitle}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
                        {candidate.email}
                      </div>
                      <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {candidate.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${statusColors[candidate.status].bg} ${statusColors[candidate.status].text}`}>
                      {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {format(candidate.lastUpdated, 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      size="small"
                      onClick={() => handleDownloadResume(candidate.resumeUrl || '')}
                      disabled={!candidate.resumeUrl}
                      startIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                    >
                      Resume
                    </Button>
                    <Button
                      size="small"
                      onClick={() => onSelectCandidate(candidate.id)}
                      startIcon={<EyeIcon className="h-4 w-4" />}
                    >
                      View
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
          color="primary"
          size="large"
          sx={{
            '& .MuiPaginationItem-root': {
              color: theme === 'dark' ? '#E5E7EB' : '#374151',
            },
          }}
        />
      </div>

      {/* Status Filter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            bgcolor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            color: theme === 'dark' ? '#E5E7EB' : '#374151',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
          },
        }}
      >
        <MenuItem onClick={() => handleStatusFilterClose('all')}>All Status</MenuItem>
        {Object.keys(statusColors).map((status) => (
          <MenuItem key={status} onClick={() => handleStatusFilterClose(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </MenuItem>
        ))}
      </Menu>

      {/* Comparison Dialog */}
      <Dialog
        open={showComparison}
        onClose={() => setShowComparison(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
            color: theme === 'dark' ? '#E5E7EB' : '#374151',
          },
        }}
      >
        <DialogTitle>
          <div className="flex justify-between items-center">
            <span>Compare Candidates</span>
            <IconButton onClick={() => setShowComparison(false)}>
              <XMarkIcon className="h-6 w-6" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-2 gap-6">
            {selectedCandidates.map(id => {
              const candidate = candidates.find(c => c.id === id);
              if (!candidate) return null;
              
              return (
                <div key={id} className={`p-6 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      className="h-16 w-16 rounded-full"
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`}
                      alt=""
                    />
                    <div>
                      <h3 className={`text-lg font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {candidate.name}
                      </h3>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {candidate.jobTitle}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Interview Score
                      </label>
                      <Rating
                        value={candidate.interviewScore || 0}
                        readOnly
                        precision={0.5}
                        icon={<StarIcon className="h-5 w-5" />}
                      />
                    </div>

                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Skills
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {candidate.skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            sx={{
                              bgcolor: theme === 'dark' ? '#374151' : '#F3F4F6',
                              color: theme === 'dark' ? '#E5E7EB' : '#374151',
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Experience
                      </label>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {candidate.experience} years
                      </p>
                    </div>

                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Education
                      </label>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {candidate.education}
                      </p>
                    </div>

                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Location
                      </label>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {candidate.location}
                      </p>
                    </div>

                    {candidate.salary && (
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Expected Salary
                        </label>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                          {candidate.salary}
                        </p>
                      </div>
                    )}

                    {candidate.notes && (
                      <div>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Notes
                        </label>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                          {candidate.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowComparison(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CandidatesTab; 