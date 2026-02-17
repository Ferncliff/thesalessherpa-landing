/**
 * Historical Activities Component
 * Shows Matt's sales activity tracking for 2025 (demo data)
 */

import React, { useState } from 'react';
import {
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ActivityEntry {
  id: string;
  initialOutreach?: string;
  followUp?: string;
  rightIdEmail?: string;
  instantTempEmail?: string;
  industryChanges?: string;
  trendReport?: string;
  account?: string;
  status: 'completed' | 'pending' | 'scheduled';
}

interface HistoricalActivitiesProps {
  title?: string;
  showFilters?: boolean;
}

export default function HistoricalActivities({ 
  title = "Matt's Sales Activities - 2025", 
  showFilters = true 
}: HistoricalActivitiesProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'activity'>('date');
  const [selectedYear, setSelectedYear] = useState<'2025' | '2024' | 'all'>('2025');
  const [showYearColumns, setShowYearColumns] = useState({
    '2025': true,
    '2024': false
  });

  // Matt's historical activities data - multi-year tracking
  const activities: ActivityEntry[] = [
    // 2025 Activities  
    {
      id: "1",
      initialOutreach: "12/28/25",
      followUp: "1/25/25", 
      rightIdEmail: "3/28/25",
      account: "TechCorp Solutions",
      status: "completed"
    },
    // 2024 Activities (original data)
    {
      id: "21",
      initialOutreach: "12/28/24",
      followUp: "1/25/24",
      rightIdEmail: "3/28/24",
      account: "GlobalFinance Corp",
      status: "completed"
    },
    {
      id: "2", 
      initialOutreach: "10/2/25",
      status: "pending"
    },
    {
      id: "3",
      initialOutreach: "10/2/25", 
      status: "pending"
    },
    {
      id: "4",
      initialOutreach: "10/2/25",
      status: "pending"
    },
    {
      id: "5",
      initialOutreach: "1/25/25",
      rightIdEmail: "3/14/25",
      instantTempEmail: "4/5/25",
      status: "completed"
    },
    {
      id: "6",
      initialOutreach: "3/7/25",
      rightIdEmail: "3/19/25", 
      instantTempEmail: "4/5/25",
      status: "completed"
    },
    {
      id: "7",
      initialOutreach: "3/7/25",
      status: "pending"
    },
    {
      id: "8",
      initialOutreach: "4/25/25",
      status: "pending"
    },
    {
      id: "9",
      initialOutreach: "7/10/25",
      status: "pending"
    },
    {
      id: "10",
      initialOutreach: "7/10/25",
      status: "pending"
    },
    {
      id: "11",
      initialOutreach: "1/25/25",
      industryChanges: "4/11/25",
      status: "completed"
    },
    {
      id: "12",
      initialOutreach: "1/25/25",
      industryChanges: "4/11/25", 
      status: "completed"
    },
    {
      id: "13",
      initialOutreach: "2/29/25",
      status: "pending"
    },
    {
      id: "14",
      initialOutreach: "3/25/25",
      instantTempEmail: "4/19/25",
      status: "completed"
    },
    {
      id: "15",
      initialOutreach: "1/27/25",
      status: "pending"
    },
    {
      id: "16",
      initialOutreach: "3/9/25",
      instantTempEmail: "4/19/25",
      status: "completed"
    },
    {
      id: "17",
      initialOutreach: "10/7/25",
      status: "pending"
    },
    {
      id: "18",
      initialOutreach: "10/7/25", 
      status: "pending"
    },
    {
      id: "19",
      initialOutreach: "2/29/25",
      rightIdEmail: "3/20/25",
      status: "completed"
    },
    {
      id: "20",
      initialOutreach: "2/29/25",
      rightIdEmail: "3/20/25", 
      status: "completed"
    },
    // Additional 2024 sample data for year comparison
    {
      id: "22",
      initialOutreach: "10/15/24",
      rightIdEmail: "11/20/24",
      instantTempEmail: "12/5/24",
      status: "completed"
    },
    {
      id: "23", 
      initialOutreach: "11/10/24",
      followUp: "12/1/24",
      status: "completed"
    },
    {
      id: "24",
      initialOutreach: "9/22/24",
      industryChanges: "10/15/24",
      status: "completed"
    }
  ];

  // Get year from date string
  const getActivityYear = (activity: ActivityEntry) => {
    const dateStr = activity.initialOutreach || '';
    if (dateStr.includes('/25')) return '2025';
    if (dateStr.includes('/24')) return '2024';
    return 'unknown';
  };

  // Filter activities by status and year
  const filteredActivities = activities.filter(activity => {
    // Status filter
    if (filter !== 'all' && activity.status !== filter) return false;
    
    // Year filter
    if (selectedYear !== 'all') {
      const activityYear = getActivityYear(activity);
      return activityYear === selectedYear;
    }
    
    return true;
  });

  const toggleYearColumn = (year: '2025' | '2024') => {
    setShowYearColumns(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.initialOutreach || '1/1/25');
      const dateB = new Date(b.initialOutreach || '1/1/25');
      return dateB.getTime() - dateA.getTime();
    }
    return 0;
  });

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'initialOutreach': return <EnvelopeIcon className="h-4 w-4 text-blue-500" />;
      case 'followUp': return <PhoneIcon className="h-4 w-4 text-green-500" />;
      case 'rightIdEmail': return <UserIcon className="h-4 w-4 text-purple-500" />;
      case 'instantTempEmail': return <ClockIcon className="h-4 w-4 text-orange-500" />;
      case 'industryChanges': return <BuildingOfficeIcon className="h-4 w-4 text-red-500" />;
      case 'trendReport': return <ChartBarIcon className="h-4 w-4 text-indigo-500" />;
      default: return <CalendarIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ActivityEntry['status']) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return styles[status];
  };

  const stats = {
    total: activities.length,
    completed: activities.filter(a => a.status === 'completed').length,
    pending: activities.filter(a => a.status === 'pending').length,
    completionRate: Math.round((activities.filter(a => a.status === 'completed').length / activities.length) * 100)
  };

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">Historical sales activity tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">{stats.completed} Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">{stats.pending} Pending</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <ArrowTrendingUpIcon className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600">{stats.completionRate}% Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Activities ({stats.total})</option>
                  <option value="completed">Completed ({stats.completed})</option>
                  <option value="pending">Pending ({stats.pending})</option>
                </select>
              </div>

              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Years</option>
                  <option value="2025">2025 Only</option>
                  <option value="2024">2024 Only</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">By Date</option>
                  <option value="activity">By Activity Type</option>
                </select>
              </div>
            </div>

            {/* Year Column Toggles */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Show Years:</span>
              <button
                onClick={() => toggleYearColumn('2025')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  showYearColumns['2025']
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                2025 {showYearColumns['2025'] ? '✓' : ''}
              </button>
              <button
                onClick={() => toggleYearColumn('2024')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  showYearColumns['2024']
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                2024 {showYearColumns['2024'] ? '✓' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activities Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Initial Outreach
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Follow Up
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Right ID Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instant TEMP Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Industry Changes
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedActivities.map((activity, index) => {
              const activityYear = getActivityYear(activity);
              const yearColor = activityYear === '2025' ? 'border-l-blue-500' : 'border-l-green-500';
              const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
              
              return (
                <tr 
                  key={activity.id} 
                  className={`${rowBg} hover:bg-blue-50 transition-colors border-l-4 ${yearColor}`}
                >
                <td className="px-4 py-3 whitespace-nowrap">
                  {activity.initialOutreach && (
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-blue-500" />
                      <span className={`text-sm font-medium ${activityYear === '2025' ? 'text-blue-900' : 'text-green-900'}`}>
                        {activity.initialOutreach}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        activityYear === '2025' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {activityYear}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {activity.followUp && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-green-500" />
                      <span className={`text-sm font-medium ${activityYear === '2025' ? 'text-blue-900' : 'text-green-900'}`}>
                        {activity.followUp}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {activity.rightIdEmail && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-purple-500" />
                      <span className={`text-sm font-medium ${activityYear === '2025' ? 'text-blue-900' : 'text-green-900'}`}>
                        {activity.rightIdEmail}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {activity.instantTempEmail && (
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-orange-500" />
                      <span className={`text-sm font-medium ${activityYear === '2025' ? 'text-blue-900' : 'text-green-900'}`}>
                        {activity.instantTempEmail}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {activity.industryChanges && (
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-red-500" />
                      <span className={`text-sm font-medium ${activityYear === '2025' ? 'text-blue-900' : 'text-green-900'}`}>
                        {activity.industryChanges}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(activity.status)}`}>
                    {activity.status === 'completed' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Activities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}