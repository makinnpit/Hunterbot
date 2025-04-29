import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';

interface Job {
  id: string;
  title: string;
}

interface Candidate {
  id: number;
  name: string;
}

interface ReportDetails {
  interviewScore?: number;
  englishFluency?: number;
  technicalExpertise?: number;
  aiReadiness?: number;
  teamFit?: number;
  notes?: string;
  recommendations?: string;
}

interface Report {
  id: number;
  jobId: string;
  candidateId: number;
  reportType: 'Interview Summary' | 'Candidate Analysis';
  generatedDate: string;
  details: ReportDetails;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [selectedReportType, setSelectedReportType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
    fetchReports();
  }, [selectedJob, selectedReportType, sortOrder]);

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
      const response = await fetch('/api/admin/candidates');
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchReports = async () => {
    try {
      let url = '/api/admin/reports';
      const params = new URLSearchParams();
      if (selectedJob !== 'all') params.append('jobId', selectedJob);
      if (selectedReportType !== 'all') params.append('reportType', selectedReportType);
      params.append('sortOrder', sortOrder);
      url += `?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleExportReport = async (report: Report) => {
    try {
      const job = jobs.find(j => j.id === report.jobId)?.title || 'Unknown Job';
      const candidate = candidates.find(c => c.id === report.candidateId)?.name || 'Unknown Candidate';
      const details = report.details;

      const reportContent = `
Report ID: ${report.id}
Job Title: ${job}
Candidate: ${candidate}
Report Type: ${report.reportType}
Generated Date: ${new Date(report.generatedDate).toLocaleDateString()}

--- Details ---
${details.interviewScore !== undefined ? `Interview Score: ${details.interviewScore}%` : ''}
${details.englishFluency !== undefined ? `English Fluency: ${details.englishFluency}%` : ''}
${details.technicalExpertise !== undefined ? `Technical Expertise: ${details.technicalExpertise}%` : ''}
${details.aiReadiness !== undefined ? `AI Readiness: ${details.aiReadiness}%` : ''}
${details.teamFit !== undefined ? `Team Fit: ${details.teamFit}%` : ''}
${details.notes ? `\nNotes: ${details.notes}` : ''}
${details.recommendations ? `\nRecommendations: ${details.recommendations}` : ''}
      `.trim();

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${report.id}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setDetailsModalOpen(true);
  };

  const filteredReports = reports.filter(report => {
    const jobTitle = jobs.find(j => j.id === report.jobId)?.title || '';
    const candidateName = candidates.find(c => c.id === report.candidateId)?.name || '';
    return (
      jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidateName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 bg-white">
      {/* Navbar */}
      <Navbar
        userName="Troy Teeples"
        userAvatar="https://randomuser.me/api/portraits/men/1.jpg"
        onSearch={setSearchQuery}
        initialNotifications={[
          { id: 1, message: 'New report generated for Frontend Developer role', time: '1 hour ago', link: '/reports' },
          { id: 2, message: 'Candidate Analysis report ready for Mark Cuizon', time: '3 hours ago', link: '/reports' },
        ]}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Reports
          </h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Report Types</option>
              <option value="Interview Summary">Interview Summary</option>
              <option value="Candidate Analysis">Candidate Analysis</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sort by Date ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-700">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-6 text-sm font-medium text-gray-500">Report ID</th>
                  <th className="py-4 px-6 text-sm font-medium text-gray-500">Job Title</th>
                  <th className="py-4 px-6 text-sm font-medium text-gray-500">Candidate Name</th>
                  <th className="py-4 px-6 text-sm font-medium text-gray-500">Report Type</th>
                  <th className="py-4 px-6 text-sm font-medium text-gray-500">Generated Date</th>
                  <th className="py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <motion.tr
                    key={report.id}
                    variants={rowVariants}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm">{report.id}</td>
                    <td className="py-4 px-6 text-sm">{jobs.find(j => j.id === report.jobId)?.title || 'N/A'}</td>
                    <td className="py-4 px-6 text-sm">{candidates.find(c => c.id === report.candidateId)?.name || 'N/A'}</td>
                    <td className="py-4 px-6 text-sm">{report.reportType}</td>
                    <td className="py-4 px-6 text-sm">{new Date(report.generatedDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-sm flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(report)}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleExportReport(report)}
                        className="text-blue-600 hover:text-blue-500"
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

        {/* Details Modal */}
        {detailsModalOpen && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Report Details</h3>
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-gray-700">
                <p><strong>Report ID:</strong> {selectedReport.id}</p>
                <p><strong>Job Title:</strong> {jobs.find(j => j.id === selectedReport.jobId)?.title || 'N/A'}</p>
                <p><strong>Candidate:</strong> {candidates.find(c => c.id === selectedReport.candidateId)?.name || 'N/A'}</p>
                <p><strong>Report Type:</strong> {selectedReport.reportType}</p>
                <p><strong>Generated Date:</strong> {new Date(selectedReport.generatedDate).toLocaleDateString()}</p>
                <div className="mt-4">
                  <h4 className="text-lg font-semibold">Details</h4>
                  {selectedReport.details.interviewScore !== undefined && (
                    <p><strong>Interview Score:</strong> {selectedReport.details.interviewScore}%</p>
                  )}
                  {selectedReport.details.englishFluency !== undefined && (
                    <p><strong>English Fluency:</strong> {selectedReport.details.englishFluency}%</p>
                  )}
                  {selectedReport.details.technicalExpertise !== undefined && (
                    <p><strong>Technical Expertise:</strong> {selectedReport.details.technicalExpertise}%</p>
                  )}
                  {selectedReport.details.aiReadiness !== undefined && (
                    <p><strong>AI Readiness:</strong> {selectedReport.details.aiReadiness}%</p>
                  )}
                  {selectedReport.details.teamFit !== undefined && (
                    <p><strong>Team Fit:</strong> {selectedReport.details.teamFit}%</p>
                  )}
                  {selectedReport.details.notes && (
                    <p><strong>Notes:</strong> {selectedReport.details.notes}</p>
                  )}
                  {selectedReport.details.recommendations && (
                    <p><strong>Recommendations:</strong> {selectedReport.details.recommendations}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Reports;