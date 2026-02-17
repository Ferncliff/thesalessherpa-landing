import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const LinkedInIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinkedInData();
  }, []);

  const fetchLinkedInData = async () => {
    try {
      const response = await fetch('/api/relationships/linkedin');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching LinkedIn data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.intelligence) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="text-center py-8">
          <UserGroupIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No LinkedIn Data</h3>
          <p className="text-slate-500">Upload LinkedIn export to see network intelligence</p>
        </div>
      </div>
    );
  }

  const { intelligence } = data;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProspectPriority = (message, date) => {
    const daysSince = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
    
    if (message.toLowerCase().includes('tenant screening') || 
        message.toLowerCase().includes('market research')) {
      return { level: 'critical', color: 'text-red-600 bg-red-50', label: 'HIGH PRIORITY' };
    }
    
    if (message.toLowerCase().includes('podcast') || 
        message.toLowerCase().includes('guest')) {
      return { level: 'high', color: 'text-orange-600 bg-orange-50', label: 'OPPORTUNITY' };
    }
    
    if (daysSince <= 30) {
      return { level: 'medium', color: 'text-blue-600 bg-blue-50', label: 'RECENT' };
    }
    
    return { level: 'low', color: 'text-slate-600 bg-slate-50', label: 'FOLLOW UP' };
  };

  return (
    <div className="space-y-6">
      {/* Network Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Network</p>
              <p className="text-2xl font-bold text-blue-900">{intelligence.totalConnections}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Incoming Prospects</p>
              <p className="text-2xl font-bold text-green-900">{intelligence.incomingConnections}</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Your Outreach</p>
              <p className="text-2xl font-bold text-orange-900">{intelligence.outgoingConnections}</p>
            </div>
            <ArrowRightIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Recent (90d)</p>
              <p className="text-2xl font-bold text-purple-900">{intelligence.recentConnections}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Top Prospects */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ChatBubbleLeftIcon className="h-6 w-6 text-orange-500" />
            Top Prospects
          </h3>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {intelligence.topProspects.length} with messages
          </span>
        </div>

        <div className="space-y-4">
          {intelligence.topProspects.map((prospect, index) => {
            const priority = getProspectPriority(prospect.message, prospect.date);
            
            return (
              <div key={index} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900">{prospect.name}</h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${priority.color}`}>
                        {priority.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{formatDate(prospect.date)}</p>
                  </div>
                  <a 
                    href={prospect.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                  </a>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-3 border-l-4 border-orange-400">
                  <p className="text-sm text-slate-700 italic">"{prospect.message}"</p>
                </div>
                
                {priority.level === 'critical' && (
                  <div className="mt-3 flex items-center gap-2">
                    <button className="bg-red-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-red-700 transition-colors">
                      Respond Now
                    </button>
                    <button className="bg-slate-200 text-slate-700 text-sm px-3 py-1 rounded-lg hover:bg-slate-300 transition-colors">
                      Schedule Follow-up
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Outreach */}
      {intelligence.recentOutreach.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightIcon className="h-6 w-6 text-blue-500" />
              Recent Outreach
            </h3>
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {intelligence.recentOutreach.length} connections
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {intelligence.recentOutreach.map((contact, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{contact.name}</h4>
                  <a 
                    href={contact.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                </div>
                <p className="text-sm text-slate-500">{formatDate(contact.date)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Source */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center gap-2 text-blue-800">
          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          <p className="text-sm font-medium">
            Data source: LinkedIn export • Last processed: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LinkedInIntelligence;