import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ArchiveBoxIcon,
  ClockIcon,
  UsersIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  TrashIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../../components/Navbar';
import { db } from '../../firebase/firebaseConfig'; // Adjust the path to your firebaseConfig file
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Job {
  id: string;
  title: string;
  department: string;
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
  company?: string; // Added to match Firestore data
}

const AdminJobs: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const departments = ['All', 'Engineering', 'Design', 'Marketing', 'Sales'];
  const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];
  const locations = ['All', 'Remote', 'On-site', 'Hybrid'];

  // Fetch jobs from Firestore when the component mounts or activeTab changes
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query the "createjob" collection based on the active tab (status)
        const jobsQuery = query(
          collection(db, 'createjobs'),
          where('status', '==', activeTab)
        );
        const querySnapshot = await getDocs(jobsQuery);

        const fetchedJobs: Job[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.jobTitle || 'Untitled Job',
            department: data.company || 'Unknown Department', // Use company as department (adjust as needed)
            location: data.location || 'Not specified',
            type: data.remote ? 'Remote' : 'On-site', // Map remote field to type (adjust as needed)
            salary: data.salary || 'Not specified',
            posted: data.createdAt?.toDate().toISOString().split('T')[0] || 'Unknown',
            expires: data.deadline || 'Unknown',
            status: data.status || 'active',
            applicants: data.candidates?.length || 0,
            description: data.description || 'No description available',
            requirements: data.skills || [],
            skills: data.skills || [],
            company: data.company || 'Unknown',
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
  }, [activeTab]); // Re-fetch when the active tab changes

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment.toLowerCase() === 'all' ||
      job.department.toLowerCase() === selectedDepartment.toLowerCase();
    const matchesType =
      selectedType.toLowerCase() === 'all' ||
      job.type.toLowerCase() === selectedType.toLowerCase();
    const matchesLocation =
      selectedLocation.toLowerCase() === 'all' ||
      job.location.toLowerCase() === selectedLocation.toLowerCase();

    return matchesSearch && matchesDepartment && matchesType && matchesLocation;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-[var(--background)] relative">
      <Navbar />

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
              <h1 className="text-3xl font-bold gradient-text">Jobs</h1>
              <p className="text-[var(--text-secondary)] mt-1">
                Manage your job postings and track applications
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/create-job')}
              className="flex items-center justify-center px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary)]/90 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Job
            </motion.button>
          </div>

          {/* Search and Filters */}
          <div className="bg-[var(--card-background)]/80 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600/50 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600/50 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept.toLowerCase()}>{dept}</option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600/50 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  {jobTypes.map((type) => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600/50 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc.toLowerCase()}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-4 px-2 text-sm font-medium relative ${
                activeTab === 'active'
                  ? 'text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Active Jobs
              {activeTab === 'active' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`pb-4 px-2 text-sm font-medium relative ${
                activeTab === 'archived'
                  ? 'text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Archived Jobs
              {activeTab === 'archived' && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"
                />
              )}
            </button>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-primary)] mx-auto"></div>
                <p className="mt-2 text-[var(--text-secondary)]">Loading jobs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-[var(--error)]">{error}</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <ArchiveBoxIcon className="h-12 w-12 mx-auto text-[var(--text-secondary)]" />
                <p className="mt-2 text-[var(--text-secondary)]">No jobs found</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-[var(--card-background)]/80 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 hover:border-[var(--accent-primary)]/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {job.title}
                          </h3>
                          <p className="text-[var(--text-secondary)] text-sm">
                            {job.department} • {job.location} • {job.type}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 text-xs font-medium bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center text-[var(--text-secondary)]">
                        <UsersIcon className="h-5 w-5 mr-1" />
                        {job.applicants} Applicants
                      </div>
                      <div className="flex items-center text-[var(--text-secondary)]">
                        <ClockIcon className="h-5 w-5 mr-1" />
                        Posted {new Date(job.posted).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-[var(--text-secondary)]">
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
    </div>
  );
};

export default AdminJobs;