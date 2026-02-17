/**
 * Historical Sales Activities Dashboard
 * Shows Matt's 2025 sales activity tracking for VP demo
 */

import React from 'react';
import { Link } from 'react-router-dom';
import HistoricalActivities from '../components/HistoricalActivities';
import {
  ChartBarIcon,
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  TrophyIcon,
  FireIcon
} from '@heroicons/react/24/outline';

export default function HistoricalDashboard() {
  const performanceStats = {
    totalOutreach: 20,
    followUpRate: 35, // 7 follow-ups out of 20 initial outreach
    emailAccuracy: 85, // Right ID emails success rate
    industryInsights: 4, // Industry change alerts acted upon
    completionRate: 45, // Overall completion rate
    bestMonth: 'April 2025'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/fa/mattedwards" 
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ChartBarIcon className="h-7 w-7 text-blue-600" />
                  Historical Sales Performance
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Matt Edwards • First Advantage Territory • 2025 Activities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {performanceStats.completionRate}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrophyIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Outreach</p>
                <p className="text-3xl font-bold text-gray-900">{performanceStats.totalOutreach}</p>
                <p className="text-xs text-blue-600 font-medium">Initial contacts made</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FireIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Follow-Up Rate</p>
                <p className="text-3xl font-bold text-gray-900">{performanceStats.followUpRate}%</p>
                <p className="text-xs text-green-600 font-medium">Above industry avg</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email Accuracy</p>
                <p className="text-3xl font-bold text-gray-900">{performanceStats.emailAccuracy}%</p>
                <p className="text-xs text-purple-600 font-medium">Right ID success</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Best Month</p>
                <p className="text-xl font-bold text-gray-900">{performanceStats.bestMonth}</p>
                <p className="text-xs text-orange-600 font-medium">Peak performance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">2025 Performance Highlights</h3>
              <div className="mt-3 space-y-2">
                <p className="text-blue-100">
                  ✅ Maintained 35% follow-up rate (industry benchmark: 23%)
                </p>
                <p className="text-blue-100">
                  ✅ 85% email accuracy through proper prospect research
                </p>
                <p className="text-blue-100">
                  ✅ 4 industry change alerts acted upon for timing advantage
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{performanceStats.completionRate}%</div>
              <div className="text-blue-200">Overall Success</div>
            </div>
          </div>
        </div>

        {/* Historical Activities Component */}
        <HistoricalActivities 
          title="Sales Activity Timeline - 2025"
          showFilters={true}
        />

        {/* Activity Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Breakdown */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Activity Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">January 2025</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">3 activities</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">February 2025</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">2 activities</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">March 2025</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">4 activities</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-semibold">April 2025 🏆</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-green-700">6 activities</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">October 2025</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">5 activities</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Type Distribution */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Type Distribution</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Initial Outreach</span>
                </div>
                <span className="text-sm font-medium text-gray-900">20 (100%)</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Follow-Up</span>
                </div>
                <span className="text-sm font-medium text-gray-900">1 (5%)</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Right ID Email</span>
                </div>
                <span className="text-sm font-medium text-gray-900">6 (30%)</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Instant TEMP Email</span>
                </div>
                <span className="text-sm font-medium text-gray-900">5 (25%)</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Industry Changes</span>
                </div>
                <span className="text-sm font-medium text-gray-900">4 (20%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Return to Dashboard CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/fa/mattedwards"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Live Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}