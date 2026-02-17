module.exports = function handler(req, res) {
  const { id } = req.query;

  const accountDetails = {
    "acc_001": {
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
      website: "https://techcorp.com",
      phone: "+1 (555) 123-4567",
      relationships: [
        {
          contact: "Sarah Chen",
          title: "VP Engineering", 
          email: "s.chen@techcorp.com",
          phone: "+1 (555) 123-4570",
          warmth: "warm",
          lastContact: "2026-02-08T10:00:00Z",
          notes: "Interested in our enterprise security features"
        }
      ],
      insights: [
        {
          type: "funding",
          message: "Just raised $25M Series B funding",
          urgency: "high",
          source: "PitchBook",
          timestamp: "2026-02-05T12:00:00Z",
          confidence: 95
        }
      ],
      salesData: {
        totalRevenue: "$150K",
        lastDeal: "2025-11-15",
        dealStage: "negotiation",
        probability: 75,
        nextAction: "Technical demo scheduled for Feb 15"
      }
    },
    "acc_002": {
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
      website: "https://innovatelabs.com",
      relationships: [
        {
          contact: "Dr. Michael Rodriguez",
          title: "CTO",
          email: "m.rodriguez@innovatelabs.com",
          warmth: "cold",
          lastContact: "2026-01-15T14:20:00Z",
          notes: "Focus on regulatory compliance requirements"
        }
      ],
      salesData: {
        totalRevenue: "$0",
        dealStage: "qualification",
        probability: 35,
        nextAction: "Discovery call scheduled for Feb 20"
      }
    },
    "acc_003": {
      id: "acc_003", 
      name: "GlobalFinance Corp",
      domain: "globalfinance.com",
      industry: "Financial Services",
      revenue: "$200M",
      employees: 1000,
      status: "customer",
      priority: "high",
      urgencyScore: 91,
      salesData: {
        totalRevenue: "$500K",
        dealStage: "renewal",
        probability: 85,
        nextAction: "Contract renewal meeting Feb 25"
      }
    }
  };

  if (req.method === 'GET') {
    const account = accountDetails[id];
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    return res.status(200).json(account);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};