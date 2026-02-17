/**
 * TheSalesSherpa Account Detail Page
 * 
 * Enterprise-grade account intelligence view featuring:
 * - Urgency score breakdown with visual gauges
 * - Contact relationship mapping
 * - Signal alerts timeline
 * - Activity history
 * - Salesforce export functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  BoltIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Account {
  id: string;
  name: string;
  industry: string;
  companySize: string;
  employeeCount: number;
  annualRevenue: number;
  website: string;
  description: string;
  headquarters: {
    city: string;
    state: string;
    country: string;
  };
  urgencyScore: number;
  fitScore: number;
  engagementScore: number;
  status: string;
  priorityLabel: string;
  priorityColor: string;
  lastActivityAt: string;
  contacts: Contact[];
  alerts: Alert[];
  activities: Activity[];
  scoringBreakdown: ScoringBreakdown;
}

interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  separationDegree: number;
  influence: {
    budget: number;
    technical: number;
    relationship: number;
    urgency: number;
  };
  lastContacted?: string;
}

interface Alert {
  id: string;
  type: string;
  message: string;
  urgency: string;
  createdAt: string;
  sourceUrl?: string;
}

interface Activity {
  type: string;
  subject: string;
  date: string;
  outcome?: string;
}

interface ScoringBreakdown {
  overall: number;
  timing: { score: number; maxScore: number; factors: Factor[] };
  company: { score: number; maxScore: number; factors: Factor[] };
  relationship: { score: number; maxScore: number; factors: Factor[] };
  engagement: { score: number; maxScore: number; factors: Factor[] };
  fit: { score: number; maxScore: number; factors: Factor[] };
  competitive: { score: number; maxScore: number; factors: Factor[] };
  factors: Factor[];
}

interface Factor {
  name: string;
  points: number;
  maxPoints: number;
  description: string;
  category: string;
}

interface RelationshipPath {
  contactId: string;
  contactName: string;
  contactTitle: string;
  degrees: number;
  path: PathHop[];
  confidence: number;
  introSuccessRate: number;
  suggestedMessage: string;
}

interface PathHop {
  nodeId: string;
  name: string;
  title?: string;
  company?: string;
  connectionStrength?: number;
  relationshipContext?: string;
}

const API_BASE = process.env.REACT_APP_API_URL || '';

export default function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [relationships, setRelationships] = useState<RelationshipPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'signals' | 'activity'>('overview');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showIntroModal, setShowIntroModal] = useState(false);

  const fetchAccountData = useCallback(async () => {
    if (!id) return;
    
    try {
      const [accountRes, relationshipsRes] = await Promise.all([
        fetch(`${API_BASE}/api/accounts/${id}`),
        fetch(`${API_BASE}/api/accounts/${id}/relationships`)
      ]);

      if (accountRes.ok) {
        const data = await accountRes.json();
        if (data.success) {
          setAccount(data.data);
        }
      }

      if (relationshipsRes.ok) {
        const data = await relationshipsRes.json();
        if (data.success) {
          setRelationships(data.data.relationships || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch account:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const handleExportToSalesforce = async () => {
    if (!account) return;
    
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/api/salesforce/export/${account.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert('Account exported to Salesforce successfully!');
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export to Salesforce');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-red-600';
    if (score >= 75) return 'text-orange-500';
    if (score >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'from-red-500 to-red-600';
    if (score >= 75) return 'from-orange-400 to-orange-500';
    if (score >= 60) return 'from-yellow-400 to-yellow-500';
    return 'from-green-400 to-green-500';
  };

  const getDegreeColor = (degree: number) => {
    if (degree === 1) return 'bg-green-100 text-green-800 border-green-200';
    if (degree === 2) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (degree === 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDegreeLabel = (degree: number) => {
    if (degree === 1) return '🔥 Direct';
    if (degree === 2) return '🟡 2° Away';
    if (degree === 3) return '🟢 3° Away';
    return `⚫ ${degree}° Away`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600">Account not found</p>
        <Link to="/accounts" className="mt-4 text-blue-600 hover:underline">
          Back to accounts
        </Link>
      </div>
    );
  }

  const contactRelationship = selectedContact 
    ? relationships.find(r => r.contactId === selectedContact.id)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/accounts" className="text-gray-400 hover:text-gray-600">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  {account.name}
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${getScoreBg(account.urgencyScore)} text-white`}>
                    {account.priorityLabel}
                  </span>
                </h1>
                <p className="text-sm text-gray-500">{account.industry} • {account.companySize}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-right`}>
                <p className="text-sm text-gray-500">Urgency Score</p>
                <p className={`text-4xl font-bold ${getScoreColor(account.urgencyScore)}`}>
                  {account.urgencyScore}
                </p>
              </div>
              <button
                onClick={handleExportToSalesforce}
                disabled={exporting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                {exporting ? 'Exporting...' : 'Export to Salesforce'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 border-b border-gray-200 -mb-px">
            {['overview', 'contacts', 'signals', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  Company Info
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                    <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {account.website}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {[account.headquarters.city, account.headquarters.state, account.headquarters.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{account.employeeCount?.toLocaleString()} employees</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{formatCurrency(account.annualRevenue)} revenue</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600">{account.description}</p>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-gray-400" />
                  Score Breakdown
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Urgency', score: account.urgencyScore, max: 100 },
                    { label: 'Fit', score: account.fitScore, max: 100 },
                    { label: 'Engagement', score: account.engagementScore, max: 100 }
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-semibold">{item.score}/{item.max}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getScoreBg(item.score)}`}
                          style={{ width: `${(item.score / item.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scoring Factors */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-yellow-500" />
                  AI Scoring Analysis
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Timing', score: account.scoringBreakdown?.timing },
                    { label: 'Company', score: account.scoringBreakdown?.company },
                    { label: 'Relationship', score: account.scoringBreakdown?.relationship },
                    { label: 'Engagement', score: account.scoringBreakdown?.engagement },
                    { label: 'Fit', score: account.scoringBreakdown?.fit },
                    { label: 'Competitive', score: account.scoringBreakdown?.competitive }
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {item.score?.score || 0}
                        <span className="text-sm text-gray-400">/{item.score?.maxScore || 100}</span>
                      </p>
                    </div>
                  ))}
                </div>

                <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Scoring Factors</h4>
                <div className="space-y-3">
                  {account.scoringBreakdown?.factors?.slice(0, 6).map((factor, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{factor.name}</p>
                        <p className="text-xs text-gray-500">{factor.description}</p>
                      </div>
                      <span className={`text-sm font-bold ${factor.points >= factor.maxPoints * 0.7 ? 'text-green-600' : 'text-gray-600'}`}>
                        +{factor.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contacts List */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Key Contacts</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {account.contacts.map((contact) => {
                  const rel = relationships.find(r => r.contactId === contact.id);
                  return (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`px-6 py-4 cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getDegreeColor(contact.separationDegree)}`}>
                            {getDegreeLabel(contact.separationDegree)}
                          </span>
                          {rel && (
                            <p className="text-xs text-gray-500 mt-1">
                              {Math.round(rel.introSuccessRate * 100)}% intro rate
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact Detail / Relationship Path */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              {selectedContact ? (
                <>
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Relationship Path</h3>
                    <p className="text-sm text-gray-500">How to reach {selectedContact.name}</p>
                  </div>
                  <div className="p-6">
                    {contactRelationship ? (
                      <>
                        {/* Path Visualization */}
                        <div className="space-y-4 mb-6">
                          {contactRelationship.path.map((hop, index) => (
                            <div key={index} className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                                  index === 0 ? 'bg-blue-600' :
                                  index === contactRelationship.path.length - 1 ? 'bg-green-600' :
                                  'bg-gray-400'
                                }`}>
                                  {index === 0 ? 'You' : hop.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              </div>
                              <div className="ml-4 flex-1">
                                <p className="font-medium text-gray-900">{hop.name}</p>
                                <p className="text-sm text-gray-500">
                                  {hop.title} {hop.company && `at ${hop.company}`}
                                </p>
                                {hop.relationshipContext && (
                                  <p className="text-xs text-gray-400 mt-1">{hop.relationshipContext}</p>
                                )}
                              </div>
                              {hop.connectionStrength && (
                                <span className="text-sm text-gray-500">
                                  {Math.round(hop.connectionStrength * 100)}% strength
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500">Confidence</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {Math.round(contactRelationship.confidence * 100)}%
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-xs text-gray-500">Success Rate</p>
                            <p className="text-2xl font-bold text-green-600">
                              {Math.round(contactRelationship.introSuccessRate * 100)}%
                            </p>
                          </div>
                        </div>

                        {/* Suggested Message */}
                        {contactRelationship.suggestedMessage && (
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-900 mb-2">Suggested Intro Request</p>
                            <p className="text-sm text-blue-800 whitespace-pre-wrap">
                              {contactRelationship.suggestedMessage}
                            </p>
                            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 w-full">
                              Request Introduction
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <LinkIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No relationship path found</p>
                        <p className="text-sm">Consider cold outreach or LinkedIn connection</p>
                      </div>
                    )}

                    {/* Influence Scores */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Influence Scores</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(selectedContact.influence).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 capitalize">{key}</span>
                            <span className={`text-sm font-bold ${value >= 70 ? 'text-green-600' : 'text-gray-600'}`}>
                              {value}/100
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full py-16 text-gray-500">
                  <div className="text-center">
                    <UserCircleIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p>Select a contact to view relationship path</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                Intelligence Signals
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {account.alerts.map((alert) => (
                <div key={alert.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">
                      {alert.urgency === 'high' ? '🔴' : alert.urgency === 'medium' ? '🟡' : '🟢'}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 uppercase">
                          {alert.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-900">{alert.message}</p>
                      {alert.sourceUrl && (
                        <a
                          href={alert.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          View source <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                Activity Timeline
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {account.activities.map((activity, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      activity.outcome === 'completed' || activity.outcome === 'opened' ? 'bg-green-100 text-green-600' :
                      activity.outcome === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.type.includes('email') ? <EnvelopeIcon className="h-5 w-5" /> :
                       activity.type.includes('call') ? <PhoneIcon className="h-5 w-5" /> :
                       activity.type.includes('meeting') || activity.type.includes('demo') ? <CalendarIcon className="h-5 w-5" /> :
                       <CheckCircleIcon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.type.replace(/_/g, ' ')}</span>
                        {activity.outcome && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            activity.outcome === 'completed' || activity.outcome === 'opened' ? 'bg-green-100 text-green-700' :
                            activity.outcome === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {activity.outcome}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
