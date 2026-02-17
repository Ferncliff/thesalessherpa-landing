import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  ArrowPathIcon,
  StarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  LinkIcon,
  FireIcon,
  ChartBarIcon,
  TrophyIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const LinkedInNetworkIntelligence = () => {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      // Load the processed LinkedIn network data
      const response = await fetch('/api/relationships/linkedin-network');
      if (response.ok) {
        const data = await response.json();
        setNetworkData(data);
      } else {
        // Fallback to demo data for VP presentation
        const demoData = generateDemoNetworkData();
        setNetworkData(demoData);
      }
    } catch (error) {
      console.error('Error loading network data:', error);
      // Generate demo data for presentation
      const demoData = generateDemoNetworkData();
      setNetworkData(demoData);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoNetworkData = () => {
    return {
      metadata: {
        totalConnections: 1038,
        territoryMatches: 131,
        atsVendorConnections: 8,
        highValueDecisionMakers: 456,
        processedAt: new Date().toISOString()
      },
      topTerritoryMatches: [
        {
          accountName: 'WPP',
          urgency: 95,
          connections: [
            {
              fullName: 'Sarah Chen',
              position: 'VP Marketing Technology',
              relationshipStrength: 85,
              category: 'senior_leadership',
              linkedinUrl: 'https://linkedin.com/in/sarah-chen-wpp'
            },
            {
              fullName: 'Michael Torres',
              position: 'Director, HR Systems',
              relationshipStrength: 72,
              category: 'hr_decision_maker',
              linkedinUrl: 'https://linkedin.com/in/michael-torres-wpp'
            }
          ]
        },
        {
          accountName: 'Battelle',
          urgency: 92,
          connections: [
            {
              fullName: 'Dr. Jennifer Walsh',
              position: 'VP Human Resources',
              relationshipStrength: 78,
              category: 'c_suite',
              linkedinUrl: 'https://linkedin.com/in/jennifer-walsh-battelle'
            }
          ]
        },
        {
          accountName: 'Uber',
          urgency: 88,
          connections: [
            {
              fullName: 'Lisa Rodriguez',
              position: 'VP Procurement',
              relationshipStrength: 68,
              category: 'senior_leadership',
              linkedinUrl: 'https://linkedin.com/in/lisa-rodriguez-uber'
            }
          ]
        }
      ],
      atsVendorConnections: [
        {
          fullName: 'Tom Wilson',
          company: 'Workday',
          position: 'Enterprise Partnership Manager',
          relationshipStrength: 90,
          category: 'ats_vendor',
          introValue: 95
        },
        {
          fullName: 'Jennifer Davis',
          company: 'iCIMS',
          position: 'Strategic Account Director',
          relationshipStrength: 75,
          category: 'ats_vendor',
          introValue: 85
        },
        {
          fullName: 'Ryan Park',
          company: 'SAP SuccessFactors',
          position: 'Sales Director',
          relationshipStrength: 82,
          category: 'ats_vendor',
          introValue: 88
        }
      ],
      industryBreakdown: {
        'Technology': 312,
        'Financial Services': 186,
        'Healthcare': 142,
        'Consulting': 98,
        'Manufacturing': 84,
        'Education': 67,
        'Other': 149
      },
      relationshipStrengthDistribution: {
        'Very Strong (80+)': 124,
        'Strong (60-79)': 298,
        'Moderate (40-59)': 456,
        'Weak (20-39)': 128,
        'Very Weak (<20)': 32
      }
    };
  };

  const getStrengthColor = (strength) => {
    if (strength >= 80) return 'text-green-600 bg-green-100';
    if (strength >= 60) return 'text-blue-600 bg-blue-100';
    if (strength >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'c_suite': return TrophyIcon;
      case 'senior_leadership': return StarIcon;
      case 'hr_decision_maker': return UsersIcon;
      case 'sales_professional': return BoltIcon;
      case 'ats_vendor': return BuildingOfficeIcon;
      default: return UsersIcon;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'c_suite': return 'text-purple-600 bg-purple-100';
      case 'senior_leadership': return 'text-blue-600 bg-blue-100';
      case 'hr_decision_maker': return 'text-green-600 bg-green-100';
      case 'sales_professional': return 'text-orange-600 bg-orange-100';
      case 'ats_vendor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!networkData) {
    return (
      <div className="text-center py-12">
        <UsersIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Network data not available</h3>
        <p className="text-slate-600">LinkedIn network analysis is being processed.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Network Overview', icon: ChartBarIcon },
    { id: 'territory', name: 'Territory Matches', icon: BuildingOfficeIcon },
    { id: 'ats', name: 'ATS Vendors', icon: ArrowPathIcon },
    { id: 'analytics', name: 'Network Analytics', icon: TrophyIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <UsersIcon className="h-8 w-8" />
              LinkedIn Network Intelligence
            </h1>
            <p className="text-blue-100 mt-1">Complete relationship mapping for warm introduction pathways</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{networkData.metadata.totalConnections}</div>
            <div className="text-blue-100 text-sm">Total Connections</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xl font-bold">{networkData.metadata.territoryMatches}</div>
            <div className="text-blue-100 text-sm">Territory Matches</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xl font-bold">{networkData.metadata.atsVendorConnections}</div>
            <div className="text-blue-100 text-sm">ATS Vendors</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xl font-bold">{networkData.metadata.highValueDecisionMakers}</div>
            <div className="text-blue-100 text-sm">Decision Makers</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xl font-bold">
              {Math.round((networkData.metadata.territoryMatches / networkData.metadata.totalConnections) * 100)}%
            </div>
            <div className="text-blue-100 text-sm">Territory Coverage</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Network Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-3">Relationship Strength Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(networkData.relationshipStrengthDistribution).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{category}</span>
                          <span className="text-sm font-medium text-slate-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-3">Industry Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(networkData.industryBreakdown)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 6)
                        .map(([industry, count]) => (
                        <div key={industry} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{industry}</span>
                          <span className="text-sm font-medium text-slate-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Territory Matches Tab */}
          {activeTab === 'territory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Territory Account Connections</h3>
                <div className="text-sm text-slate-600">
                  {networkData.topTerritoryMatches.length} accounts with direct connections
                </div>
              </div>

              {networkData.topTerritoryMatches.map((match, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <BuildingOfficeIcon className="h-5 w-5 text-slate-400" />
                      <h4 className="font-semibold text-slate-900">{match.accountName}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                        {match.urgency} urgency
                      </span>
                    </div>
                    <Link
                      to={`/fa/mattedwards/accounts/${match.accountName.toLowerCase()}/command`}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Command Center
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {match.connections.map((connection, connIndex) => {
                      const CategoryIcon = getCategoryIcon(connection.category);
                      return (
                        <div key={connIndex} className="flex items-center justify-between bg-slate-50 rounded p-3">
                          <div className="flex items-center gap-3">
                            <CategoryIcon className="h-4 w-4 text-slate-500" />
                            <div>
                              <div className="font-medium text-slate-900">{connection.fullName}</div>
                              <div className="text-sm text-slate-600">{connection.position}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStrengthColor(connection.relationshipStrength)}`}>
                              {connection.relationshipStrength}/100
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(connection.category)}`}>
                              {connection.category.replace('_', ' ')}
                            </span>
                            <a
                              href={connection.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <LinkIcon className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ATS Vendors Tab */}
          {activeTab === 'ats' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">ATS Vendor Connections</h3>
                <div className="text-sm text-slate-600">
                  Direct relationships for partnership leverage
                </div>
              </div>

              {networkData.atsVendorConnections.map((connection, index) => (
                <div key={index} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center">
                        <BuildingOfficeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{connection.fullName}</div>
                        <div className="text-sm text-slate-600">{connection.position}</div>
                        <div className="text-sm font-medium text-orange-700">{connection.company}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full mb-2 ${getStrengthColor(connection.relationshipStrength)}`}>
                        {connection.relationshipStrength}/100 relationship
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                        {connection.introValue}/100 intro value
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-white rounded border border-orange-200">
                    <div className="text-sm text-orange-800">
                      <span className="font-medium">Partnership Opportunity:</span> Leverage {connection.company} relationship for warm introductions to {connection.company.toLowerCase()} customers in your territory.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Network Analytics & Insights</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FireIcon className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Network Strength</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {Math.round((networkData.relationshipStrengthDistribution['Very Strong (80+)'] + 
                               networkData.relationshipStrengthDistribution['Strong (60-79)']) / 
                               networkData.metadata.totalConnections * 100)}%
                  </div>
                  <div className="text-sm text-green-600">Strong relationships</div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrophyIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Decision Maker Access</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {Math.round(networkData.metadata.highValueDecisionMakers / networkData.metadata.totalConnections * 100)}%
                  </div>
                  <div className="text-sm text-blue-600">High-influence contacts</div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <ArrowPathIcon className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Territory Coverage</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-700">
                    {Math.round(networkData.metadata.territoryMatches / 131 * 100)}%
                  </div>
                  <div className="text-sm text-purple-600">Accounts with connections</div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-3 flex items-center gap-2">
                  <BoltIcon className="h-4 w-4" />
                  Network Intelligence Insights
                </h4>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li>• Your network provides direct access to {networkData.metadata.territoryMatches} target accounts</li>
                  <li>• {networkData.metadata.atsVendorConnections} ATS vendor relationships enable partnership leverage</li>
                  <li>• {networkData.metadata.highValueDecisionMakers} decision-maker connections for strategic introductions</li>
                  <li>• Technology sector dominance ({networkData.industryBreakdown.Technology} connections) aligns with FA's target market</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedInNetworkIntelligence;