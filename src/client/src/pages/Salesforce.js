import React, { useState, useEffect } from 'react';
import {
  CloudArrowUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function Salesforce() {
  const [status, setStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [recentExports, setRecentExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchStatus();
    fetchHealth();
    fetchRecentExports();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/salesforce/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch Salesforce status:', error);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/salesforce/health');
      const data = await response.json();
      if (data.success) {
        setHealth(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    }
  };

  const fetchRecentExports = async () => {
    try {
      const response = await fetch('/api/salesforce/recent-exports');
      const data = await response.json();
      if (data.success) {
        setRecentExports(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recent exports:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncNow = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/salesforce/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          objectTypes: ['Account', 'Contact', 'Opportunity']
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Sync completed successfully! Updated ${data.data.summary.accounts.updated + data.data.summary.contacts.updated + data.data.summary.opportunities.updated} records.`);
        fetchStatus();
        fetchHealth();
      }
    } catch (error) {
      console.error('Failed to sync:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'healthy') return 'text-green-600 bg-green-100';
    if (status === 'warning') return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getFeatureStatusIcon = (status) => {
    if (status === 'active') return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    if (status === 'pending') return <ClockIcon className="h-4 w-4 text-yellow-500" />;
    return <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'exports', name: 'Export History', icon: DocumentArrowUpIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon }
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
          <h1 className="text-2xl font-bold text-gray-900">Salesforce Integration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Seamlessly export accounts and sync data with your CRM
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {status?.isConnected && (
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Connected to {status.orgName}</span>
            </div>
          )}
          <button
            onClick={syncNow}
            disabled={syncing}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              syncing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <CloudArrowUpIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Connection Status</h3>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(health?.status || 'healthy')}`}>
                  {status?.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <ArrowPathIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Last Sync</h3>
              <p className="text-sm text-gray-600">
                {status?.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <DocumentArrowUpIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">API Usage</h3>
              <p className="text-sm text-gray-600">
                {health?.apiCallsToday?.toLocaleString() || 0} / {health?.dailyLimit?.toLocaleString() || 0} calls
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${health?.utilizationPercent || 0}%` }}
                ></div>
              </div>
            </div>
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
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {selectedTab === 'overview' && (
          <>
            {/* Connection Details */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Connection Details</h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Organization</dt>
                    <dd className="text-sm text-gray-900">{status?.orgName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">User</dt>
                    <dd className="text-sm text-gray-900">{status?.userName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">API Version</dt>
                    <dd className="text-sm text-gray-900">v{status?.apiVersion}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Organization ID</dt>
                    <dd className="text-sm text-gray-900 font-mono">{status?.orgId}</dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Status */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Integration Features</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {Object.entries(health?.features || {}).map(([feature, info]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFeatureStatusIcon(info.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {info.lastUsed ? `Last used: ${new Date(info.lastUsed).toLocaleString()}` : 'Never used'}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        info.status === 'active' ? 'bg-green-100 text-green-800' :
                        info.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {info.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{health?.uptime}</div>
                    <div className="text-sm text-gray-500">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{health?.avgResponseTime}ms</div>
                    <div className="text-sm text-gray-500">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{health?.connectionLatency}ms</div>
                    <div className="text-sm text-gray-500">Latency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{(health?.errorRate24h * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">Error Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'exports' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Exports</h3>
              <p className="text-sm text-gray-500">Account data exported to Salesforce</p>
            </div>
            <div className="divide-y divide-gray-200">
              {recentExports.map((exportItem) => (
                <div key={exportItem.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900">{exportItem.accountName}</h4>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Objects: {exportItem.objectsExported.join(', ')}</span>
                        <span>•</span>
                        <span>{exportItem.recordsCreated} records created</span>
                        <span>•</span>
                        <span>{new Date(exportItem.exportedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Exported by: {exportItem.exportedBy}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View in Salesforce
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Export Settings</h3>
                <p className="text-sm text-gray-500">Configure automatic export behavior</p>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Auto-export threshold</label>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                    <option value="85">85 - High priority accounts only</option>
                    <option value="75">75 - Medium priority and above</option>
                    <option value="60">60 - All developing accounts</option>
                    <option value="0">Never - Manual export only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sync frequency</label>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="manual">Manual only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Default opportunity stage</label>
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                    <option value="Prospecting">Prospecting</option>
                    <option value="Qualification">Qualification</option>
                    <option value="Needs Analysis">Needs Analysis</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Field Mapping</h3>
                <p className="text-sm text-gray-500">Customize how TheSalesSherpa data maps to Salesforce fields</p>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">TheSalesSherpa Field</label>
                      <input type="text" value="Urgency Score" disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salesforce Field</label>
                      <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                        <option value="TheSalesSherpa_Urgency_Score__c">TheSalesSherpa_Urgency_Score__c</option>
                        <option value="Priority__c">Priority__c</option>
                        <option value="Score__c">Score__c</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">TheSalesSherpa Field</label>
                      <input type="text" value="Connection Path" disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salesforce Field</label>
                      <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md">
                        <option value="TheSalesSherpa_Connection_Path__c">TheSalesSherpa_Connection_Path__c</option>
                        <option value="Notes">Notes</option>
                        <option value="Description">Description</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Update Mapping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}