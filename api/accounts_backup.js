module.exports = function handler(req, res) {
  // Demo accounts data - BACKUP VERSION
  const accounts = [
    {
      id: "acc_001",
      name: "TechCorp Solutions",
      domain: "techcorp.com",
      industry: "Technology",
      revenue: "$50M",
      employees: 250,
      status: "active",
      priority: "high",
      urgencyScore: 85,
      lastActivity: "2026-02-10T15:30:00Z",
      relationships: [
        {
          contact: "Sarah Chen",
          title: "VP Engineering",
          warmth: "warm",
          lastContact: "2026-02-08T10:00:00Z"
        }
      ],
      insights: [
        {
          type: "funding",
          message: "Just raised Series B funding",
          urgency: "high",
          source: "PitchBook"
        }
      ]
    },
    {
      id: "acc_002", 
      name: "InnovateLabs Inc",
      domain: "innovatelabs.com",
      industry: "Healthcare",
      revenue: "$25M",
      employees: 150,
      status: "prospect",
      priority: "medium",
      urgencyScore: 72,
      lastActivity: "2026-02-09T09:15:00Z",
      relationships: [
        {
          contact: "Dr. Michael Rodriguez",
          title: "CTO",
          warmth: "cold",
          lastContact: "2026-01-15T14:20:00Z"
        }
      ],
      insights: [
        {
          type: "hiring",
          message: "Actively hiring 5 software engineers",
          urgency: "medium",
          source: "LinkedIn"
        }
      ]
    },
    {
      id: "acc_003",
      name: "GlobalFinance Corp",
      domain: "globalfinance.com", 
      industry: "Financial Services",
      revenue: "$200M",
      employees: 1000,
      status: "customer",
      priority: "high",
      urgencyScore: 91,
      lastActivity: "2026-02-11T16:45:00Z",
      relationships: [
        {
          contact: "Jennifer Walsh",
          title: "Chief Digital Officer",
          warmth: "hot",
          lastContact: "2026-02-11T16:45:00Z"
        }
      ],
      insights: [
        {
          type: "expansion",
          message: "Contract renewal discussion next month",
          urgency: "high", 
          source: "Salesforce"
        }
      ]
    }
  ];

  // Handle different HTTP methods
  if (req.method === 'GET') {
    return res.status(200).json({ accounts });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};