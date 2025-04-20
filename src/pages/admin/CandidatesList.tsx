import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, DocumentArrowDownIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';

interface Candidate {
  id: number;
  name: string;
  jobTitle: string;
  status: 'PENDING' | 'INTERVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  interviewScore?: number;
  resumeUrl: string;
  lastUpdated: string;
  email: string;
  phone: string;
}

interface Job {
  id: string;
  title: string;
}

interface CandidatesListProps {
  onSelectCandidate: (candidateId: number) => void;
}

const CandidatesList: React.FC<CandidatesListProps> = ({ onSelectCandidate }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, [selectedJob]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/admin/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const url = selectedJob === 'all' 
        ? '/api/admin/candidates'
        : `/api/admin/candidates?jobId=${selectedJob}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const handleView = (candidate: Candidate) => {
    onSelectCandidate(candidate.id);
    navigate(`/admin/candidates/${candidate.id}`);
  };

  const handleDownloadResume = async (candidate: Candidate) => {
    try {
      const response = await fetch(candidate.resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidate.name}-resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  const handleStatusChange = async (candidateId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/candidates/${candidateId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      setCandidates(candidates.map(candidate =>
        candidate.id === candidateId
          ? { ...candidate, status: newStatus as Candidate['status'] }
          : candidate
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSelectCandidate = (candidateId: number) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleCompare = () => {
    if (selectedCandidates.length >= 2) {
      setCompareDialogOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
      case 'INTERVIEWED': return 'bg-blue-500/20 text-blue-400';
      case 'SHORTLISTED': return 'bg-[var(--success)]/20 text-[var(--success)]';
      case 'REJECTED': return 'bg-[var(--error)]/20 text-[var(--error)]';
      case 'HIRED': return 'bg-[var(--success)]/20 text-[var(--success)]';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const filteredCandidates = candidates.filter(
    candidate =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCandidatesData = candidates.filter(c => selectedCandidates.includes(c.id));

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
      {/* Navbar */}
      <Navbar
        userName="Troy Teeples"
        userAvatar="https://randomuser.me/api/portraits/men/1.jpg"
        onSearch={setSearchQuery}
        initialNotifications={[
          { id: 1, message: 'New application for Frontend Developer role', time: '1 hour ago', link: '/candidates/123' },
          { id: 2, message: 'Interview scheduled with Mark Cuizon', time: '3 hours ago', link: '/interviews/456' },
        ]}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text">Candidates</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="bg-[var(--card-background)] text-[var(--text-primary)] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              <option value="all">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <button
              onClick={handleCompare}
              disabled={selectedCandidates.length < 2}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCandidates.length < 2
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-[var(--accent-primary)] text-white hover:bg-[#7c3aed]'
              }`}
            >
              <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
              Compare Candidates
            </button>
          </div>
        </div>

        <div className="bg-[var(--card-background)] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[var(--text-primary)]">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-4 px-6 text-sm font-medium">Select</th>
                  <th className="py-4 px-6 text-sm font-medium">Name</th>
                  <th className="py-4 px-6 text-sm font-medium">Job Title</th>
                  <th className="py-4 px-6 text-sm font-medium">Status</th>
                  <th className="py-4 px-6 text-sm font-medium">Interview Score</th>
                  <th className="py-4 px-6 text-sm font-medium">Last Updated</th>
                  <th className="py-4 px-6 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <motion.tr
                    key={candidate.id}
                    variants={rowVariants}
                    className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => handleSelectCandidate(candidate.id)}
                        className="h-4 w-4 text-[var(--accent-primary)] rounded border-gray-600 bg-gray-800 focus:ring-[var(--accent-primary)]"
                      />
                    </td>
                    <td className="py-4 px-6 text-sm">{candidate.name}</td>
                    <td className="py-4 px-6 text-sm">{candidate.jobTitle}</td>
                    <td className="py-4 px-6 text-sm">
                      <select
                        value={candidate.status}
                        onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(candidate.status)} border-0 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="INTERVIEWED">Interviewed</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="HIRED">Hired</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {candidate.interviewScore !== undefined ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-[var(--accent-primary)] h-2 rounded-full"
                              style={{ width: `${candidate.interviewScore}%` }}
                            ></div>
                          </div>
                          <span>{candidate.interviewScore}%</span>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {new Date(candidate.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm flex space-x-2">
                      <button
                        onClick={() => handleView(candidate)}
                        className="text-[var(--gradient-start)] hover:text-blue-300"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadResume(candidate)}
                        className="text-[var(--gradient-start)] hover:text-blue-300"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Dialog */}
        {compareDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[var(--card-background)] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Compare Candidates</h3>
                <button
                  onClick={() => setCompareDialogOpen(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[var(--text-primary)]">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 text-sm font-medium">Field</th>
                      {selectedCandidatesData.map(candidate => (
                        <th key={candidate.id} className="py-3 px-4 text-sm font-medium">
                          {candidate.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-sm font-medium">Job Title</td>
                      {selectedCandidatesData.map(candidate => (
                        <td key={candidate.id} className="py-3 px-4 text-sm">{candidate.jobTitle}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-sm font-medium">Status</td>
                      {selectedCandidatesData.map(candidate => (
                        <td key={candidate.id} className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-sm font-medium">Interview Score</td>
                      {selectedCandidatesData.map(candidate => (
                        <td key={candidate.id} className="py-3 px-4 text-sm">
                          {candidate.interviewScore !== undefined ? `${candidate.interviewScore}%` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-sm font-medium">Email</td>
                      {selectedCandidatesData.map(candidate => (
                        <td key={candidate.id} className="py-3 px-4 text-sm">{candidate.email}</td>
                      ))}
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4 text-sm font-medium">Phone</td>
                      {selectedCandidatesData.map(candidate => (
                        <td key={candidate.id} className="py-3 px-4 text-sm">{candidate.phone}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm font-medium">Last Updated</td>
                      {selectedCandidatesData.map(candidate => (
                        <td key={candidate.id} className="py-3 px-4 text-sm">
                          {new Date(candidate.lastUpdated).toLocaleDateString()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CandidatesList;