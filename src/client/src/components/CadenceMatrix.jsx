import React, { useState, useEffect } from 'react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const CadenceMatrix = () => {
  const [accounts, setAccounts] = useState([]);
  const [expandedAccounts, setExpandedAccounts] = useState(new Set(['wpp-001', 'battelle-001']));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCadenceData();
  }, []);

  const fetchCadenceData = async () => {
    try {
      const response = await fetch('/api/cadence/matrix');
      const result = await response.json();
      
      if (result.success) {
        // Enhance with generated outreach history for demo
        const enhancedAccounts = result.data.map(account => ({
          ...account,
          contacts: account.contacts.map(contact => ({
            ...contact,
            outreachHistory: generateOutreachHistory(account.id, contact.id),
            lastEngagement: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000)
          }))
        }));
        setAccounts(enhancedAccounts);
      }
    } catch (error) {
      console.error('Error fetching cadence data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateOutreachHistory = (accountId, contactId) => {
    const touchTypes = ['email', 'linkedin', 'call', 'voicemail'];
    const subjects = [
      'Initial intro - FA capabilities',
      'Follow-up: Background screening trends',
      'Quick check-in',
      'Sharing relevant case study',
      'Video testimonial from similar client',
      'Industry report: Compliance updates',
      'LinkedIn connection request',
      'Voicemail: 2-minute overview'
    ];

    const history = [];
    const numTouches = Math.floor(Math.random() * 6) + 1;
    let currentDate = new Date();
    
    for (let i = 0; i < numTouches; i++) {
      currentDate = new Date(currentDate.getTime() - (Math.random() * 14 + 3) * 24 * 60 * 60 * 1000);
      const touchType = touchTypes[Math.floor(Math.random() * touchTypes.length)];
      
      history.push({
        id: `touch-${accountId}-${contactId}-${i}`,
        type: touchType,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        date: currentDate,
        outcome: Math.random() > 0.7 ? 'opened' : Math.random() > 0.4 ? 'no_response' : 'bounced',
        responseReceived: Math.random() > 0.85
      });
    }
    
    return history.sort((a, b) => b.date - a.date);
  };

  // generateNextAction removed - now provided by API

  const toggleAccount = (accountId) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'opened': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'bounced': return 'bg-red-100 text-red-800';
      case 'no_response': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'email': return EnvelopeIcon;
      case 'call': return PhoneIcon;
      case 'linkedin': return ChatBubbleLeftRightIcon;
      case 'voicemail': return PhoneIcon;
      case 'break': return ClockIcon;
      default: return EnvelopeIcon;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-slate-600 bg-slate-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const formatTimeAgo = (date) => {
    const days = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
                <ArrowPathIcon className="h-6 w-6 text-white" />
              </div>
              Cadence Matrix
            </h1>
            <p className="text-slate-600 mt-2">Account-level outreach orchestration • Track what you've sent to who • Strategize next moves</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500 mb-1">Active Sequences</div>
            <div className="text-3xl font-bold text-orange-600">{accounts.reduce((sum, acc) => sum + acc.contacts.length, 0)}</div>
          </div>
        </div>
      </div>

      {/* Cadence Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Account → Contact → Outreach Strategy</h2>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Sorted by urgency score</span>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                <span>High priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-orange-400 rounded-full"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-slate-400 rounded-full"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {accounts.map((account) => (
            <div key={account.id} className="hover:bg-slate-50">
              {/* Account Header */}
              <div 
                className="px-6 py-4 cursor-pointer"
                onClick={() => toggleAccount(account.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="p-1">
                      {expandedAccounts.has(account.id) ? 
                        <ChevronDownIcon className="h-5 w-5 text-slate-400" /> :
                        <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                      }
                    </button>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{account.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          account.urgencyScore >= 90 ? 'bg-red-100 text-red-700' :
                          account.urgencyScore >= 75 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {account.urgencyScore} urgency
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {account.contacts.length} contacts • {account.industry}
                        {account.ats && (
                          <span className="ml-2 text-blue-600 font-medium">
                            • ATS: {account.ats.currentATS.provider}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-sm text-slate-600">
                      <div className="font-medium">Last Activity</div>
                      <div>{formatTimeAgo(account.lastActivityAt)}</div>
                    </div>
                    <div className="text-sm text-slate-600">
                      <div className="font-medium">Stage</div>
                      <div className="capitalize">{account.status}</div>
                    </div>
                    {account.ats && account.ats.atsRep && (
                      <div className="text-sm text-slate-600">
                        <div className="font-medium">ATS Rep</div>
                        <div className="flex items-center gap-1">
                          <span>{account.ats.atsRep.name}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                            Warm Intro
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              {expandedAccounts.has(account.id) && (
                <div className="px-12 pb-6">
                  {account.contacts.map((contact) => (
                    <div key={contact.id} className="border border-slate-200 rounded-xl mb-4 bg-white shadow-sm">
                      {/* Contact Header */}
                      <div className="px-5 py-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserIcon className="h-8 w-8 text-slate-400" />
                            <div>
                              <h4 className="font-semibold text-slate-900">{contact.name}</h4>
                              <p className="text-sm text-slate-600">{contact.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-sm text-slate-600 text-right">
                              <div className="font-medium">Cadence Stage</div>
                              <div className="text-orange-600 font-semibold">Touch {contact.cadenceStage}</div>
                            </div>
                            <div className="text-sm text-slate-600 text-right">
                              <div className="font-medium">Response Rate</div>
                              <div className={`font-semibold ${contact.responseRate > 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.round(contact.responseRate * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Outreach History & Next Action */}
                      <div className="p-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Recent Outreach History */}
                          <div>
                            <h5 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                              <ClockIcon className="h-4 w-4 text-slate-500" />
                              Recent Outreach
                            </h5>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {contact.outreachHistory.slice(0, 5).map((touch) => {
                                const Icon = getActionIcon(touch.type);
                                return (
                                  <div key={touch.id} className="flex items-center justify-between text-sm py-2 px-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Icon className="h-4 w-4 text-slate-400" />
                                      <div>
                                        <div className="font-medium text-slate-900 capitalize">{touch.type}</div>
                                        <div className="text-slate-600 truncate max-w-64">{touch.subject}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={`text-xs px-2 py-1 rounded-full ${getOutcomeColor(touch.outcome)}`}>
                                        {touch.outcome.replace('_', ' ')}
                                      </span>
                                      <span className="text-slate-500">{formatTimeAgo(touch.date)}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Next Recommended Action */}
                          <div>
                            <h5 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                              <ArrowPathIcon className="h-4 w-4 text-orange-500" />
                              Next Action (AI Recommended)
                            </h5>
                            <div className="border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                              <div className="flex items-start gap-3">
                                {React.createElement(getActionIcon(contact.nextAction.type), { 
                                  className: "h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" 
                                })}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold text-slate-900 capitalize">{contact.nextAction.type}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(contact.nextAction.priority)}`}>
                                      {contact.nextAction.priority} priority
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-700 mb-3">{contact.nextAction.message}</p>
                                  <div className="flex items-center gap-4">
                                    <div className="text-xs text-slate-600 flex items-center gap-1">
                                      <CalendarIcon className="h-3 w-3" />
                                      Wait {contact.nextAction.daysWait} days
                                    </div>
                                    <div className="flex gap-2">
                                      <button className="text-xs bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition-colors">
                                        Execute Now
                                      </button>
                                      <button className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-lg hover:bg-slate-300 transition-colors">
                                        Schedule
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <EnvelopeIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">127</div>
              <div className="text-sm text-slate-600">Emails sent</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">23%</div>
              <div className="text-sm text-slate-600">Response rate</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">3.2</div>
              <div className="text-sm text-slate-600">Avg touches</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">12</div>
              <div className="text-sm text-slate-600">Overdue actions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadenceMatrix;