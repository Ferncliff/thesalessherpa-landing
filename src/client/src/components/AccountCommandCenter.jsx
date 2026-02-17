import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  LinkIcon,
  FireIcon,
  BoltIcon,
  EyeIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const AccountCommandCenter = () => {
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (accountId) {
      fetchAccountData(accountId);
    }
  }, [accountId]);

  const fetchAccountData = async (id) => {
    try {
      // Fetch account details with enhanced data
      const response = await fetch(`/api/accounts/${id}`);
      const result = await response.json();
      
      if (result.success) {
        // Enhance with command center data
        const enhancedAccount = {
          ...result.data,
          // Activity timeline (demo data for now)
          activityTimeline: generateActivityTimeline(result.data),
          // Penetration strategy
          penetrationStrategy: generatePenetrationStrategy(result.data),
          // Daily accountability for this account
          dailyCommitments: generateDailyCommitments(result.data),
          // Connection pathways
          connectionPathways: generateConnectionPathways(result.data)
        };
        
        setAccount(enhancedAccount);
      }
    } catch (error) {
      console.error('Error fetching account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateActivityTimeline = (account) => {
    const activities = [
      {
        id: 1,
        type: 'email',
        date: '2026-02-10',
        description: 'Sent value proposition email to decision maker',
        outcome: 'opened',
        nextAction: 'Follow up call in 3 days'
      },
      {
        id: 2,
        type: 'call',
        date: '2026-02-08',
        description: 'Discovery call with VP HR',
        outcome: 'positive',
        nextAction: 'Send case study document'
      },
      {
        id: 3,
        type: 'linkedin',
        date: '2026-02-05',
        description: 'Connected with CHRO on LinkedIn',
        outcome: 'accepted',
        nextAction: 'Warm message about ATS integration'
      },
      {
        id: 4,
        type: 'research',
        date: '2026-02-03',
        description: 'Identified ATS provider and rep contact',
        outcome: 'completed',
        nextAction: 'Reach out to ATS rep for warm intro'
      }
    ];
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const generatePenetrationStrategy = (account) => {
    return {
      currentStage: 'Discovery',
      confidence: 75,
      strategy: [
        {
          phase: 'Foundation',
          status: 'completed',
          actions: [
            '✅ Identified key stakeholders',
            '✅ Found ATS provider and rep contact',
            '✅ Mapped org structure'
          ]
        },
        {
          phase: 'Engagement',
          status: 'active',
          actions: [
            '🟡 Schedule discovery call with CHRO',
            '🟡 Get ATS rep warm introduction',
            '⚪ Present integration value prop'
          ]
        },
        {
          phase: 'Validation',
          status: 'pending',
          actions: [
            '⚪ Technical integration demo',
            '⚪ ROI calculation presentation',
            '⚪ Reference customer calls'
          ]
        },
        {
          phase: 'Closing',
          status: 'pending',
          actions: [
            '⚪ Proposal presentation',
            '⚪ Contract negotiation',
            '⚪ Implementation planning'
          ]
        }
      ],
      keyInsights: [
        'ATS contract expires Q4 2026 - renewal timing opportunity',
        'CHRO has strong relationship with ATS rep Sarah Johnson',
        'Company expanding rapidly - urgent need for screening automation',
        'Competitor (Sterling) pitched 6 months ago but no decision made'
      ],
      riskFactors: [
        'Budget approval process typically takes 4-6 months',
        'IT security review required for all new integrations',
        'Previous vendor relationship issues - trust will be key'
      ]
    };
  };

  const generateDailyCommitments = (account) => {
    return [
      {
        date: '2026-02-13',
        commitments: [
          { task: 'Follow up on discovery call', status: 'pending', priority: 'high' },
          { task: 'Research ATS integration pain points', status: 'completed', priority: 'medium' }
        ]
      },
      {
        date: '2026-02-12',
        commitments: [
          { task: 'Send case study to CHRO', status: 'skipped', priority: 'high' },
          { task: 'LinkedIn message to procurement lead', status: 'completed', priority: 'low' }
        ]
      },
      {
        date: '2026-02-11',
        commitments: [
          { task: 'Schedule technical demo', status: 'completed', priority: 'high' },
          { task: 'Update CRM with latest notes', status: 'completed', priority: 'medium' }
        ]
      }
    ];
  };

  const generateConnectionPathways = (account) => {
    return [
      {
        target: 'Sarah Johnson - CHRO',
        pathway: 'Matt → Tom Wilson (ATS Rep) → Sarah Johnson',
        strength: 'strong',
        notes: 'Tom Wilson worked with Sarah on their ATS implementation'
      },
      {
        target: 'Mike Chen - VP Engineering',
        pathway: 'Matt → Jennifer Davis (Workday) → Mike Chen',
        strength: 'medium',
        notes: 'Jennifer knows Mike from previous company'
      },
      {
        target: 'Lisa Rodriguez - Procurement',
        pathway: 'Matt → Alumni Network → Lisa Rodriguez',
        strength: 'weak',
        notes: 'Both attended Ohio State - use university connection'
      }
    ];
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'email': return EnvelopeIcon;
      case 'call': return PhoneIcon;
      case 'linkedin': return LinkIcon;
      case 'research': return EyeIcon;
      default: return DocumentTextIcon;
    }
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'opened': return 'text-blue-600 bg-blue-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'active': return 'text-orange-700 bg-orange-100';
      case 'pending': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getCommitmentStatus = (status) => {
    switch (status) {
      case 'completed': return { icon: CheckCircleIcon, color: 'text-green-600' };
      case 'pending': return { icon: ClockIcon, color: 'text-orange-600' };
      case 'skipped': return { icon: XCircleIcon, color: 'text-red-600' };
      default: return { icon: ClockIcon, color: 'text-gray-600' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Account not found</h3>
        <p className="text-slate-600">The requested account could not be loaded.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BuildingOfficeIcon },
    { id: 'timeline', name: 'Activity Timeline', icon: ClockIcon },
    { id: 'strategy', name: 'Penetration Strategy', icon: BoltIcon },
    { id: 'connections', name: 'Connection Pathways', icon: UserGroupIcon },
    { id: 'daily', name: 'Daily Accountability', icon: CalendarIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Account Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{account.name}</h1>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  account.urgencyScore >= 90 ? 'bg-red-100 text-red-700' :
                  account.urgencyScore >= 75 ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {account.urgencyScore} urgency
                </span>
                {account.ats && (
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                    ATS: {account.ats.currentATS.provider}
                  </span>
                )}
              </div>
              <div className="text-slate-600 mb-3">
                {account.industry} • {account.employeeCount?.toLocaleString() || '5,000+'} employees
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Stage:</span>
                  <span className="ml-2 capitalize">{account.penetrationStrategy?.currentStage}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Confidence:</span>
                  <span className="ml-2">{account.penetrationStrategy?.confidence}%</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Last Activity:</span>
                  <span className="ml-2">{new Date(account.lastActivityAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
              <PencilIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
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
                      ? 'border-orange-500 text-orange-600'
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-900">{account.fitScore}%</div>
                    <div className="text-sm text-slate-600">Fit Score</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-900">{account.engagementScore}%</div>
                    <div className="text-sm text-slate-600">Engagement Score</div>
                  </div>
                </div>
              </div>

              {/* ATS Intelligence */}
              {account.ats && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">ATS Intelligence</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm space-y-2">
                      <div><span className="font-medium">Provider:</span> {account.ats.currentATS.provider}</div>
                      <div><span className="font-medium">Contract Expires:</span> {account.ats.currentATS.contractExpiry}</div>
                      <div><span className="font-medium">Integration:</span> {account.ats.currentATS.integrationComplexity} complexity</div>
                      {account.ats.atsRep && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="font-medium text-blue-900 mb-1">Warm Intro Available</div>
                          <div>{account.ats.atsRep.name} - {account.ats.atsRep.title}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Activity Timeline</h3>
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1">
                  <PencilIcon className="h-4 w-4" />
                  Add Activity
                </button>
              </div>
              
              <div className="space-y-4">
                {account.activityTimeline.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex gap-4 p-4 border border-slate-200 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-orange-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-slate-900">{activity.description}</div>
                          <div className="text-sm text-slate-500">{activity.date}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${getOutcomeColor(activity.outcome)}`}>
                            {activity.outcome}
                          </span>
                          <span className="text-sm text-slate-600">{activity.nextAction}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Penetration Strategy Tab */}
          {activeTab === 'strategy' && account.penetrationStrategy && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Account Penetration Strategy</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Confidence:</span>
                  <span className="text-lg font-bold text-orange-600">{account.penetrationStrategy.confidence}%</span>
                </div>
              </div>

              {/* Strategy Phases */}
              <div className="space-y-4">
                {account.penetrationStrategy.strategy.map((phase, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900">{phase.phase}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(phase.status)}`}>
                        {phase.status}
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {phase.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="text-slate-700">{action}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Key Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-orange-600" />
                    Key Insights
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {account.penetrationStrategy.keyInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    Risk Factors
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {account.penetrationStrategy.riskFactors.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                        <span className="text-slate-700">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Connection Pathways Tab */}
          {activeTab === 'connections' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Warm Introduction Pathways</h3>
              
              <div className="space-y-4">
                {account.connectionPathways.map((pathway, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{pathway.target}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        pathway.strength === 'strong' ? 'bg-green-100 text-green-700' :
                        pathway.strength === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {pathway.strength} connection
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-2 font-mono bg-slate-50 px-3 py-2 rounded">
                      {pathway.pathway}
                    </div>
                    <div className="text-sm text-slate-700">{pathway.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Accountability Tab */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Daily Account Commitments</h3>
                <div className="text-sm text-slate-600">Last 3 days</div>
              </div>

              <div className="space-y-4">
                {account.dailyCommitments.map((day, dayIndex) => {
                  const skipped = day.commitments.filter(c => c.status === 'skipped').length;
                  const completed = day.commitments.filter(c => c.status === 'completed').length;
                  const pending = day.commitments.filter(c => c.status === 'pending').length;
                  
                  return (
                    <div key={dayIndex} className={`border rounded-lg p-4 ${
                      skipped > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-900">{day.date}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          {completed > 0 && (
                            <span className="text-green-600">{completed} completed</span>
                          )}
                          {pending > 0 && (
                            <span className="text-orange-600">{pending} pending</span>
                          )}
                          {skipped > 0 && (
                            <span className="text-red-600 font-medium">{skipped} SKIPPED</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {day.commitments.map((commitment, commitmentIndex) => {
                          const statusInfo = getCommitmentStatus(commitment.status);
                          const StatusIcon = statusInfo.icon;
                          
                          return (
                            <div key={commitmentIndex} className="flex items-center gap-3">
                              <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                              <span className="flex-1 text-sm text-slate-700">{commitment.task}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(commitment.priority)}`}>
                                {commitment.priority}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Accountability Pressure */}
              {account.dailyCommitments.some(day => day.commitments.some(c => c.status === 'skipped')) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <FireIcon className="h-5 w-5" />
                    <span className="font-medium">⚠️ ACCOUNTABILITY ALERT</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    You've skipped commitments on this account. Consistency wins deals - get back on track!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountCommandCenter;