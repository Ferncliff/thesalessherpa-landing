/**
 * TheSalesSherpa Dashboard
 * 
 * Enterprise-grade sales intelligence dashboard featuring:
 * - Real-time urgency scoring
 * - Priority action recommendations
 * - Relationship network visualization
 * - Signal alerts
 * - Performance analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  FireIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  SparklesIcon,
  LinkIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface DashboardData {
  totalAccounts: number;
  highPriorityAccounts: number;
  totalAlerts: number;
  averageUrgencyScore: number;
  topActions: Action[];
  recentActivities: Activity[];
  weeklyStats: WeeklyStats;
}

interface Action {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  action: string;
  account: string;
  deadline: string;
  contactName?: string;
  successProbability?: number;
}

interface Activity {
  message: string;
  type: 'alert' | 'news' | 'activity';
  timestamp: string;
}

interface WeeklyStats {
  newOpportunities: number;
  completedActivities: number;
  introductionsRequested: number;
  responseRate: number;
}

interface Alert {
  id: string;
  type: string;
  message: string;
  urgency: string;
  accountId: string;
  accountName: string;
  timestamp: string;
  sourceUrl?: string;
}

interface Account {
  id: string;
  name: string;
  urgencyScore: number;
  priorityLabel: string;
  priorityColor: string;
  industry?: string;
  contacts: any[];
  alerts: any[];
}

const API_BASE = process.env.REACT_APP_API_URL || '';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [topAccounts, setTopAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const [dashboardRes, alertsRes, accountsRes] = await Promise.all([
        fetch(`${API_BASE}/api/intelligence/dashboard`),
        fetch(`${API_BASE}/api/intelligence/alerts`),
        fetch(`${API_BASE}/api/accounts`)
      ]);

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        if (data.success) {
          setDashboardData(data.data);
        }
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        if (data.success) {
          setAlerts(data.data.slice(0, 5));
        }
      }

      if (accountsRes.ok) {
        const data = await accountsRes.json();
        if (data.success) {
          setTopAccounts(data.data.slice(0, 5));
        }
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 minutes
    const refreshTimer = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(refreshTimer);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-red-600">
          <XCircleIcon className="h-12 w-12 mx-auto mb-4" />
          <p>{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); fetchDashboardData(); }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Accounts',
      value: dashboardData?.totalAccounts || 0,
      change: '+2 this week',
      changeType: 'positive' as const,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'High Priority',
      value: dashboardData?.highPriorityAccounts || 0,
      change: 'Need attention',
      changeType: 'warning' as const,
      icon: FireIcon,
      color: 'bg-orange-500'
    },
    {
      name: 'Active Alerts',
      value: dashboardData?.totalAlerts || 0,
      change: '2 urgent',
      changeType: 'negative' as const,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500'
    },
    {
      name: 'Avg Urgency Score',
      value: dashboardData?.averageUrgencyScore || 0,
      change: '+5% this week',
      changeType: 'positive' as const,
      icon: ChartBarIcon,
      color: 'bg-green-500'
    }
  ];

  const getAlertIcon = (urgency: string) => {
    if (urgency === 'high') return '🔴';
    if (urgency === 'medium') return '🟡';
    return '🟢';
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return styles[priority] || styles.medium;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-red-600';
    if (score >= 75) return 'text-orange-500';
    if (score >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-red-100';
    if (score >= 75) return 'bg-orange-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <SparklesIcon className="h-7 w-7 text-blue-600" />
                Sales Intelligence Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Your AI guide through the sales wilderness • Last updated: {currentTime.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Response Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((dashboardData?.weeklyStats?.responseRate || 0) * 100)}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-xl p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <div className="flex items-baseline mt-1">
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        stat.changeType === 'positive' ? 'bg-green-100 text-green-700' :
                        stat.changeType === 'negative' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {stat.changeType === 'positive' && '↑'} {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Priority Actions - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Priority Actions</h3>
                  </div>
                  <span className="text-sm text-gray-500">AI-recommended next steps</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {dashboardData?.topActions?.map((action, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getPriorityBadge(action.priority)}`}>
                        {action.priority.toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {action.action}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <BuildingOfficeIcon className="h-3.5 w-3.5" />
                            {action.account}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            Due: {new Date(action.deadline).toLocaleDateString()}
                          </span>
                          {action.successProbability && (
                            <span className="flex items-center gap-1 text-green-600">
                              <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
                              {Math.round(action.successProbability * 100)}% success rate
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 rounded-b-xl">
                <Link to="/intelligence" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View all recommendations
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Top Accounts Quick View */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100 mt-8">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FireIcon className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Hot Accounts</h3>
                  </div>
                  <span className="text-sm text-gray-500">Ranked by urgency score</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {topAccounts.map((account, index) => (
                  <Link
                    key={account.id}
                    to={`/accounts/${account.id}`}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 text-gray-700 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{account.name}</p>
                          <p className="text-sm text-gray-500">{account.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(account.urgencyScore)}`}>
                            {account.urgencyScore}
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getScoreBg(account.urgencyScore)} ${getScoreColor(account.urgencyScore)}`}>
                            {account.priorityLabel}
                          </span>
                        </div>
                        <ArrowRightIcon className="h-5 w-5 text-gray-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 rounded-b-xl">
                <Link to="/accounts" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View all accounts
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Alerts & Stats */}
          <div className="space-y-8">
            {/* Active Alerts */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Active Signals</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Real-time intelligence</p>
              </div>
              <div className="divide-y divide-gray-100">
                {alerts.map((alert) => (
                  <div key={alert.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{getAlertIcon(alert.urgency)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{alert.accountName}</p>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(alert.timestamp).toLocaleDateString()} at{' '}
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 rounded-b-xl">
                <Link to="/intelligence" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  View all signals →
                </Link>
              </div>
            </div>

            {/* Weekly Performance */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                    New Opportunities
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {dashboardData?.weeklyStats?.newOpportunities}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                    Activities Completed
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {dashboardData?.weeklyStats?.completedActivities}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-purple-500" />
                    Intros Requested
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {dashboardData?.weeklyStats?.introductionsRequested}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Response Rate</span>
                    <span className="text-2xl font-bold text-green-600">
                      {Math.round((dashboardData?.weeklyStats?.responseRate || 0) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(dashboardData?.weeklyStats?.responseRate || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {dashboardData?.recentActivities?.slice(0, 4).map((activity, index) => (
                  <div key={index} className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        activity.type === 'alert' ? 'bg-red-500' :
                        activity.type === 'news' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{activity.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Historical Performance Banner */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ChartBarIcon className="h-6 w-6" />
                  2025 Performance Tracking
                </h3>
                <p className="text-indigo-100 mt-1">
                  View Matt's historical sales activities and demonstrate proven track record
                </p>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">20 Total Outreach</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">45% Completion Rate</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">35% Follow-up Rate</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Link
                  to="/fa/mattedwards/historical"
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  View 2025 Activities
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions CTA */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="text-xl font-bold">Ready to take action?</h3>
                <p className="text-blue-100 mt-1">
                  View your prioritized account list or explore relationship opportunities
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  to="/accounts"
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
                >
                  <BuildingOfficeIcon className="h-5 w-5" />
                  View Accounts
                </Link>
                <Link
                  to="/relationships"
                  className="bg-blue-500/30 text-white border border-white/30 px-6 py-3 rounded-xl font-semibold hover:bg-blue-500/50 transition-colors flex items-center gap-2"
                >
                  <UsersIcon className="h-5 w-5" />
                  Explore Relationships
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
