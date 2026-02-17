import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  ArrowPathIcon,
  HandRaisedIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import LinkedInIntelligence from '../components/LinkedInIntelligence';

export default function Relationships() {
  const [networkData, setNetworkData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetworkData();
    fetchSuggestions();
  }, []);

  const fetchNetworkData = async () => {
    try {
      const response = await fetch('/api/relationships/network');
      const data = await response.json();
      if (data.success) {
        setNetworkData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch network data:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/relationships/suggestions');
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestIntroduction = async (targetId) => {
    try {
      const response = await fetch('/api/relationships/intro-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetId: targetId,
          connectorId: 'auto', // In real app, this would be selected
          message: 'auto' // Use AI-generated message
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Introduction request sent successfully! Expected response time: ${data.data.expectedResponseTime}`);
        // Refresh suggestions to show updated status
        fetchSuggestions();
      }
    } catch (error) {
      console.error('Failed to request introduction:', error);
      alert('Failed to send introduction request. Please try again.');
    }
  };

  const getSeparationColor = (degree) => {
    if (degree === 1) return 'bg-green-100 text-green-800';
    if (degree === 2) return 'bg-yellow-100 text-yellow-800';
    if (degree <= 4) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 0.7) return 'text-green-600';
    if (rate >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Relationship Intelligence</h1>
          <p className="mt-2 text-sm text-gray-600">
            Discover warm connection paths and request strategic introductions
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Network strength: <span className="font-semibold">{Math.round((networkData?.averageConnectionStrength || 0) * 100)}%</span>
        </div>
      </div>

      {/* LinkedIn Intelligence - Real Data */}
      <LinkedInIntelligence />

      {/* Network Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            Network Overview
          </h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{networkData?.stats.firstDegree}</div>
              <div className="text-sm text-gray-500">Direct Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{networkData?.stats.secondDegree.toLocaleString()}</div>
              <div className="text-sm text-gray-500">2nd Degree</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{networkData?.stats.thirdDegree.toLocaleString()}</div>
              <div className="text-sm text-gray-500">3rd Degree</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{networkData?.stats.decisionMakersReachable}</div>
              <div className="text-sm text-gray-500">Decision Makers</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Companies reachable:</span>
              <span className="font-medium">{networkData?.stats.companiesReachable.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Average connection strength:</span>
              <span className="font-medium">{Math.round((networkData?.stats.averageConnectionStrength || 0) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction Suggestions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <HandRaisedIcon className="h-5 w-5 mr-2" />
              Warm Introduction Opportunities
            </h3>
            <span className="text-sm text-gray-500">
              {suggestions.length} high-confidence opportunities
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="px-6 py-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Target Contact Info */}
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{suggestion.targetName}</h4>
                      <p className="text-sm text-gray-600">{suggestion.targetTitle}</p>
                    </div>
                  </div>
                  
                  {/* Connection Metrics */}
                  <div className="mt-4 flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeparationColor(suggestion.separationDegree)}`}>
                        {suggestion.separationDegree}° separation
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Success rate:</span>
                      <span className={`ml-1 font-medium ${getSuccessRateColor(suggestion.introSuccessRate)}`}>
                        {Math.round(suggestion.introSuccessRate * 100)}%
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Confidence:</span>
                      <span className="ml-1 font-medium text-blue-600">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* AI-Generated Message Preview */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">AI-Generated Introduction Message:</h5>
                    <p className="text-sm text-blue-800 italic">"{suggestion.suggestedMessage}"</p>
                  </div>
                  
                  {/* Next Steps */}
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900">Recommended next steps:</h5>
                    <ul className="mt-2 text-sm text-gray-600 space-y-1">
                      {suggestion.nextSteps?.map((step, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="ml-6 flex flex-col space-y-3">
                  <button
                    onClick={() => requestIntroduction(suggestion.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <HandRaisedIcon className="h-4 w-4 mr-2" />
                    Request Introduction
                  </button>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Customize Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Connections */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Direct Connections</h3>
          <p className="text-sm text-gray-500">People you can reach out to directly</p>
        </div>
        <div className="divide-y divide-gray-200">
          {networkData?.directConnections?.slice(0, 5).map((connection) => (
            <div key={connection.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <h4 className="text-base font-medium text-gray-900">{connection.name}</h4>
                    <p className="text-sm text-gray-600">{connection.title} at {connection.company}</p>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="capitalize">{connection.relationshipType.replace('-', ' ')}</span>
                      <span>•</span>
                      <span>Last interaction: {new Date(connection.lastInteraction).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{connection.mutualConnections} mutual connections</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      Connection Strength
                    </div>
                    <div className={`text-sm ${getSuccessRateColor(connection.connectionStrength)}`}>
                      {Math.round(connection.connectionStrength * 100)}%
                    </div>
                  </div>
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 border-t border-gray-200">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View all {networkData?.stats.firstDegree} direct connections →
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <h4 className="text-lg font-medium text-gray-900">73%</h4>
              <p className="text-sm text-gray-500">Average response rate</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <h4 className="text-lg font-medium text-gray-900">2.3 days</h4>
              <p className="text-sm text-gray-500">Average intro time</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <ArrowPathIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <h4 className="text-lg font-medium text-gray-900">12</h4>
              <p className="text-sm text-gray-500">Active intro requests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}