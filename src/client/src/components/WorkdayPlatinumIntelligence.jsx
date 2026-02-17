import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrophyIcon,
  StarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  BoltIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const WorkdayPlatinumIntelligence = () => {
  const [workdayAccounts, setWorkdayAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkdayAccounts();
  }, []);

  const fetchWorkdayAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      const result = await response.json();
      
      if (result.success) {
        // Filter for Workday accounts with platinum partner status
        const workdayOnly = result.data
          .filter(account => 
            account.ats && 
            account.ats.currentATS.provider === 'Workday' &&
            account.ats.partnerStatus === 'PLATINUM'
          )
          .sort((a, b) => b.urgencyScore - a.urgencyScore)
          .slice(0, 5); // Top 5 opportunities
        
        setWorkdayAccounts(workdayOnly);
      }
    } catch (error) {
      console.error('Error fetching Workday accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (workdayAccounts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-yellow-500 flex items-center justify-center">
            <TrophyIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              🥇 Workday Platinum Partner Advantage
              <StarIcon className="h-5 w-5 text-yellow-500" />
            </h3>
            <p className="text-sm text-slate-700">Co-selling opportunities with referral compensation</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-600">{workdayAccounts.length}</div>
          <div className="text-xs text-slate-600">Top Opportunities</div>
        </div>
      </div>

      {/* Platinum Benefits Banner */}
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <UserGroupIcon className="h-4 w-4 text-yellow-700" />
          <span className="font-semibold text-yellow-900">Platinum Partner Benefits:</span>
        </div>
        <ul className="text-xs text-yellow-800 space-y-1">
          <li>• Active co-selling support from Workday team</li>
          <li>• Referral compensation for closed deals</li>
          <li>• Direct partnership manager access</li>
          <li>• Priority technical integration support</li>
        </ul>
      </div>

      {/* Top Workday Accounts */}
      <div className="space-y-3">
        {workdayAccounts.map((account, index) => (
          <div key={account.id} className="bg-white border border-yellow-200 rounded-lg p-4 hover:border-yellow-400 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-bold">
                      #{index + 1}
                    </span>
                    <BuildingOfficeIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <Link 
                    to={`/fa/mattedwards/accounts/${account.id}/command`}
                    className="font-semibold text-slate-900 hover:text-yellow-700"
                  >
                    {account.name}
                  </Link>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                    {account.urgencyScore} urgency
                  </span>
                </div>

                {/* ATS Rep Info */}
                {account.ats && account.ats.atsRep && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-green-900">
                          🤝 Workday Partner Rep
                        </div>
                        <div className="text-xs text-green-800">
                          {account.ats.atsRep.name} - {account.ats.atsRep.title}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <a
                          href={`mailto:${account.ats.atsRep.email}`}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Email Workday Rep"
                        >
                          <EnvelopeIcon className="h-3 w-3" />
                        </a>
                        <a
                          href={`tel:${account.ats.atsRep.phone}`}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Call Workday Rep"
                        >
                          <PhoneIcon className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Co-selling Action */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    Contract expires: {account.ats?.currentATS?.contractExpiry || 'Unknown'}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-1">
                      <BoltIcon className="h-3 w-3" />
                      Co-Sell Now
                    </button>
                    <Link
                      to={`/fa/mattedwards/accounts/${account.id}/command`}
                      className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      Command Center
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-between">
        <Link
          to="/fa/mattedwards/ats"
          className="text-sm text-yellow-700 hover:text-yellow-900 font-medium"
        >
          View All ATS Intelligence →
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <FireIcon className="h-3 w-3 text-orange-500" />
          <span>Platinum partner = competitive advantage</span>
        </div>
      </div>
    </div>
  );
};

export default WorkdayPlatinumIntelligence;