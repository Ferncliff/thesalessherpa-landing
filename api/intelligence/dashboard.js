module.exports = function handler(req, res) {
  // Dashboard data matching the expected interface in Dashboard.tsx
  const dashboardData = {
    success: true,
    data: {
      totalAccounts: 131, // Matt's real FA territory count
      highPriorityAccounts: 23,
      totalAlerts: 8,
      averageUrgencyScore: 73,
      topActions: [
        {
          priority: 'urgent',
          action: 'Schedule warm intro meeting with WPP CEO Mark Read',
          account: 'WPP',
          deadline: '2026-02-18T10:00:00Z',
          contactName: 'Mark Read',
          successProbability: 0.78
        },
        {
          priority: 'high',
          action: 'Follow up on Battelle DOE contract background check needs',
          account: 'Battelle',
          deadline: '2026-02-19T14:00:00Z',
          contactName: 'Lou Von Thaer',
          successProbability: 0.65
        },
        {
          priority: 'high',
          action: 'Present enterprise solution to Maximus federal compliance team',
          account: 'Maximus',
          deadline: '2026-02-20T16:00:00Z',
          contactName: 'Bruce Caswell',
          successProbability: 0.72
        },
        {
          priority: 'medium',
          action: 'Research Uber background check automation requirements',
          account: 'Uber',
          deadline: '2026-02-22T12:00:00Z',
          contactName: 'Dara Khosrowshahi',
          successProbability: 0.45
        },
        {
          priority: 'medium',
          action: 'Connect with Tetra Tech expansion team',
          account: 'Tetra Tech',
          deadline: '2026-02-24T09:00:00Z',
          contactName: 'Dan Batrack',
          successProbability: 0.58
        }
      ],
      recentActivities: [
        {
          message: 'WPP posted new job openings requiring background checks',
          type: 'alert',
          timestamp: '2026-02-12T15:30:00Z'
        },
        {
          message: 'Battelle awarded $2.8B DOE contract - immediate opportunity',
          type: 'news', 
          timestamp: '2026-02-12T10:15:00Z'
        },
        {
          message: 'Maximus compliance team searching for vendors',
          type: 'activity',
          timestamp: '2026-02-11T14:20:00Z'
        },
        {
          message: 'Uber engineering team expanded to 500+ new hires',
          type: 'news',
          timestamp: '2026-02-10T11:45:00Z'
        }
      ],
      weeklyStats: {
        newOpportunities: 12,
        completedActivities: 28,
        introductionsRequested: 6,
        responseRate: 0.67
      }
    }
  };

  // Legacy format for backward compatibility
  const legacyData = {
    summary: {
      totalAccounts: 131,
      activeDeals: 23,
      totalPipeline: "$2.4M",
      hotLeads: 12,
      urgentActions: 8
    },
    urgentAccounts: [
      {
        id: "matt_acc_002",
        name: "WPP",
        urgencyScore: 95,
        reason: "Digital transformation initiative Q2 2026",
        action: "Schedule warm intro with CEO",
        dueDate: "2026-02-18"
      },
      {
        id: "matt_acc_004", 
        name: "Battelle",
        urgencyScore: 92,
        reason: "Awarded $2.8B DOE contract",
        action: "Present federal compliance solution",
        dueDate: "2026-02-19"
      },
      {
        id: "matt_acc_005",
        name: "Maximus",
        urgencyScore: 87,
        reason: "New federal compliance requirements",
        action: "Connect with compliance team",
        dueDate: "2026-02-20"
      }
    ],
    relationshipHealth: {
      hot: 18,
      warm: 42,
      cold: 67,
      unknown: 20
    },
    dealVelocity: [
      { month: "Oct", closed: 8, pipeline: 2100000 },
      { month: "Nov", closed: 12, pipeline: 2300000 },
      { month: "Dec", closed: 15, pipeline: 2400000 },
      { month: "Jan", closed: 9, pipeline: 2200000 },
      { month: "Feb", closed: 6, pipeline: 2400000 }
    ]
  };

  if (req.method === 'GET') {
    // Return new format for Dashboard.tsx
    return res.status(200).json(dashboardData);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};