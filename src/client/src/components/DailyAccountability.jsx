import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FireIcon,
  ChartBarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const DailyAccountability = ({ accountId = null, compact = false }) => {
  const [dailyData, setDailyData] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyAccountability();
  }, [accountId]);

  const fetchDailyAccountability = async () => {
    try {
      const endpoint = accountId 
        ? `/api/accountability/account/${accountId}` 
        : '/api/accountability/daily';
      
      // For demo, generate sample data
      const sampleData = generateSampleDailyData();
      setDailyData(sampleData.daily);
      setStreakData(sampleData.streak);
    } catch (error) {
      console.error('Error fetching daily accountability:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleDailyData = () => {
    const today = new Date();
    const days = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Sample commitments for each day
      const commitments = accountId ? 
        generateAccountCommitments(dateStr, i) : 
        generateDailyCommitments(dateStr, i);
      
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        commitments
      });
    }
    
    // Calculate streak
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    days.reverse().forEach(day => {
      const completed = day.commitments.filter(c => c.status === 'completed').length;
      const total = day.commitments.length;
      const completionRate = total > 0 ? completed / total : 0;
      
      if (completionRate >= 0.8) { // 80% completion rate
        tempStreak++;
        if (tempStreak === 1) currentStreak = tempStreak;
        else if (tempStreak > currentStreak) currentStreak = tempStreak;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        if (tempStreak === currentStreak) currentStreak = 0;
        tempStreak = 0;
      }
    });
    
    days.reverse();
    
    return {
      daily: days,
      streak: {
        current: currentStreak,
        max: maxStreak,
        completionRate: calculateOverallCompletion(days)
      }
    };
  };

  const generateAccountCommitments = (dateStr, daysAgo) => {
    const accountCommitments = [
      { task: 'Follow up on proposal', priority: 'high' },
      { task: 'Research decision makers', priority: 'medium' },
      { task: 'Update CRM notes', priority: 'low' },
      { task: 'Schedule demo call', priority: 'high' },
      { task: 'Send case study', priority: 'medium' }
    ];
    
    return accountCommitments.slice(0, Math.floor(Math.random() * 3) + 2).map((commitment, idx) => ({
      ...commitment,
      id: `${dateStr}-${idx}`,
      status: daysAgo === 0 ? 'pending' : 
              daysAgo === 1 && Math.random() > 0.3 ? 'skipped' : 
              Math.random() > 0.2 ? 'completed' : 'skipped'
    }));
  };

  const generateDailyCommitments = (dateStr, daysAgo) => {
    const dailyCommitments = [
      { task: 'Make 10 outreach calls', priority: 'high' },
      { task: 'Send 5 follow-up emails', priority: 'high' },
      { task: 'Update Salesforce pipeline', priority: 'medium' },
      { task: 'Research 3 new prospects', priority: 'medium' },
      { task: 'LinkedIn outreach (5 connections)', priority: 'medium' },
      { task: 'Review and respond to proposals', priority: 'high' },
      { task: 'Schedule next week meetings', priority: 'low' }
    ];
    
    return dailyCommitments.slice(0, Math.floor(Math.random() * 4) + 3).map((commitment, idx) => ({
      ...commitment,
      id: `${dateStr}-${idx}`,
      status: daysAgo === 0 ? (Math.random() > 0.5 ? 'pending' : 'completed') : 
              daysAgo === 1 && Math.random() > 0.4 ? 'skipped' : 
              Math.random() > 0.25 ? 'completed' : 'skipped'
    }));
  };

  const calculateOverallCompletion = (days) => {
    const allCommitments = days.flatMap(day => day.commitments);
    const completed = allCommitments.filter(c => c.status === 'completed').length;
    return allCommitments.length > 0 ? (completed / allCommitments.length * 100) : 0;
  };

  const getCommitmentStatus = (status) => {
    switch (status) {
      case 'completed': return { icon: CheckCircleIcon, color: 'text-green-600' };
      case 'pending': return { icon: ClockIcon, color: 'text-orange-600' };
      case 'skipped': return { icon: XCircleIcon, color: 'text-red-600' };
      default: return { icon: ClockIcon, color: 'text-gray-600' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDayCompletionColor = (day) => {
    const completed = day.commitments.filter(c => c.status === 'completed').length;
    const total = day.commitments.length;
    const rate = total > 0 ? completed / total : 0;
    
    if (rate >= 0.8) return 'bg-green-100 border-green-300';
    if (rate >= 0.5) return 'bg-yellow-100 border-yellow-300';
    if (day.commitments.some(c => c.status === 'skipped')) return 'bg-red-100 border-red-300';
    return 'bg-gray-100 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (compact) {
    // Compact view for dashboard widgets
    const todayData = dailyData.find(day => day.date === new Date().toISOString().split('T')[0]);
    const skippedToday = todayData?.commitments.filter(c => c.status === 'skipped').length || 0;
    const pendingToday = todayData?.commitments.filter(c => c.status === 'pending').length || 0;
    
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Daily Accountability
          </h3>
          {streakData && streakData.current > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <FireIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{streakData.current} day streak</span>
            </div>
          )}
        </div>
        
        {skippedToday > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <div className="text-red-800 text-sm font-medium">
              ⚠️ {skippedToday} commitment{skippedToday > 1 ? 's' : ''} skipped today
            </div>
          </div>
        )}
        
        {pendingToday > 0 && (
          <div className="text-sm text-slate-600">
            {pendingToday} commitment{pendingToday > 1 ? 's' : ''} remaining today
          </div>
        )}
        
        {pendingToday === 0 && skippedToday === 0 && (
          <div className="text-green-600 text-sm font-medium">✅ All commitments completed!</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Streak Stats */}
      {streakData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <FireIcon className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{streakData.current}</div>
                <div className="text-sm text-slate-600">Current Streak</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <TrophyIcon className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{streakData.max}</div>
                <div className="text-sm text-slate-600">Best Streak</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{Math.round(streakData.completionRate)}%</div>
                <div className="text-sm text-slate-600">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Breakdown */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {accountId ? 'Account Daily Commitments' : 'Daily Sales Commitments'}
          </h3>
          <p className="text-sm text-slate-600 mt-1">Last 7 days</p>
        </div>
        
        <div className="divide-y divide-slate-200">
          {dailyData.map((day, dayIndex) => {
            const completed = day.commitments.filter(c => c.status === 'completed').length;
            const skipped = day.commitments.filter(c => c.status === 'skipped').length;
            const pending = day.commitments.filter(c => c.status === 'pending').length;
            const total = day.commitments.length;
            
            return (
              <div key={dayIndex} className={`p-4 ${getDayCompletionColor(day)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-slate-900">
                      {day.dayName} {new Date(day.date).toLocaleDateString()}
                    </h4>
                    {day.date === new Date().toISOString().split('T')[0] && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {completed > 0 && (
                      <span className="text-green-600">{completed} ✅</span>
                    )}
                    {pending > 0 && (
                      <span className="text-orange-600">{pending} ⏳</span>
                    )}
                    {skipped > 0 && (
                      <span className="text-red-600 font-medium">{skipped} ❌</span>
                    )}
                    <span className="text-slate-500">
                      {Math.round((completed / total) * 100)}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {day.commitments.map((commitment, commitmentIndex) => {
                    const statusInfo = getCommitmentStatus(commitment.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <div key={commitmentIndex} className="flex items-center gap-3">
                        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                        <span className="flex-1 text-sm text-slate-700">{commitment.task}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(commitment.priority)}`}>
                          {commitment.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Skipped Warning */}
                {skipped > 0 && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <div className="flex items-center gap-2 text-red-700 text-sm">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span className="font-medium">
                        {skipped} commitment{skipped > 1 ? 's' : ''} skipped - consistency wins deals!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyAccountability;