import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlayIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserPlusIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const DailySherpaActionPlan = ({ compact = false }) => {
  const [actionPlan, setActionPlan] = useState(null);
  const [completedActions, setCompletedActions] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateDailyActionPlan();
  }, []);

  const generateDailyActionPlan = async () => {
    try {
      // For demo, generate intelligent action plan based on Matt's territory
      const plan = generateIntelligentActionPlan();
      setActionPlan(plan);
    } catch (error) {
      console.error('Error generating action plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateIntelligentActionPlan = () => {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    // High-value actions based on account intelligence
    const actions = [
      {
        id: 'wpp-sarah-call',
        type: 'call',
        priority: 'urgent',
        account: 'WPP',
        urgency: 95,
        contact: 'Sarah Johnson',
        title: 'CHRO',
        action: 'Discovery call about Workday integration',
        intelligence: 'Contract expires Q4 2026. Tom Wilson (Workday Partnership) confirmed they\'re evaluating alternatives.',
        talkingPoints: [
          'Reference Tom Wilson conversation about integration challenges',
          'Mention DOD compliance requirements they discussed',
          'Ask about current screening volume (estimated 50K+ annually)',
          'Position FA as Workday Platinum Partner advantage'
        ],
        expectedOutcome: 'Schedule technical demo for next week',
        timeBlock: '9:00 AM',
        duration: '30 min',
        workdayPartner: true
      },
      {
        id: 'battelle-mike-email',
        type: 'email',
        priority: 'high',
        account: 'Battelle',
        urgency: 92,
        contact: 'Mike Chen',
        title: 'VP Engineering',
        action: 'Send DOE compliance case study',
        intelligence: 'Works on classified DOE projects. Jennifer Davis (ATS rep) mentioned they need enhanced security clearance screening.',
        emailTemplate: {
          subject: 'DOE Security Clearance Screening - Northrop Grumman Case Study',
          keyPoints: [
            'Attach Northrop Grumman classified program case study',
            'Highlight 99.7% clearance accuracy rate',
            'Mention Jennifer Davis recommendation',
            'Reference similar DOE contractor challenges'
          ],
          cta: 'Would you be available for a brief call this week to discuss your specific clearance requirements?'
        },
        expectedOutcome: 'Demo request or meeting scheduled',
        timeBlock: '10:30 AM',
        duration: '15 min'
      },
      {
        id: 'uber-lisa-linkedin',
        type: 'linkedin',
        priority: 'high',
        account: 'Uber',
        urgency: 88,
        contact: 'Lisa Rodriguez',
        title: 'VP Procurement',
        action: 'LinkedIn connection with Ohio State mention',
        intelligence: 'Ohio State alumna (Go Buckeyes!). Currently evaluating new vendors for 31K employee screening.',
        messageTemplate: 'Hi Lisa, Fellow Buckeye here! 🌰 I noticed we both went to Ohio State - small world! I work with tech companies on scaling their background screening operations and thought there might be some interesting synergies to explore given Uber\'s rapid growth. Would you be open to a brief conversation?',
        expectedOutcome: 'Connection accepted + response',
        timeBlock: '2:00 PM',
        duration: '10 min',
        personalConnection: 'Ohio State Alumni'
      },
      {
        id: 'maximus-research',
        type: 'research',
        priority: 'medium',
        account: 'Maximus',
        urgency: 87,
        contact: 'TBD',
        title: 'Decision Maker Research',
        action: 'Identify CHRO and key stakeholders',
        intelligence: 'Government contractor with 30K employees. Recently won new HHS contract requiring enhanced screening.',
        researchTargets: [
          'Find current CHRO via LinkedIn',
          'Identify IT Security lead for compliance',
          'Research recent contract wins and hiring plans',
          'Check for existing FA relationships in network'
        ],
        expectedOutcome: 'Target contact list with warm intro paths',
        timeBlock: '3:30 PM',
        duration: '45 min'
      },
      {
        id: 'workday-partnership-check',
        type: 'partnership',
        priority: 'medium',
        account: 'Multiple',
        urgency: 85,
        contact: 'Tom Wilson',
        title: 'Workday Partnership Manager',
        action: 'Weekly partnership pipeline review',
        intelligence: 'Review 31 Workday platinum opportunities for co-selling potential.',
        agenda: [
          'Share WPP progress and next steps',
          'Identify new co-selling opportunities this week',
          'Discuss referral compensation for closed deals',
          'Plan joint customer success stories'
        ],
        expectedOutcome: 'New co-selling opportunities identified',
        timeBlock: '4:00 PM',
        duration: '30 min',
        partnershipValue: 'High - Platinum Partner'
      }
    ];

    return {
      date: today.toLocaleDateString(),
      dayName,
      totalActions: actions.length,
      urgentActions: actions.filter(a => a.priority === 'urgent').length,
      estimatedRevenue: '$850K', // Estimated pipeline value from these actions
      workdayPartnerActions: actions.filter(a => a.workdayPartner || a.type === 'partnership').length,
      actions,
      dailyGoals: {
        calls: 3,
        emails: 2,
        linkedinConnections: 1,
        researchAccounts: 1
      },
      strategicFocus: 'Workday Platinum Partner Advantage + Q4 Contract Renewals'
    };
  };

  const markActionComplete = (actionId) => {
    const newCompleted = new Set(completedActions);
    if (completedActions.has(actionId)) {
      newCompleted.delete(actionId);
    } else {
      newCompleted.add(actionId);
    }
    setCompletedActions(newCompleted);
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'call': return PhoneIcon;
      case 'email': return EnvelopeIcon;
      case 'linkedin': return UserPlusIcon;
      case 'research': return LightBulbIcon;
      case 'partnership': return TrophyIcon;
      default: return DocumentTextIcon;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getActionColor = (type, completed) => {
    if (completed) return 'bg-green-50 border-green-300';
    
    switch (type) {
      case 'call': return 'bg-blue-50 border-blue-200';
      case 'email': return 'bg-purple-50 border-purple-200';
      case 'linkedin': return 'bg-cyan-50 border-cyan-200';
      case 'research': return 'bg-yellow-50 border-yellow-200';
      case 'partnership': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!actionPlan) return null;

  if (compact) {
    const urgentActions = actionPlan.actions.filter(a => a.priority === 'urgent');
    const completedCount = actionPlan.actions.filter(a => completedActions.has(a.id)).length;
    
    return (
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <PlayIcon className="h-4 w-4 text-orange-600" />
            Today's Sherpa Plan
          </h3>
          <div className="text-sm text-slate-600">
            {completedCount}/{actionPlan.totalActions} complete
          </div>
        </div>
        
        {urgentActions.map(action => (
          <div key={action.id} className="mb-2 last:mb-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white font-bold">
                URGENT
              </span>
              <span className="font-medium">{action.account}</span>
              <span>•</span>
              <span>{action.action}</span>
            </div>
          </div>
        ))}
        
        <Link
          to="/fa/mattedwards/daily"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-2 inline-block"
        >
          View Full Action Plan →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Daily Focus */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              🎯 Daily Sherpa Action Plan
              <FireIcon className="h-6 w-6" />
            </h2>
            <p className="text-orange-100 mt-1">
              {actionPlan.dayName} • {actionPlan.date} • Strategic Focus: {actionPlan.strategicFocus}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{actionPlan.estimatedRevenue}</div>
            <div className="text-orange-100 text-sm">Pipeline Value at Risk</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">{actionPlan.totalActions}</div>
            <div className="text-orange-100 text-sm">Action Items</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">{actionPlan.urgentActions}</div>
            <div className="text-orange-100 text-sm">Urgent Priority</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">{actionPlan.workdayPartnerActions}</div>
            <div className="text-orange-100 text-sm">Workday Partner</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">
              {Math.round((completedActions.size / actionPlan.totalActions) * 100)}%
            </div>
            <div className="text-orange-100 text-sm">Completed</div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="space-y-4">
        {actionPlan.actions.map((action, index) => {
          const ActionIcon = getActionIcon(action.type);
          const isCompleted = completedActions.has(action.id);
          
          return (
            <div 
              key={action.id}
              className={`border rounded-xl p-6 transition-all ${getActionColor(action.type, isCompleted)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <ActionIcon className="h-5 w-5 text-slate-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${getPriorityColor(action.priority)}`}>
                        {action.priority.toUpperCase()}
                      </span>
                      <span className="font-semibold text-slate-900">{action.account}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        {action.urgency} urgency
                      </span>
                      {action.workdayPartner && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500 text-white">
                          🥇 Workday Partner
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {action.contact} - {action.title}
                    </h3>
                    <p className="text-slate-700 mb-3">{action.action}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-sm text-slate-600">
                    <div>{action.timeBlock}</div>
                    <div>{action.duration}</div>
                  </div>
                  <button
                    onClick={() => markActionComplete(action.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Intelligence Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <LightBulbIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-900 text-sm mb-1">🧠 Sherpa Intelligence</div>
                    <p className="text-blue-800 text-sm">{action.intelligence}</p>
                  </div>
                </div>
              </div>

              {/* Specific Action Details */}
              {action.talkingPoints && (
                <div className="mb-4">
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <BoltIcon className="h-4 w-4" />
                    Talking Points
                  </h4>
                  <ul className="space-y-1 text-sm text-slate-700">
                    {action.talkingPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {action.emailTemplate && (
                <div className="mb-4">
                  <h4 className="font-medium text-slate-900 mb-2">📧 Email Template</h4>
                  <div className="bg-white border border-slate-200 rounded p-3 text-sm">
                    <div className="font-medium mb-1">Subject: {action.emailTemplate.subject}</div>
                    <div className="text-slate-600 mb-2">Key points to include:</div>
                    <ul className="space-y-1 text-slate-700 mb-2">
                      {action.emailTemplate.keyPoints.map((point, idx) => (
                        <li key={idx}>• {point}</li>
                      ))}
                    </ul>
                    <div className="font-medium text-slate-900">CTA: {action.emailTemplate.cta}</div>
                  </div>
                </div>
              )}

              {action.messageTemplate && (
                <div className="mb-4">
                  <h4 className="font-medium text-slate-900 mb-2">💼 LinkedIn Message</h4>
                  <div className="bg-white border border-slate-200 rounded p-3 text-sm">
                    <p className="text-slate-700 italic">"{action.messageTemplate}"</p>
                  </div>
                </div>
              )}

              {/* Expected Outcome */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>Expected: {action.expectedOutcome}</span>
                </div>
                <Link
                  to={`/fa/mattedwards/accounts/${action.account.toLowerCase()}/command`}
                  className="text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors"
                >
                  Command Center
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailySherpaActionPlan;