import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  NewspaperIcon,
  ChartBarIcon,
  FireIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

export default function Intelligence() {
  const [alerts, setAlerts] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('alerts');

  useEffect(() => {
    fetchAlerts();
    fetchDashboardData();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/intelligence/alerts');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/intelligence/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (urgency) => {
    if (urgency === 'high') return <FireIcon className="h-5 w-5 text-red-500" />;
    if (urgency === 'medium') return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    return <ClockIcon className="h-5 w-5 text-blue-500" />;
  };

  const getAlertBadge = (urgency) => {
    if (urgency === 'high') return 'bg-red-100 text-red-800';
    if (urgency === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'urgent') return 'border-l-red-500 bg-red-50';
    if (priority === 'high') return 'border-l-orange-500 bg-orange-50';
    if (priority === 'medium') return 'border-l-yellow-500 bg-yellow-50';
    return 'border-l-blue-500 bg-blue-50';
  };

  const tabs = [
    { id: 'alerts', name: 'Active Alerts', icon: BellAlertIcon, count: alerts.length },
    { id: 'insights', name: 'AI Insights', icon: LightBulbIcon, count: dashboardData?.actionableInsights || 0 },
    { id: 'trends', name: 'Market Trends', icon: ArrowTrendingUpIcon, count: 8 },
    { id: 'scoring', name: 'Urgency Scoring', icon: ChartBarIcon, count: 3 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI-Powered Intelligence</h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time signals, predictive insights, and automated alerts across your portfolio
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">High Priority Alerts</p>
              <p className="text-2xl font-bold">{alerts.filter(a => a.urgency === 'high').length}</p>
            </div>
            <FireIcon className="h-8 w-8 text-red-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Medium Priority</p>
              <p className="text-2xl font-bold">{alerts.filter(a => a.urgency === 'medium').length}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Avg Urgency Score</p>
              <p className="text-2xl font-bold">{dashboardData?.averageUrgencyScore || 0}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Active Insights</p>
              <p className="text-2xl font-bold">{dashboardData?.actionableInsights || 0}</p>
            </div>
            <LightBulbIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {selectedTab === 'alerts' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Active Alerts</h3>
              <p className="text-sm text-gray-500">Real-time intelligence signals requiring attention</p>
            </div>
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <div key={alert.id} className="px-6 py-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getAlertIcon(alert.urgency)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Link 
                              to={`/accounts/${alert.accountId}`}
                              className="text-lg font-medium text-gray-900 hover:text-blue-600"
                            >
                              {alert.accountName}
                            </Link>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAlertBadge(alert.urgency)}`}>
                              {alert.urgency.toUpperCase()}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {alert.actionRequired && alert.suggestedActions && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900">Suggested Actions:</h4>
                          <ul className="mt-2 space-y-1">
                            {alert.suggestedActions.map((action, index) => (
                              <li key={index} className="flex items-center space-x-2 text-sm text-blue-800">
                                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'insights' && (
          <div className="space-y-6">
            {dashboardData?.topActions?.map((action, index) => (
              <div key={index} className={`border-l-4 p-6 ${getPriorityColor(action.priority)} rounded-r-lg`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                        {action.priority}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{action.account}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">{action.action}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Deadline: {new Date(action.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'trends' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Market Intelligence Trends</h3>
              <p className="text-sm text-gray-500">Industry patterns and market signals</p>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900">AI Technology Adoption Surge</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Enterprise AI spending increased 45% Q4 2025, creating urgency in sales intelligence tools
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Opportunity
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <NewspaperIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900">Budget Cycle Alignment</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Q1 budget approvals show 78% allocation for sales productivity tools
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Timing
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900">Competitive Landscape Shift</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Monaco pricing pressure creating opportunity for mid-market alternatives
                    </p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        Market Gap
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'scoring' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Urgency Scoring System</h3>
              <p className="text-sm text-gray-500">AI-powered 95/100 scoring methodology</p>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-base font-medium text-blue-900">How Our 95/100 Scoring Works</h4>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-800">Budget Cycle Signals</span>
                      <span className="text-sm font-medium text-blue-800">30% weight</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-800">Financial Health Indicators</span>
                      <span className="text-sm font-medium text-blue-800">25% weight</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-800">News & Market Events</span>
                      <span className="text-sm font-medium text-blue-800">20% weight</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-800">Hiring & Growth Patterns</span>
                      <span className="text-sm font-medium text-blue-800">15% weight</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-800">Competitive Pressure</span>
                      <span className="text-sm font-medium text-blue-800">10% weight</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">90-100</div>
                    <div className="text-sm text-red-800">HOT</div>
                    <div className="text-xs text-red-600 mt-1">Immediate action required</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">75-89</div>
                    <div className="text-sm text-yellow-800">WARM</div>
                    <div className="text-xs text-yellow-600 mt-1">High priority contact</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">&lt;75</div>
                    <div className="text-sm text-green-800">NURTURE</div>
                    <div className="text-xs text-green-600 mt-1">Long-term development</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}