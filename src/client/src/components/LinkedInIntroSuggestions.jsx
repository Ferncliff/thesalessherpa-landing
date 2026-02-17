import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlusIcon,
  ArrowRightIcon,
  LightBulbIcon,
  EnvelopeIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const LinkedInIntroSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedSuggestions, setCompletedSuggestions] = useState(new Set());

  useEffect(() => {
    generateIntroSuggestions();
  }, []);

  const generateIntroSuggestions = async () => {
    try {
      // For VP demo, generate intelligent intro suggestions based on Matt's territory
      const demoSuggestions = generateDemoSuggestions();
      setSuggestions(demoSuggestions);
    } catch (error) {
      console.error('Error generating intro suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoSuggestions = () => {
    return [
      {
        id: 'intro-wpp-1',
        priority: 'urgent',
        targetAccount: 'WPP',
        targetContact: 'Sarah Chen',
        targetTitle: 'VP Marketing Technology',
        mutualConnection: 'Mike Torres',
        mutualConnectionTitle: 'Director, HR Systems at WPP',
        relationshipStrength: 85,
        accountUrgency: 95,
        reasoning: 'Mike Torres has worked with Sarah Chen on multiple technology implementations. Strong relationship, high likelihood of warm introduction.',
        suggestedMessage: `Hi Mike! Hope you're doing well. I've been working with some great companies on HR technology integrations and came across some insights that might be valuable for Sarah Chen's marketing tech initiatives at WPP. Would you be comfortable making a brief introduction? I think there could be some interesting synergies to explore.`,
        expectedOutcome: 'Warm introduction to VP Marketing Technology',
        atsContext: 'WPP uses Workday - leverage platinum partnership angle',
        timeframe: 'This week',
        successProbability: 78
      },
      {
        id: 'intro-battelle-1',
        priority: 'high',
        targetAccount: 'Battelle',
        targetContact: 'Dr. Jennifer Walsh',
        targetTitle: 'VP Human Resources',
        mutualConnection: 'David Chen',
        mutualConnectionTitle: 'Senior Director at Battelle',
        relationshipStrength: 72,
        accountUrgency: 92,
        reasoning: 'David Chen has collaborated with Dr. Walsh on several strategic initiatives. Both focused on workforce expansion for DOE contracts.',
        suggestedMessage: `Hi David! I've been following Battelle's growth and saw some interesting opportunities around workforce screening for DOE contracts. I'd love to share some insights with Dr. Walsh about how other defense contractors are handling security clearance processes. Would you be open to facilitating a brief introduction?`,
        expectedOutcome: 'Meeting with VP HR about DOE screening',
        atsContext: 'Uses iCIMS - we have rep Jennifer Davis for support',
        timeframe: 'Next 2 weeks',
        successProbability: 71
      },
      {
        id: 'intro-uber-1',
        priority: 'high',
        targetAccount: 'Uber',
        targetContact: 'Lisa Rodriguez',
        targetTitle: 'VP Procurement',
        mutualConnection: 'Amanda Foster',
        mutualConnectionTitle: 'Ohio State Alumni Network',
        relationshipStrength: 68,
        accountUrgency: 88,
        reasoning: 'Both Matt and Lisa are Ohio State alumni. Amanda Foster coordinates alumni networking events and knows Lisa personally.',
        suggestedMessage: `Hi Amanda! Hope the Buckeyes are treating you well! 🌰 I'm reaching out through our OSU network - I've been working with some tech companies on scaling their background screening operations. I noticed Lisa Rodriguez (VP Procurement at Uber) is also a fellow Buckeye. Would you be comfortable making an introduction? I think there might be some interesting synergies given Uber's rapid growth.`,
        expectedOutcome: 'Alumni connection leads to procurement discussion',
        atsContext: 'Scaling challenges with current vendor - perfect timing',
        timeframe: 'This month',
        successProbability: 65
      },
      {
        id: 'intro-workday-partner-1',
        priority: 'high',
        targetAccount: 'Multiple Workday Accounts',
        targetContact: 'Tom Wilson',
        targetTitle: 'Enterprise Partnership Manager at Workday',
        mutualConnection: 'Jennifer Stevens',
        mutualConnectionTitle: 'Sales Director at First Advantage',
        relationshipStrength: 90,
        accountUrgency: 85,
        reasoning: 'Jennifer Stevens has worked directly with Tom Wilson on multiple partnership deals. Platinum partner relationship needs activation.',
        suggestedMessage: `Hi Jennifer! Hope things are going great in your new role. I wanted to reconnect with Tom Wilson at Workday about activating our platinum partnership for some key accounts in my territory. I know you've worked with Tom successfully - would you mind making a quick introduction? I have some specific co-selling opportunities that could benefit both companies.`,
        expectedOutcome: 'Platinum partnership activation meeting',
        atsContext: '31 Workday accounts in territory - huge co-selling potential',
        timeframe: 'ASAP',
        successProbability: 88
      },
      {
        id: 'intro-maximus-1',
        priority: 'medium',
        targetAccount: 'Maximus',
        targetContact: 'Robert Kim',
        targetTitle: 'CHRO',
        mutualConnection: 'Dr. Patricia Lane',
        mutualConnectionTitle: 'Healthcare Consultant',
        relationshipStrength: 65,
        accountUrgency: 87,
        reasoning: 'Dr. Lane has consulted for Maximus on workforce planning. Robert Kim trusts her strategic insights on HR technology.',
        suggestedMessage: `Hi Dr. Lane! I've been working with government contractors on workforce screening solutions and came across some insights that might be valuable for Maximus, especially with their new HHS contract. Would you be comfortable introducing me to Robert Kim? I think there could be some strategic value given their expansion plans.`,
        expectedOutcome: 'CHRO meeting about HHS contract screening needs',
        atsContext: 'Government contractor - compliance focus critical',
        timeframe: 'Next month',
        successProbability: 62
      }
    ];
  };

  const markSuggestionCompleted = (suggestionId) => {
    const newCompleted = new Set(completedSuggestions);
    if (completedSuggestions.has(suggestionId)) {
      newCompleted.delete(suggestionId);
    } else {
      newCompleted.add(suggestionId);
    }
    setCompletedSuggestions(newCompleted);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return FireIcon;
      case 'high': return StarIcon;
      case 'medium': return LightBulbIcon;
      default: return ClockIcon;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <UserPlusIcon className="h-8 w-8" />
              LinkedIn Introduction Suggestions
            </h1>
            <p className="text-blue-100 mt-1">AI-powered warm intro opportunities from your network</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{suggestions.length}</div>
            <div className="text-blue-100 text-sm">Active Suggestions</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xl font-bold">{suggestions.filter(s => s.priority === 'urgent').length}</div>
            <div className="text-blue-100 text-sm">Urgent Priority</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xl font-bold">{suggestions.filter(s => s.successProbability >= 75).length}</div>
            <div className="text-blue-100 text-sm">High Success Rate</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xl font-bold">{suggestions.filter(s => s.relationshipStrength >= 80).length}</div>
            <div className="text-blue-100 text-sm">Strong Relationships</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-xl font-bold">{completedSuggestions.size}</div>
            <div className="text-blue-100 text-sm">Actions Taken</div>
          </div>
        </div>
      </div>

      {/* Introduction Suggestions */}
      <div className="space-y-4">
        {suggestions.map((suggestion) => {
          const PriorityIcon = getPriorityIcon(suggestion.priority);
          const isCompleted = completedSuggestions.has(suggestion.id);
          
          return (
            <div 
              key={suggestion.id}
              className={`border rounded-2xl p-6 transition-all ${
                isCompleted ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
                      <UserPlusIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority.toUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                        {suggestion.accountUrgency} urgency
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                        {suggestion.successProbability}% success probability
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {suggestion.targetAccount}: {suggestion.targetContact}
                    </h3>
                    <p className="text-slate-600">{suggestion.targetTitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => markSuggestionCompleted(suggestion.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircleIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Introduction Pathway */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <ArrowRightIcon className="h-4 w-4" />
                  Warm Introduction Pathway
                </h4>
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-white border border-blue-300 rounded px-3 py-2">
                    <span className="font-medium text-blue-900">You</span>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-blue-600" />
                  <div className="bg-white border border-blue-300 rounded px-3 py-2">
                    <span className="font-medium text-blue-900">{suggestion.mutualConnection}</span>
                    <div className="text-xs text-blue-700">{suggestion.mutualConnectionTitle}</div>
                    <div className="text-xs text-green-700">{suggestion.relationshipStrength}/100 strength</div>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-blue-600" />
                  <div className="bg-white border border-blue-300 rounded px-3 py-2">
                    <span className="font-medium text-blue-900">{suggestion.targetContact}</span>
                    <div className="text-xs text-blue-700">{suggestion.targetTitle}</div>
                  </div>
                </div>
              </div>

              {/* Strategic Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="font-medium text-yellow-900 mb-1 flex items-center gap-2">
                    <LightBulbIcon className="h-4 w-4" />
                    Why This Works
                  </div>
                  <p className="text-sm text-yellow-800">{suggestion.reasoning}</p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="font-medium text-orange-900 mb-1 flex items-center gap-2">
                    <StarIcon className="h-4 w-4" />
                    ATS Intelligence
                  </div>
                  <p className="text-sm text-orange-800">{suggestion.atsContext}</p>
                </div>
              </div>

              {/* Suggested Message */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4" />
                    Suggested LinkedIn Message
                  </h4>
                  <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    Copy Message
                  </button>
                </div>
                <div className="bg-white border border-slate-200 rounded p-3">
                  <p className="text-sm text-slate-700 italic">"{suggestion.suggestedMessage}"</p>
                </div>
              </div>

              {/* Expected Outcome & Timing */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Expected: {suggestion.expectedOutcome}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>Timeline: {suggestion.timeframe}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/fa/mattedwards/accounts/${suggestion.targetAccount.toLowerCase()}/command`}
                    className="text-sm bg-slate-200 text-slate-700 px-3 py-1 rounded hover:bg-slate-300"
                  >
                    Account Command Center
                  </Link>
                  <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    Send Introduction Request
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Tips */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <LightBulbIcon className="h-5 w-5" />
          💡 LinkedIn Introduction Best Practices
        </h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li>• <strong>Keep it brief:</strong> Respect your mutual connection's time with concise requests</li>
          <li>• <strong>Provide context:</strong> Explain the potential value for both parties</li>
          <li>• <strong>Make it easy:</strong> Give your connection everything they need to make the introduction</li>
          <li>• <strong>Follow up gracefully:</strong> Thank connections regardless of the outcome</li>
          <li>• <strong>Leverage timing:</strong> Use industry events, news, or company changes as natural conversation starters</li>
        </ul>
      </div>
    </div>
  );
};

export default LinkedInIntroSuggestions;