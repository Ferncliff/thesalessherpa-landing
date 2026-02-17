import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  LinkIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ATSIntelligence = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProvider, setFilterProvider] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  useEffect(() => {
    fetchATSData();
  }, []);

  const fetchATSData = async () => {
    try {
      const response = await fetch('/api/accounts');
      const result = await response.json();
      
      if (result.success) {
        // Filter accounts that have ATS data
        const accountsWithATS = result.data.filter(account => account.ats);
        setAccounts(accountsWithATS);
      }
    } catch (error) {
      console.error('Error fetching ATS data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique ATS providers for filter
  const atsProviders = [...new Set(accounts.map(acc => acc.ats?.currentATS?.provider).filter(Boolean))];

  // Filter and sort accounts
  const filteredAccounts = accounts
    .filter(account => filterProvider === 'all' || account.ats?.currentATS?.provider === filterProvider)
    .sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          return (b.urgencyScore || 0) - (a.urgencyScore || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'ats':
          return a.ats?.currentATS?.provider?.localeCompare(b.ats?.currentATS?.provider) || 0;
        case 'complexity':
          const complexityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return (complexityOrder[b.ats?.currentATS?.integrationComplexity] || 0) - 
                 (complexityOrder[a.ats?.currentATS?.integrationComplexity] || 0);
        default:
          return 0;
      }
    });

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSatisfactionColor = (satisfaction) => {
    switch (satisfaction) {
      case 'High': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getContractUrgency = (contractExpiry) => {
    if (!contractExpiry) return null;
    
    const expiryDate = new Date(contractExpiry);
    const now = new Date();
    const monthsDiff = (expiryDate - now) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsDiff < 6) return 'urgent';
    if (monthsDiff < 12) return 'approaching';
    return 'stable';
  };

  const formatContractExpiry = (contractExpiry) => {
    if (!contractExpiry) return 'Unknown';
    const date = new Date(contractExpiry);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
            ATS Intelligence
          </h1>
          <p className="text-slate-600 mt-2">Applicant Tracking System provider intelligence • Find warm intro opportunities through ATS vendor relationships</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500 mb-1">ATS Providers Identified</div>
          <div className="text-3xl font-bold text-blue-600">{atsProviders.length}</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <LinkIcon className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-lg font-semibold text-slate-900">
                {accounts.filter(acc => acc.ats?.atsRep).length}
              </div>
              <div className="text-sm text-slate-600">Warm Intro Opportunities</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-lg font-semibold text-slate-900">
                {accounts.filter(acc => getContractUrgency(acc.ats?.currentATS?.contractExpiry) === 'urgent').length}
              </div>
              <div className="text-sm text-slate-600">Contracts Expiring Soon</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-lg font-semibold text-slate-900">
                {accounts.filter(acc => acc.ats?.currentATS?.integrationComplexity === 'High').length}
              </div>
              <div className="text-sm text-slate-600">High-Complexity Integrations</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-lg font-semibold text-slate-900">{accounts.length}</div>
              <div className="text-sm text-slate-600">Total ATS Accounts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">ATS Provider:</label>
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-1 bg-white"
            >
              <option value="all">All Providers</option>
              {atsProviders.sort().map(provider => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-1 bg-white"
            >
              <option value="urgency">Urgency Score</option>
              <option value="name">Company Name</option>
              <option value="ats">ATS Provider</option>
              <option value="complexity">Integration Complexity</option>
            </select>
          </div>
          <div className="text-sm text-slate-600">
            {filteredAccounts.length} of {accounts.length} accounts
          </div>
        </div>
      </div>

      {/* ATS Accounts List */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <h2 className="text-lg font-semibold text-slate-900">Account ATS Intelligence</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {filteredAccounts.map((account) => {
            const ats = account.ats;
            const contractUrgency = getContractUrgency(ats?.currentATS?.contractExpiry);
            
            const isWorkdayPlatinum = ats?.partnerStatus === 'PLATINUM' && ats?.currentATS?.provider === 'Workday';
            
            return (
              <div key={account.id} className={`px-6 py-4 hover:bg-slate-50 ${
                isWorkdayPlatinum ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400' : ''
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {isWorkdayPlatinum && (
                        <div className="flex items-center gap-1">
                          <TrophyIcon className="h-4 w-4 text-yellow-500" />
                          <StarIcon className="h-4 w-4 text-yellow-500" />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-slate-900">{account.name}</h3>
                      {isWorkdayPlatinum && (
                        <span className="text-xs px-2 py-1 rounded-full font-bold bg-yellow-500 text-white">
                          🥇 PLATINUM PARTNER
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        account.urgencyScore >= 90 ? 'bg-red-100 text-red-700' :
                        account.urgencyScore >= 75 ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {account.urgencyScore} urgency
                      </span>
                      {contractUrgency === 'urgent' && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">
                          Contract Expiring Soon
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-slate-700">ATS Provider</div>
                        <div className="text-slate-900">{ats.currentATS.provider}</div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">Integration Complexity</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(ats.currentATS.integrationComplexity)}`}>
                          {ats.currentATS.integrationComplexity}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">Satisfaction</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSatisfactionColor(ats.currentATS.satisfactionLevel)}`}>
                          {ats.currentATS.satisfactionLevel}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">Contract Expires</div>
                        <div className={`${contractUrgency === 'urgent' ? 'text-red-600 font-medium' : 'text-slate-900'}`}>
                          {formatContractExpiry(ats.currentATS.contractExpiry)}
                        </div>
                      </div>
                    </div>

                    {/* ATS Rep Information */}
                    {ats.atsRep && (
                      <div className={`mt-4 p-3 rounded-lg border ${
                        isWorkdayPlatinum 
                          ? 'bg-yellow-50 border-yellow-300' 
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {isWorkdayPlatinum ? (
                                <TrophyIcon className="h-4 w-4 text-yellow-600" />
                              ) : (
                                <UserIcon className="h-4 w-4 text-green-600" />
                              )}
                              <span className={`font-medium ${
                                isWorkdayPlatinum ? 'text-yellow-900' : 'text-green-900'
                              }`}>
                                {isWorkdayPlatinum ? 'Workday Partnership Rep' : 'ATS Rep Available'}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isWorkdayPlatinum 
                                  ? 'bg-yellow-500 text-white font-bold' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {isWorkdayPlatinum ? '🤝 Co-Selling Available' : 'Warm Intro Opportunity'}
                              </span>
                            </div>
                            <div className={`text-sm ${
                              isWorkdayPlatinum ? 'text-yellow-800' : 'text-green-800'
                            }`}>
                              <div className="font-medium">{ats.atsRep.name}</div>
                              <div>{ats.atsRep.title}</div>
                              {isWorkdayPlatinum && ats.atsRep.coSellingEnabled && (
                                <div className="text-xs font-medium text-yellow-900 mt-1">
                                  ⚡ Referral compensation enabled
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={`mailto:${ats.atsRep.email}`}
                              className={`p-2 rounded-lg transition-colors ${
                                isWorkdayPlatinum 
                                  ? 'text-yellow-600 hover:bg-yellow-100' 
                                  : 'text-green-600 hover:bg-green-100'
                              }`}
                              title={isWorkdayPlatinum ? "Email Workday Partnership Rep" : "Email ATS Rep"}
                            >
                              <EnvelopeIcon className="h-4 w-4" />
                            </a>
                            <a
                              href={`tel:${ats.atsRep.phone}`}
                              className={`p-2 rounded-lg transition-colors ${
                                isWorkdayPlatinum 
                                  ? 'text-yellow-600 hover:bg-yellow-100' 
                                  : 'text-green-600 hover:bg-green-100'
                              }`}
                              title={isWorkdayPlatinum ? "Call Workday Partnership Rep" : "Call ATS Rep"}
                            >
                              <PhoneIcon className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Integration Notes */}
                    {ats.integrationNotes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <div className="h-4 w-4 bg-blue-500 rounded-full flex-shrink-0 mt-0.5"></div>
                          <div>
                            <div className="text-sm font-medium text-blue-900 mb-1">Integration Intelligence</div>
                            <div className="text-sm text-blue-800">{ats.integrationNotes}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredAccounts.length === 0 && !loading && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No ATS data found</h3>
          <p className="text-slate-600">
            {filterProvider === 'all' 
              ? 'No accounts have ATS intelligence data yet.'
              : `No accounts found with ${filterProvider} as their ATS provider.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ATSIntelligence;