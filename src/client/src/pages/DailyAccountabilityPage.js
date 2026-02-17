import React, { useState } from 'react';
import {
  CalendarIcon,
  BuildingOfficeIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import DailyAccountability from '../components/DailyAccountability';
import DailySherpaActionPlan from '../components/DailySherpaActionPlan';

const DailyAccountabilityPage = () => {
  const [activeView, setActiveView] = useState('sherpa-plan');
  const [showAddCommitment, setShowAddCommitment] = useState(false);

  // Sample data for different views
  const accountCommitments = [
    { id: 'wpp-001', name: 'WPP', urgency: 95, pendingTasks: 3, skippedTasks: 1 },
    { id: 'battelle-001', name: 'Battelle', urgency: 92, pendingTasks: 2, skippedTasks: 0 },
    { id: 'uber-001', name: 'Uber', urgency: 88, pendingTasks: 1, skippedTasks: 2 },
    { id: 'maximus-001', name: 'Maximus', urgency: 87, pendingTasks: 4, skippedTasks: 0 }
  ];

  const morningBriefing = {
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    totalCommitments: 12,
    highPriority: 5,
    accountsRequiringAttention: 3,
    streak: 4,
    keyTasks: [
      'Follow up with WPP CHRO on proposal',
      'Schedule Battelle technical demo',
      'Send Uber case studies',
      'Research Maximus decision makers'
    ],
    urgentAlerts: [
      'Uber: 2 commitments skipped yesterday - get back on track!',
      'WPP contract decision expected this week'
    ]
  };

  const tabs = [
    { id: 'sherpa-plan', name: 'Sherpa Action Plan', icon: FireIcon },
    { id: 'overview', name: 'Commitment Tracking', icon: CalendarIcon },
    { id: 'accounts', name: 'By Account', icon: BuildingOfficeIcon },
    { id: 'history', name: 'Performance History', icon: ChartBarIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            Daily Sherpa Action System
          </h1>
          <p className="text-slate-600 mt-2">
            Your daily sheet of music • Prescriptive actions • Research-backed strategies • Answers to the test
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500 mb-1">Current Streak</div>
          <div className="text-3xl font-bold text-orange-600 flex items-center gap-2">
            <FireIcon className="h-8 w-8" />
            {morningBriefing.streak}
          </div>
        </div>
      </div>

      {/* Morning Briefing */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClockIcon className="h-6 w-6 text-orange-600" />
            Morning Briefing - {morningBriefing.date}
          </h2>
          <div className="text-sm text-slate-600">
            {morningBriefing.highPriority} high-priority tasks today
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="text-2xl font-bold text-slate-900">{morningBriefing.totalCommitments}</div>
            <div className="text-sm text-slate-600">Total Commitments</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <div className="text-2xl font-bold text-red-600">{morningBriefing.highPriority}</div>
            <div className="text-sm text-slate-600">High Priority</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{morningBriefing.accountsRequiringAttention}</div>
            <div className="text-sm text-slate-600">Accounts Needing Attention</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{morningBriefing.streak}</div>
            <div className="text-sm text-slate-600">Day Streak</div>
          </div>
        </div>

        {/* Key Tasks */}
        <div className="mb-4">
          <h3 className="font-semibold text-slate-900 mb-2">🎯 Today's Key Tasks</h3>
          <ul className="space-y-1">
            {morningBriefing.keyTasks.map((task, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                {task}
              </li>
            ))}
          </ul>
        </div>

        {/* Urgent Alerts */}
        {morningBriefing.urgentAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              🚨 Urgent Alerts
            </h3>
            <ul className="space-y-1">
              {morningBriefing.urgentAlerts.map((alert, index) => (
                <li key={index} className="text-sm text-red-800">• {alert}</li>
              ))}
            </ul>
          </div>
        )}
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
                  onClick={() => setActiveView(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeView === tab.id
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
          {/* Sherpa Action Plan Tab */}
          {activeView === 'sherpa-plan' && (
            <DailySherpaActionPlan compact={false} />
          )}

          {/* Overview Tab */}
          {activeView === 'overview' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Today's Sales Commitments</h3>
                <button 
                  onClick={() => setShowAddCommitment(true)}
                  className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Commitment
                </button>
              </div>
              <DailyAccountability compact={false} />
            </div>
          )}

          {/* By Account Tab */}
          {activeView === 'accounts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Account-Specific Commitments</h3>
                <div className="text-sm text-slate-600">
                  {accountCommitments.length} active accounts
                </div>
              </div>
              
              <div className="space-y-4">
                {accountCommitments.map((account) => (
                  <div 
                    key={account.id} 
                    className={`border rounded-lg p-4 ${
                      account.skippedTasks > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-slate-900">{account.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          account.urgency >= 90 ? 'bg-red-100 text-red-700' :
                          account.urgency >= 75 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {account.urgency} urgency
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        {account.pendingTasks > 0 && (
                          <span className="text-orange-600">{account.pendingTasks} pending</span>
                        )}
                        {account.skippedTasks > 0 && (
                          <span className="text-red-600 font-medium">{account.skippedTasks} skipped</span>
                        )}
                        <button className="text-orange-600 hover:text-orange-700 font-medium">
                          View Command Center →
                        </button>
                      </div>
                    </div>
                    
                    {account.skippedTasks > 0 && (
                      <div className="bg-red-100 border border-red-200 rounded p-3">
                        <div className="text-red-800 text-sm">
                          ⚠️ {account.skippedTasks} commitment{account.skippedTasks > 1 ? 's' : ''} skipped on this account. 
                          Consistency builds trust with prospects!
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeView === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Performance History</h3>
              <DailyAccountability compact={false} />
              
              {/* Additional Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <TrophyIcon className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="text-lg font-semibold text-slate-900">89%</div>
                      <div className="text-sm text-slate-600">30-Day Completion Rate</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-lg font-semibold text-slate-900">7</div>
                      <div className="text-sm text-slate-600">Best Streak (Days)</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="text-lg font-semibold text-slate-900">3</div>
                      <div className="text-sm text-slate-600">Days Skipped This Month</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Commitment Modal */}
      {showAddCommitment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Daily Commitment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="What do you commit to doing today?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account (Optional)</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">General Task</option>
                  <option value="wpp-001">WPP</option>
                  <option value="battelle-001">Battelle</option>
                  <option value="uber-001">Uber</option>
                  <option value="maximus-001">Maximus</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAddCommitment(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddCommitment(false)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                Add Commitment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyAccountabilityPage;