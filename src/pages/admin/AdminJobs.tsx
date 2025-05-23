import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ArchiveBoxIcon,
  ClockIcon,
  UsersIcon,
  BriefcaseIcon,
  TrashIcon,
  PencilSquareIcon,
  ArchiveBoxXMarkIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

interface Job {
  id: string;
  title: string;
  company: string; // Changed from department to company to match CreateJobModal
  location: string;
  type: string;
  salary: string;
  posted: string;
  expires: string;
  status: 'active' | 'archived';
  applicants: number;
  description: string;
  requirements: string[];
  skills: string[];
}

const AdminJobs: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const locations = ['Remote', 'On-site', 'Hybrid'];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const jobsQuery = query(
          collection(db, 'createjobs'),
          where('status', '==', activeTab)
        );
        const querySnapshot = await getDocs(jobsQuery);

        const fetchedJobs: Job[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.job_title || 'Untitled Job', // Fixed to use job_title
            company: data.company || 'Unknown', // Use company instead of department
            location: data.location || 'Not specified',
            type: data.remote ? 'Remote' : 'On-site',
            salary: data.salary || 'Not specified',
            posted: data.created_at?.toDate().toISOString().split('T')[0] || 'Unknown',
            expires: data.deadline || 'Unknown',
            status: data.status || 'active',
            applicants: data.candidates?.length || 0,
            description: data.description || 'No description available',
            requirements: data.skills || [],
            skills: data.skills || [],
          };
        });

        setJobs(fetchedJobs);
      } catch (err) {
        console.error('Error fetching jobs from Firestore:', err);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [activeTab]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditJob = async (updatedJob: Job) => {
    try {
      const jobRef = doc(db, 'createjobs', updatedJob.id);
      await updateDoc(jobRef, {
        job_title: updatedJob.title, // Fixed to use job_title
        company: updatedJob.company,
        location: updatedJob.location,
        remote: updatedJob.type === 'Remote',
        salary: updatedJob.salary,
        description: updatedJob.description,
        skills: updatedJob.skills,
      });
      setJobs(jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
      setEditJob(null);
      setToast({ message: 'Job updated successfully', type: 'success' });
    } catch (err) {
      console.error('Error updating job:', err);
      setToast({ message: 'Failed to update job', type: 'error' });
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteJobId) return;
    try {
      const jobRef = doc(db, 'createjobs', deleteJobId);
      await deleteDoc(jobRef);
      setJobs(jobs.filter((j) => j.id !== deleteJobId));
      setDeleteJobId(null);
      setToast({ message: 'Job deleted successfully', type: 'success' });
    } catch (err) {
      console.error('Error deleting job:', err);
      setToast({ message: 'Failed to delete job', type: 'error' });
    }
  };

  const handleArchiveJob = async (jobId: string, newStatus: 'active' | 'archived') => {
    try {
      const jobRef = doc(db, 'createjobs', jobId);
      await updateDoc(jobRef, { status: newStatus });
      setJobs(jobs.filter((j) => j.id !== jobId));
      setToast({ message: `Job ${newStatus === 'archived' ? 'archived' : 'restored'} successfully`, type: 'success' });
    } catch (err) {
      console.error(`Error ${newStatus === 'archived' ? 'archiving' : 'restoring'} job:`, err);
      setToast({ message: `Failed to ${newStatus === 'archived' ? 'archive' : 'restore'} job`, type: 'error' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      <Navbar />

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white text-sm`}
        >
          {toast.message}
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Jobs
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your job postings and track applications
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/create-job')}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Job
            </motion.button>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-4 px-2 text-sm font-medium relative ${
                activeTab === 'active'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active Jobs
              {activeTab === 'active' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`pb-4 px-2 text-sm font-medium relative ${
                activeTab === 'archived'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Archived Jobs
              {activeTab === 'archived' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading jobs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <ArchiveBoxIcon className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-gray-600">No jobs found</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-blue-200 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {job.company} • {job.location} • {job.type}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditJob(job)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteJobId(job.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleArchiveJob(job.id, activeTab === 'active' ? 'archived' : 'active')}
                            className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                          >
                            {activeTab === 'active' ? (
                              <ArchiveBoxIcon className="h-5 w-5" />
                            ) : (
                              <ArchiveBoxXMarkIcon className="h-5 w-5" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <UsersIcon className="h-5 w-5 mr-1" />
                        {job.applicants} Applicants
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="h-5 w-5 mr-1" />
                        Posted {new Date(job.posted).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <BriefcaseIcon className="h-5 w-5 mr-1" />
                        {job.salary}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Edit Job Dialog */}
      {editJob && (
        <Dialog open={!!editJob} onClose={() => setEditJob(null)}>
          <DialogTitle sx={{ bgcolor: 'white', color: 'gray.900' }}>
            Edit Job: {editJob.title}
          </DialogTitle>
          <DialogContent sx={{ bgcolor: 'white', color: 'gray.900' }}>
            <TextField
              label="Job Title"
              value={editJob.title}
              onChange={(e) => setEditJob({ ...editJob, title: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ style: { color: 'gray.600' } }}
              InputProps={{ style: { color: 'gray.900' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'gray.300' } } }}
            />
            <TextField
              label="Company"
              value={editJob.company}
              onChange={(e) => setEditJob({ ...editJob, company: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ style: { color: 'gray.600' } }}
              InputProps={{ style: { color: 'gray.900' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'gray.300' } } }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: 'gray.600' }}>Location</InputLabel>
              <Select
                value={editJob.location}
                onChange={(e) => setEditJob({ ...editJob, location: e.target.value })}
                sx={{ color: 'gray.900', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray.300' } }}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: 'gray.600' }}>Type</InputLabel>
              <Select
                value={editJob.type}
                onChange={(e) => setEditJob({ ...editJob, type: e.target.value })}
                sx={{ color: 'gray.900', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray.300' } }}
              >
                {jobTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Salary"
              value={editJob.salary}
              onChange={(e) => setEditJob({ ...editJob, salary: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ style: { color: 'gray.600' } }}
              InputProps={{ style: { color: 'gray.900' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'gray.300' } } }}
            />
            <TextField
              label="Description"
              value={editJob.description}
              onChange={(e) => setEditJob({ ...editJob, description: e.target.value })}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              InputLabelProps={{ style: { color: 'gray.600' } }}
              InputProps={{ style: { color: 'gray.900' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'gray.300' } } }}
            />
            <TextField
              label="Skills (comma-separated)"
              value={editJob.skills.join(', ')}
              onChange={(e) => setEditJob({ ...editJob, skills: e.target.value.split(',').map(s => s.trim()) })}
              fullWidth
              margin="normal"
              InputLabelProps={{ style: { color: 'gray.600' } }}
              InputProps={{ style: { color: 'gray.900' } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'gray.300' } } }}
            />
          </DialogContent>
          <DialogActions sx={{ bgcolor: 'white' }}>
            <Button onClick={() => setEditJob(null)} sx={{ color: 'gray.600' }}>
              Cancel
            </Button>
            <Button
              onClick={() => handleEditJob(editJob)}
              sx={{ color: 'white', bgcolor: 'blue.600', '&:hover': { bgcolor: 'blue.700' } }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteJobId && (
        <Dialog open={!!deleteJobId} onClose={() => setDeleteJobId(null)}>
          <DialogTitle sx={{ bgcolor: 'white', color: 'gray.900' }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ bgcolor: 'white', color: 'gray.900' }}>
            Are you sure you want to delete this job? This action cannot be undone.
          </DialogContent>
          <DialogActions sx={{ bgcolor: 'white' }}>
            <Button onClick={() => setDeleteJobId(null)} sx={{ color: 'gray.600' }}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteJob}
              sx={{ color: 'white', bgcolor: 'red.600', '&:hover': { bgcolor: 'red.700' } }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body {
          font-family: 'Inter', sans-serif;
          background: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default AdminJobs;