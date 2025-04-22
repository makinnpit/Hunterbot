import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';

const tabs = ['Account', 'Integrations', 'AI Settings', 'Customization'];

const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Account');

  const renderTabContent = (tab: string) => {
    switch (tab) {
        case 'Account':
            return (
              <div className="space-y-6">
                {/* Logo Upload Section */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src="/logo-placeholder.png"
                      alt="Company Logo"
                      className="h-16 object-contain"
                    />
                    <div>
                      <button className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary)]/90">
                        Upload Logo
                      </button>
                      <button className="ml-2 px-4 py-2 bg-gray-600/30 text-[var(--text-secondary)] rounded-lg hover:bg-gray-600/50">
                        Reset
                      </button>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        Allowed PNG or JPEG. Max size of 800K.
                      </p>
                    </div>
                  </div>
                </div>
          
                {/* Editable Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Company Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-800 text-[var(--text-primary)]"
                      placeholder="outrankstrategy.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Website</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-800 text-[var(--text-primary)]"
                      placeholder="outrankstrategy.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Company Size</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-800 text-[var(--text-primary)]">
                      <option>1-10</option>
                      <option>11-50</option>
                      <option>51-200</option>
                      <option>201-500</option>
                      <option>500+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Enter Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-800 text-[var(--text-primary)]"
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Company Type</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-800 text-[var(--text-primary)]">
                      <option>Corporate</option>
                      <option>Startup</option>
                      <option>Nonprofit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Company Category</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-800 text-[var(--text-primary)]">
                      <option>Public Limited Company</option>
                      <option>Private Limited Company</option>
                      <option>Sole Proprietorship</option>
                    </select>
                  </div>
                </div>
          
                {/* Save Button */}
                <div className="flex space-x-4 mt-6">
                  <button className="px-6 py-2 rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/90 transition">
                    Save Changes
                  </button>
                  <button className="px-6 py-2 rounded-lg bg-gray-600/30 text-[var(--text-secondary)] hover:bg-gray-600/50 transition">
                    Reset
                  </button>
                </div>
              </div>
            );          
            case 'Integrations':
                return (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {/* LinkedIn Integration */}
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700/50">
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">LinkedIn</h3>
                          <p className="text-sm text-[var(--text-secondary)]">Post jobs directly to your company LinkedIn account</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Replace logic with dynamic connection status later */}
                          <span className="text-xs text-green-400 bg-green-700/20 px-2 py-1 rounded-full">Connected</span>
                          <button className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-500 text-white transition">
                            Disconnect
                          </button>
                        </div>
                      </div>
              
                      {/* Indeed Integration */}
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700/50">
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Indeed</h3>
                          <p className="text-sm text-[var(--text-secondary)]">Send job openings to Indeed in one click</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Simulated disconnected state */}
                          <span className="text-xs text-yellow-400 bg-yellow-700/20 px-2 py-1 rounded-full">Not Connected</span>
                          <button className="px-4 py-2 text-sm rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90 text-white transition">
                            Connect
                          </button>
                        </div>
                      </div>
                    </div>
              
                    <div className="text-sm text-[var(--text-secondary)] mt-4">
                      Want to integrate more platforms? Reach out to support@simplac.io
                    </div>
                  </div>
                );              
      case 'AI Settings':
        return (
          <>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">AI Interview Settings</h2>
            <p className="text-[var(--text-secondary)] mb-4">
              Customize AI tone, scoring weights, and follow-up logic.
            </p>
            <button className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary)]/90 transition">
              Configure AI
            </button>
          </>
        );
        case 'Customization':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Customize Your Interview Form</h2>
            <p className="text-sm text-gray-400">Toggle the fields you want candidates to fill out. Customize your branding and button color.</p>
            <div className="space-y-4">
              {[ 'Logo', 'Intro Video', 'First Name', 'Last Name', 'Email', 'Phone Number', 'Resume', 'LinkedIn URL', 'Website/Portfolio URL' ].map((field) => (
                <div key={field} className="flex items-center justify-between border border-gray-700 rounded-md px-4 py-2">
                  <label className="font-medium text-white">{field}</label>
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
                </div>
              ))}
            </div>
            <div className="mt-6 border border-gray-700 rounded-md p-4">
              <label className="block mb-2 text-sm font-medium text-white">Branding:</label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Select a button color:</span>
                <input type="color" className="h-8 w-8 rounded-full border-none shadow-lg cursor-pointer" defaultValue="#3b82f6" />
                <button className="ml-auto px-4 py-2 rounded-md bg-blue-600 text-white shadow-md hover:bg-blue-500">Let’s Start</button>
              </div>
            </div>
            <div className="text-right mt-8">
              <button className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition">Save</button>
            </div>
          </div>
        );         
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] relative">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold gradient-text">Settings</h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Manage your admin and platform preferences
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-6 border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 relative text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="settings-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Animated Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-[var(--card-background)]/80 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50"
            >
              {renderTabContent(activeTab)}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
