import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';

interface CompanyDetails {
  companyName: string;
  website: string;
  companySize: string;
  phoneNumber: string;
  companyType: string;
  companyCategory: string;
  logoUrl: string;
}

interface Integration {
  name: string;
  connected: boolean;
}

interface AISettings {
  tone: 'formal' | 'casual' | 'technical';
  scoringWeights: {
    technical: number;
    communication: number;
    culturalFit: number;
  };
  followUpLogic: 'standard' | 'aggressive' | 'minimal';
}

interface CustomizationSettings {
  formFields: { [key: string]: boolean };
  buttonColor: string;
}

const tabs = ['Account', 'Integrations', 'AI Settings', 'Customization'];

const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Account');
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    companyName: '',
    website: '',
    companySize: '1-10',
    phoneNumber: '',
    companyType: 'Corporate',
    companyCategory: 'Public Limited Company',
    logoUrl: '/logo-placeholder.png',
  });
  const [integrations, setIntegrations] = useState<Integration[]>([
    { name: 'LinkedIn', connected: true },
    { name: 'Indeed', connected: false },
  ]);
  const [aiSettings, setAISettings] = useState<AISettings>({
    tone: 'formal',
    scoringWeights: { technical: 40, communication: 30, culturalFit: 30 },
    followUpLogic: 'standard',
  });
  const [customization, setCustomization] = useState<CustomizationSettings>({
    formFields: {
      Logo: true,
      IntroVideo: false,
      FirstName: true,
      LastName: true,
      Email: true,
      PhoneNumber: true,
      Resume: true,
      LinkedInURL: false,
      WebsitePortfolioURL: false,
    },
    buttonColor: '#3b82f6',
  });
  const [aiModalOpen, setAIModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial settings from the backend
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setCompanyDetails(data.companyDetails || companyDetails);
      setIntegrations(data.integrations || integrations);
      setAISettings(data.aiSettings || aiSettings);
      setCustomization(data.customization || customization);
    } catch (err) {
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ['image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PNG or JPEG files are allowed.');
      return;
    }
    if (file.size > 800 * 1024) {
      setError('File size must be less than 800KB.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('logo', file);
      const response = await fetch('/api/admin/settings/logo', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload logo');
      const data = await response.json();
      setCompanyDetails(prev => ({ ...prev, logoUrl: data.logoUrl }));
      setError(null);
    } catch (err) {
      setError('Failed to upload logo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyDetails),
      });
      if (!response.ok) throw new Error('Failed to save company details');
      setError(null);
      alert('Company details saved successfully!');
    } catch (err) {
      setError('Failed to save company details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationToggle = async (index: number) => {
    const updatedIntegrations = [...integrations];
    updatedIntegrations[index].connected = !updatedIntegrations[index].connected;
    setIntegrations(updatedIntegrations);

    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedIntegrations),
      });
      if (!response.ok) throw new Error('Failed to update integration');
      setError(null);
    } catch (err) {
      setError('Failed to update integration. Please try again.');
      // Revert on failure
      setIntegrations([...integrations]);
    } finally {
      setLoading(false);
    }
  };

  const handleAISettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiSettings),
      });
      if (!response.ok) throw new Error('Failed to save AI settings');
      setAIModalOpen(false);
      setError(null);
      alert('AI settings saved successfully!');
    } catch (err) {
      setError('Failed to save AI settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customization),
      });
      if (!response.ok) throw new Error('Failed to save customization settings');
      setError(null);
      alert('Customization settings saved successfully!');
    } catch (err) {
      setError('Failed to save customization settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = (tab: string) => {
    switch (tab) {
      case 'Account':
        return (
          <form onSubmit={handleCompanyDetailsSubmit} className="space-y-6">
            {/* Logo Upload Section */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <img src={companyDetails.logoUrl} alt="Company Logo" className="h-16 object-contain" />
                <div>
                  <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                    Upload Logo
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg"
                      onChange={handleLogoUpload}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setCompanyDetails(prev => ({ ...prev, logoUrl: '/logo-placeholder.png' }))}
                    className="ml-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Reset
                  </button>
                  <p className="text-xs text-gray-500 mt-1">Allowed PNG or JPEG. Max size of 800K.</p>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Company Name</label>
                <input
                  type="text"
                  value={companyDetails.companyName}
                  onChange={(e) =>
                    setCompanyDetails(prev => ({ ...prev, companyName: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="outrankstrategy.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Website</label>
                <input
                  type="text"
                  value={companyDetails.website}
                  onChange={(e) =>
                    setCompanyDetails(prev => ({ ...prev, website: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="outrankstrategy.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Company Size</label>
                <select
                  value={companyDetails.companySize}
                  onChange={(e) =>
                    setCompanyDetails(prev => ({ ...prev, companySize: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>201-500</option>
                  <option>500+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Enter Phone Number</label>
                <input
                  type="tel"
                  value={companyDetails.phoneNumber}
                  onChange={(e) =>
                    setCompanyDetails(prev => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+63 912 345 6789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Company Type</label>
                <select
                  value={companyDetails.companyType}
                  onChange={(e) =>
                    setCompanyDetails(prev => ({ ...prev, companyType: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Corporate</option>
                  <option>Startup</option>
                  <option>Nonprofit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Company Category</label>
                <select
                  value={companyDetails.companyCategory}
                  onChange={(e) =>
                    setCompanyDetails(prev => ({ ...prev, companyCategory: e.target.value }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Public Limited Company</option>
                  <option>Private Limited Company</option>
                  <option>Sole Proprietorship</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex space-x-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => fetchSettings()}
                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Reset
              </button>
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </form>
        );

      case 'Integrations':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {integrations.map((integration, index) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-500">
                      {integration.name === 'LinkedIn'
                        ? 'Post jobs directly to your company LinkedIn account'
                        : 'Send job openings to Indeed in one click'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        integration.connected
                          ? 'text-green-600 bg-green-100'
                          : 'text-yellow-600 bg-yellow-100'
                      }`}
                    >
                      {integration.connected ? 'Connected' : 'Not Connected'}
                    </span>
                    <button
                      onClick={() => handleIntegrationToggle(index)}
                      disabled={loading}
                      className={`px-4 py-2 text-sm rounded-lg transition ${
                        integration.connected
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'Updating...' : integration.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-4">
              Want to integrate more platforms? Reach out to{' '}
              <a href="mailto:support@simplac.io" className="text-blue-600 hover:underline">
                support@simplac.io
              </a>
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>
        );

      case 'AI Settings':
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Interview Settings</h2>
            <p className="text-gray-500 mb-4">
              Customize AI tone, scoring weights, and follow-up logic.
            </p>
            <button
              onClick={() => setAIModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Configure AI
            </button>

            {/* AI Settings Modal */}
            {aiModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Configure AI Settings</h3>
                    <button
                      onClick={() => setAIModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleAISettingsSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">AI Tone</label>
                      <select
                        value={aiSettings.tone}
                        onChange={(e) =>
                          setAISettings(prev => ({
                            ...prev,
                            tone: e.target.value as AISettings['tone'],
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="formal">Formal</option>
                        <option value="casual">Casual</option>
                        <option value="technical">Technical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Scoring Weights
                      </label>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-gray-500">Technical Skills</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={aiSettings.scoringWeights.technical}
                            onChange={(e) =>
                              setAISettings(prev => ({
                                ...prev,
                                scoringWeights: {
                                  ...prev.scoringWeights,
                                  technical: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Communication</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={aiSettings.scoringWeights.communication}
                            onChange={(e) =>
                              setAISettings(prev => ({
                                ...prev,
                                scoringWeights: {
                                  ...prev.scoringWeights,
                                  communication: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Cultural Fit</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={aiSettings.scoringWeights.culturalFit}
                            onChange={(e) =>
                              setAISettings(prev => ({
                                ...prev,
                                scoringWeights: {
                                  ...prev.scoringWeights,
                                  culturalFit: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Follow-Up Logic
                      </label>
                      <select
                        value={aiSettings.followUpLogic}
                        onChange={(e) =>
                          setAISettings(prev => ({
                            ...prev,
                            followUpLogic: e.target.value as AISettings['followUpLogic'],
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="standard">Standard</option>
                        <option value="aggressive">Aggressive</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>
                    <div className="flex space-x-4 mt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAIModalOpen(false)}
                        className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                    </div>
                    {error && <p className="text-red-600 mt-2">{error}</p>}
                  </form>
                </motion.div>
              </div>
            )}
          </div>
        );

      case 'Customization':
        return (
          <form onSubmit={handleCustomizationSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Customize Your Interview Form</h2>
            <p className="text-sm text-gray-500">
              Toggle the fields you want candidates to fill out. Customize your branding and button color.
            </p>
            <div className="space-y-4">
              {Object.keys(customization.formFields).map((field) => (
                <div
                  key={field}
                  className="flex items-center justify-between border border-gray-200 rounded-md px-4 py-2"
                >
                  <label className="font-medium text-gray-700">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    type="checkbox"
                    checked={customization.formFields[field]}
                    onChange={() =>
                      setCustomization(prev => ({
                        ...prev,
                        formFields: {
                          ...prev.formFields,
                          [field]: !prev.formFields[field],
                        },
                      }))
                    }
                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 border border-gray-200 rounded-md p-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Branding:</label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Select a button color:</span>
                <input
                  type="color"
                  value={customization.buttonColor}
                  onChange={(e) =>
                    setCustomization(prev => ({ ...prev, buttonColor: e.target.value }))
                  }
                  className="h-8 w-8 rounded-full border-none shadow-lg cursor-pointer"
                />
                <button
                  style={{ backgroundColor: customization.buttonColor }}
                  className="ml-auto px-4 py-2 rounded-md text-white shadow-md hover:opacity-90 transition"
                >
                  Let's Start
                </button>
              </div>
            </div>
            <div className="text-right mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
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
            <h1 className="text-3xl font-bold text-gray-900">
              Settings
            </h1>
            <p className="text-gray-500 mt-1">Manage your admin and platform preferences</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 relative text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="settings-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
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
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
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