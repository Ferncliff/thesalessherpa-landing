import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  NewspaperIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  LinkIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [relationships, setRelationships] = useState(null);
  const [insights, setInsights] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountData();
    fetchRelationships();
    fetchInsights();
    fetchNews();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAccountData = async () => {
    try {
      const response = await fetch(`/api/accounts/${id}`);
      const data = await response.json();
      if (data.success) {
        setAccount(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch account data:', error);
    }
  };

  const fetchRelationships = async () => {
    try {
      const response = await fetch(`/api/accounts/${id}/relationships`);
      const data = await response.json();
      if (data.success) {
        setRelationships(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch relationships:', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await fetch(`/api/intelligence/insights/${id}`);
      const data = await response.json();
      if (data.success) {
        setInsights(data.data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await fetch(`/api/intelligence/news/${id}`);
      const data = await response.json();
      if (data.success) {
        setNews(data.data.news);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToSalesforce = async () => {
    try {
      const response = await fetch(`/api/salesforce/export/${id}`, {
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
        alert(`Successfully exported ${account.name} to Salesforce!`);
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

  const getSeparationColor = (degree) => {
    if (degree === 1) return 'bg-green-100 text-green-800';
    if (degree === 2) return 'bg-yellow-100 text-yellow-800';
    if (degree <= 4) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-800';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Account not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The account you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/accounts" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/accounts"
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Accounts
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{account.name}</h1>
            <p className="text-sm text-gray-600">{account.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium border ${getUrgencyColor(account.urgencyScore)}`}>
            Urgency: {account.urgencyScore}/100
          </div>
          <button
            onClick={exportToSalesforce}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <CloudArrowUpIcon className="h-4 w-4 mr-2" />
            Export to Salesforce
          </button>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Industry</dt>
              <dd className="text-sm text-gray-900">{account.industry}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Revenue</dt>
              <dd className="text-sm text-gray-900">{account.revenue}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Employees</dt>
              <dd className="text-sm text-gray-900">{account.employees}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Headquarters</dt>
              <dd className="text-sm text-gray-900">{account.headquarters}</dd>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <a 
              href={account.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              {account.website}
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Contacts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Key Contacts ({account.contacts?.length || 0})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {account.contacts?.map((contact) => (
              <div key={contact.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{contact.name}</h4>
                    <p className="text-sm text-gray-600">{contact.title}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        <a href={`mailto:${contact.email}`} className="hover:text-blue-600">{contact.email}</a>
                      </div>
                      <div className="flex items-center">
                        <LinkIcon className="h-4 w-4 mr-1" />
                        <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                          LinkedIn
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeparationColor(contact.separationDegree)}`}>
                      {contact.separationDegree}° separation
                    </span>
                  </div>
                </div>
                
                {/* Connection Path */}
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Connection path:</span> {contact.connectionPath}
                  </p>
                </div>

                {/* Influence Scores */}
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget Influence:</span>
                    <span className="font-medium">{contact.influence.budget}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Technical Influence:</span>
                    <span className="font-medium">{contact.influence.technical}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Relationship Influence:</span>
                    <span className="font-medium">{contact.influence.relationship}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Urgency Influence:</span>
                    <span className="font-medium">{contact.influence.urgency}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights & Alerts */}
        <div className="space-y-6">
          {/* Active Alerts */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Active Alerts ({account.alerts?.length || 0})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {account.alerts?.map((alert, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 h-3 w-3 rounded-full ${
                      alert.urgency === 'high' ? 'bg-red-500' :
                      alert.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 capitalize">{alert.type}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">AI-Powered Insights</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {insights.map((insight, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                          {insight.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{insight.type}</span>
                      </div>
                      <p className="text-sm text-gray-900 mt-2">{insight.insight}</p>
                      <p className="text-sm font-medium text-blue-600 mt-2">{insight.action}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(insight.confidence * 100)}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* News & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent News */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <NewspaperIcon className="h-5 w-5 mr-2" />
              Recent News ({news.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {news.map((article, index) => (
              <div key={index} className="px-6 py-4">
                <h4 className="text-sm font-medium text-gray-900">{article.headline}</h4>
                <p className="text-xs text-gray-500 mt-1">{article.source} • {new Date(article.publishedAt).toLocaleDateString()}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    article.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    article.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {article.sentiment} • {Math.round(article.relevance * 100)}% relevant
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{article.implications}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Activity Timeline ({account.activities?.length || 0})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {account.activities?.map((activity, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-start space-x-3">
                  <div className={`mt-1 h-3 w-3 rounded-full ${
                    activity.type === 'email' ? 'bg-blue-500' :
                    activity.type === 'call' ? 'bg-green-500' :
                    activity.type === 'demo' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 capitalize">{activity.type}</p>
                      <span className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.subject}</p>
                    <p className="text-xs text-gray-500 mt-1">Contact: {activity.contact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}