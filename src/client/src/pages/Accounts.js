import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FireIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CalendarIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('urgency');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      const data = await response.json();
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToSalesforce = async (accountId) => {
    try {
      const response = await fetch(`/api/salesforce/export/${accountId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          includeContacts: true,
          includeOpportunity: true,
          includeTasks: true
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Successfully exported ${data.data.exported.account.name} to Salesforce!`);
      }
    } catch (error) {
      console.error('Failed to export to Salesforce:', error);
      alert('Failed to export to Salesforce. Please try again.');
    }
  };

  const getUrgencyColor = (score) => {
    if (score >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 75) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getUrgencyIcon = (score) => {
    if (score >= 90) return <FireIcon className="h-4 w-4" />;
    if (score >= 75) return <ExclamationTriangleIcon className="h-4 w-4" />;
    return <ClockIcon className="h-4 w-4" />;
  };

  const getPriorityEmoji = (priority) => {
    if (priority === 'HOT') return '🔴';
    if (priority === 'WARM') return '🟠';
    if (priority === 'DEVELOPING') return '🟡';
    return '🟢';
  };

  const getSeparationDegreeColor = (degree) => {
    if (degree === 1) return 'text-green-600 bg-green-100';
    if (degree === 2) return 'text-yellow-600 bg-yellow-100';
    if (degree <= 4) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const filteredAccounts = accounts.filter(account => {
    if (filterBy === 'all') return true;
    if (filterBy === 'hot') return account.urgencyScore >= 90;
    if (filterBy === 'warm') return account.urgencyScore >= 75 && account.urgencyScore < 90;
    if (filterBy === 'developing') return account.urgencyScore < 75;
    return true;
  });

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (sortBy === 'urgency') return b.urgencyScore - a.urgencyScore;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'activity') return new Date(b.lastActivity) - new Date(a.lastActivity);
    return 0;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Account Intelligence</h1>
          <p className="mt-2 text-sm text-gray-600">
            AI-prioritized accounts ranked by urgency and opportunity
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {filteredAccounts.length} accounts • Avg score: {Math.round(accounts.reduce((sum, acc) => sum + acc.urgencyScore, 0) / accounts.length)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex space-x-4">
          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Filter</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="all">All Accounts</option>
              <option value="hot">🔴 Hot (90+)</option>
              <option value="warm">🟠 Warm (75-89)</option>
              <option value="developing">🟡 Developing (&lt;75)</option>
            </select>
          </div>
          
          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="urgency">Urgency Score</option>
              <option value="name">Company Name</option>
              <option value="activity">Last Activity</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {sortedAccounts.map((account) => (
          <div key={account.id} className="bg-white shadow rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="px-6 py-4">
              {/* Header Row */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                    <div>
                      <Link 
                        to={`/accounts/${account.id}`}
                        className="text-xl font-bold text-gray-900 hover:text-blue-600"
                      >
                        {account.name}
                      </Link>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">{account.industry}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{account.employees}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{account.revenue}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Urgency Score */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(account.urgencyScore)}`}>
                  {getUrgencyIcon(account.urgencyScore)}
                  <span className="ml-1">{account.urgencyScore}/100</span>
                  <span className="ml-2">{getPriorityEmoji(account.priority)}</span>
                </div>
              </div>

              {/* Content Row */}
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Key Contacts */}
                <div className="lg:col-span-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    Key Contacts ({account.contacts?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {account.contacts?.slice(0, 2).map((contact) => (
                      <div key={contact.id} className="flex items-center space-x-2">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeparationDegreeColor(contact.separationDegree)}`}>
                          {contact.separationDegree}°
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                          <p className="text-xs text-gray-500 truncate">{contact.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Alerts */}
                <div className="lg:col-span-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Active Alerts ({account.alerts?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {account.alerts?.slice(0, 2).map((alert, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className={`mt-0.5 h-2 w-2 rounded-full ${
                          alert.urgency === 'high' ? 'bg-red-500' :
                          alert.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Activity
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last contact:</span>
                      <span className="text-gray-900">{new Date(account.lastActivity).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Next action:</span>
                      <span className={account.nextAction === 'OVERDUE' ? 'text-red-600 font-medium' : 'text-gray-900'}>
                        {account.nextAction === 'OVERDUE' ? 'OVERDUE' : new Date(account.nextAction).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total activities:</span>
                      <span className="text-gray-900">{account.activities?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <Link
                    to={`/fa/mattedwards/accounts/${account.id}/command`}
                    className="inline-flex items-center px-3 py-1.5 border border-orange-300 text-xs font-medium rounded text-orange-700 bg-orange-50 hover:bg-orange-100"
                  >
                    🎯 Command Center
                  </Link>
                  <Link
                    to={`/accounts/${account.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/relationships/paths/${account.contacts?.[0]?.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Warm Intro
                  </Link>
                </div>
                <button
                  onClick={() => exportToSalesforce(account.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                >
                  <CloudArrowUpIcon className="h-4 w-4 mr-1" />
                  Export to Salesforce
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedAccounts.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
}