import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  FireIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowRightIcon,
  UsersIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import WarmIntroIntelligence from '../components/WarmIntroIntelligence';
import DailySherpaActionPlan from '../components/DailySherpaActionPlan';
import WorkdayPlatinumIntelligence from '../components/WorkdayPlatinumIntelligence';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchAlerts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/intelligence/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/intelligence/alerts');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data.slice(0, 3)); // Show only top 3 alerts
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="h-16 w-16">
          <img src="/images/sherps-icon.svg" alt="Sherps Loading" className="h-full w-full animate-pulse" />
        </div>
        <div className="loading-spinner h-8 w-8"></div>
        <p className="text-slate-500 font-medium">Sherps is gathering your sales intelligence...</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Accounts',
      value: dashboardData?.totalAccounts || 0,
      change: '+2 this week',
      changeType: 'positive',
      icon: BuildingOfficeIcon
    },
    {
      name: 'High Priority',
      value: dashboardData?.highPriorityAccounts || 0,
      change: 'Need attention',
      changeType: 'warning',
      icon: FireIcon
    },
    {
      name: 'Active Alerts',
      value: dashboardData?.totalAlerts || 0,
      change: '2 urgent',
      changeType: 'negative',
      icon: ExclamationTriangleIcon
    },
    {
      name: 'Avg Urgency Score',
      value: dashboardData?.averageUrgencyScore || 0,
      change: '+5% this week',
      changeType: 'positive',
      icon: ChartBarIcon
    }
  ];

  const getAlertIcon = (urgency) => {
    if (urgency === 'high') return '🔴';
    if (urgency === 'medium') return '🟡';
    return '🟢';
  };

  return (
    <div className="space-y-6">
      {/* Sherps Welcome Header */}
      <div className="card-premium p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            <div className="h-20 w-20 flex-shrink-0">
              <img 
                src="/images/sherps-mascot.svg" 
                alt="Sherps - Your Sales Guide" 
                className="h-full w-full"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent">
                  Welcome back, Matt!
                </h1>
                <div className="sherps-badge">Sherps Active</div>
              </div>
              <p className="text-lg text-slate-700 font-medium mb-3">
                🎯 I've been monitoring your sales territory while you were away
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-600">Last updated:</span>
                  <span className="font-semibold text-orange-600">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-600">Response Rate:</span>
                  <span className="font-bold text-green-600 text-lg">73% ↗️</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-100 border border-green-200">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-700">All Systems Go</span>
            </div>
          </div>
        </div>
        
        {/* Sherps Insights */}
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 flex-shrink-0">
              <img src="/images/sherps-icon.svg" alt="Sherps Insight" className="h-full w-full opacity-80" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900 mb-1">🧠 Sherps Intelligence Summary</h3>
              <p className="text-orange-800 text-sm leading-relaxed">
                I've identified <strong>3 urgent opportunities</strong> that need your attention today, 
                discovered <strong>2 new warm connections</strong> at target accounts, and found 
                <strong>5 perfect timing signals</strong> for outreach. Ready to climb some sales mountains? 🏔️
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.name} className="card group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 p-3 rounded-2xl ${
                    index === 0 ? 'bg-blue-100 text-blue-600' :
                    index === 1 ? 'bg-orange-100 text-orange-600' :
                    index === 2 ? 'bg-red-100 text-red-600' :
                    'bg-green-100 text-green-600'
                  } group-hover:scale-110 transition-transform duration-200`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <dl>
                      <dt className="text-sm font-semibold text-slate-600 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline space-x-2">
                        <div className="text-2xl font-bold text-slate-900">
                          {stat.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className={`mt-3 flex items-center text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {stat.changeType === 'positive' && <ArrowUpIcon className="h-4 w-4 mr-1" />}
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workday Platinum Partner Intelligence */}
      <WorkdayPlatinumIntelligence />

      {/* LinkedIn Network Intelligence Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <UsersIcon className="h-6 w-6 text-blue-600" />
              🔗 LinkedIn Network Activated
            </h2>
            <p className="text-slate-600 mt-1">Complete relationship mapping from 1,038 connections</p>
          </div>
          <Link
            to="/fa/mattedwards/network"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Network →
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-xl font-bold text-blue-600">131</div>
            <div className="text-sm text-slate-600">Territory Matches</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="text-xl font-bold text-purple-600">8</div>
            <div className="text-sm text-slate-600">ATS Vendors</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="text-xl font-bold text-green-600">456</div>
            <div className="text-sm text-slate-600">Decision Makers</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <div className="text-xl font-bold text-orange-600">87%</div>
            <div className="text-sm text-slate-600">Territory Coverage</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <div className="text-sm text-blue-800">
            <span className="font-medium">🎯 Game Changer:</span> Direct connections to every major account in your territory. 
            Partnership relationships with Workday, iCIMS, and SAP reps for instant warm introductions.
          </div>
        </div>
      </div>

      {/* LinkedIn Introduction Suggestions Preview */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <UserPlusIcon className="h-6 w-6 text-purple-600" />
              🤝 Smart Introduction Suggestions
            </h2>
            <p className="text-slate-600 mt-1">"Hey Matt - looks like Sarah Chen is connected to Mike Torres..."</p>
          </div>
          <Link
            to="/fa/mattedwards/intros"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            View All Suggestions →
          </Link>
        </div>
        
        <div className="space-y-3">
          <div className="bg-white border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white font-bold">URGENT</span>
                <span className="font-semibold text-slate-900">WPP: Sarah Chen</span>
                <span className="text-sm text-slate-600">via Mike Torres</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">78% success rate</span>
            </div>
            <p className="text-sm text-slate-600">Mike Torres has worked with Sarah Chen on multiple tech implementations. Perfect warm intro opportunity for Workday partnership angle.</p>
          </div>
          
          <div className="bg-white border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-white font-bold">HIGH</span>
                <span className="font-semibold text-slate-900">Battelle: Dr. Jennifer Walsh</span>
                <span className="text-sm text-slate-600">via David Chen</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">71% success rate</span>
            </div>
            <p className="text-sm text-slate-600">David Chen collaborated with Dr. Walsh on DOE contract workforce planning. Strong relationship for security clearance screening discussion.</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-purple-100 border border-purple-300 rounded-lg">
          <div className="text-sm text-purple-800">
            <span className="font-medium">🎯 AI-Powered Intelligence:</span> Analyzing your 1,038 connections to identify the highest-probability warm introduction pathways with suggested messaging for each opportunity.
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sherps Priority Actions */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8">
                <img src="/images/sherps-icon.svg" alt="Sherps Actions" className="h-full w-full" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">🎯 Priority Actions</h3>
                <p className="text-sm text-slate-600">Sherps' AI-recommended next steps ranked by impact</p>
              </div>
            </div>
          </div>
          <div className="card-body space-y-4">
            {dashboardData?.topActions?.map((action, index) => (
              <div key={index} className="group flex items-start space-x-4 p-4 rounded-xl bg-slate-50 hover:bg-orange-50 transition-colors duration-200 border border-transparent hover:border-orange-200">
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                  action.priority === 'urgent' ? 'status-hot' : 
                  action.priority === 'high' ? 'status-warm' : 'status-developing'
                }`}>
                  {action.priority.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-orange-900">
                    {action.action}
                  </p>
                  <div className="mt-1 flex items-center space-x-4 text-xs text-slate-600">
                    <span className="font-medium">Account: {action.account}</span>
                    <span>Due: {new Date(action.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-slate-400 group-hover:text-orange-500 transition-colors duration-200" />
              </div>
            ))}
          </div>
          <div className="px-8 py-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-orange-50">
            <Link to="/intelligence" className="btn-secondary text-sm">
              View all Sherps recommendations →
            </Link>
          </div>
        </div>

        {/* Sherps Active Alerts */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 text-orange-500 animate-pulse">
                🚨
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Live Alerts</h3>
                <p className="text-sm text-slate-600">Sherps' real-time intelligence signals</p>
              </div>
            </div>
          </div>
          <div className="card-body space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="group p-3 rounded-xl bg-slate-50 hover:bg-red-50 transition-colors duration-200 border border-transparent hover:border-red-200">
                <div className="flex items-start space-x-3">
                  <span className="text-lg flex-shrink-0">{getAlertIcon(alert.urgency)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-red-900">
                      {alert.accountName}
                    </p>
                    <p className="text-sm text-slate-600 group-hover:text-red-800 mt-1">
                      {alert.message}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-200">
            <Link to="/intelligence" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all alerts →
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Accountability Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DailySherpaActionPlan compact={true} />
        </div>
        
        {/* Recent Activity & Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest platform updates</p>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData?.recentActivities?.map((activity, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.type === 'alert' ? 'bg-red-500' :
                    activity.type === 'news' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Performance */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">This Week's Performance</h3>
            <p className="text-sm text-gray-500">Key metrics and progress</p>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Opportunities</span>
              <span className="text-lg font-semibold text-gray-900">{dashboardData?.weeklyStats?.newOpportunities}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Activities Completed</span>
              <span className="text-lg font-semibold text-gray-900">{dashboardData?.weeklyStats?.completedActivities}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Introductions Requested</span>
              <span className="text-lg font-semibold text-gray-900">{dashboardData?.weeklyStats?.introductionsRequested}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Response Rate</span>
              <span className="text-lg font-semibold text-green-600">
                {Math.round(dashboardData?.weeklyStats?.responseRate * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Warm Introduction Intelligence */}
      <div className="mb-8">
        <WarmIntroIntelligence userId="mattedwards" />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Ready to take action?</h3>
              <p className="text-blue-100">View your prioritized account list or explore relationship opportunities</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/accounts"
                className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                View Accounts
              </Link>
              <Link
                to="/relationships"
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-400 transition-colors"
              >
                Explore Relationships
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}