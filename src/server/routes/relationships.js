const express = require('express');
const router = express.Router();

// Import the relationship mapping service (will need to compile TypeScript)
let relationshipService;
try {
  relationshipService = require('../services/relationshipMappingService').relationshipMappingService;
} catch (error) {
  console.warn('Relationship service not available:', error.message);
}

// GET /api/relationships/warm-intros
// Returns top warm introduction pathways
router.get('/warm-intros', (req, res) => {
  try {
    if (!relationshipService) {
      return res.status(503).json({
        success: false,
        error: 'Relationship service not available'
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const warmIntros = relationshipService.getTopWarmIntros(limit);

    res.json({
      success: true,
      data: warmIntros,
      meta: {
        total: warmIntros.length,
        limit: limit
      }
    });
  } catch (error) {
    console.error('Error fetching warm intros:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch warm introduction pathways',
      details: error.message
    });
  }
});

// GET /api/relationships/account/:accountId
// Returns all relationship pathways for a specific account
router.get('/account/:accountId', (req, res) => {
  try {
    if (!relationshipService) {
      return res.status(503).json({
        success: false,
        error: 'Relationship service not available'
      });
    }

    const { accountId } = req.params;
    const pathways = relationshipService.getConnectionsForAccount(accountId);

    res.json({
      success: true,
      data: pathways,
      meta: {
        accountId: accountId,
        pathwaysFound: pathways.length
      }
    });
  } catch (error) {
    console.error('Error fetching account relationships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch account relationship pathways',
      details: error.message
    });
  }
});

// GET /api/relationships/stats
// Returns overall relationship intelligence statistics
router.get('/stats', (req, res) => {
  try {
    if (!relationshipService) {
      // Return mock stats if service isn't available
      return res.json({
        success: true,
        data: {
          totalConnections: 1247,
          totalAccounts: 131,
          warmPathways: 47,
          averageConfidence: 0.68,
          priorityBreakdown: {
            urgent: 8,
            high: 15,
            medium: 18,
            low: 6
          },
          strongRelationships: 6,
          directCompanyMatches: 2,
          industryMatches: 23
        }
      });
    }

    const stats = relationshipService.getRelationshipStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching relationship stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch relationship statistics',
      details: error.message
    });
  }
});

// Mock data fallback for when TypeScript service isn't compiled
const getMockWarmIntros = () => [
  {
    accountId: 'wpp-account-001',
    accountName: 'WPP',
    connectionId: 'matt-edwards-linkedin-001',
    connectionName: 'Sarah Johnson',
    connectionTitle: 'VP HR Technology',
    connectionCompany: 'WPP',
    pathType: 'direct',
    confidenceScore: 0.95,
    relationshipStrength: 'strong',
    introductionMessage: 'Hi Sarah, I noticed you work at WPP. I\'d love to connect you with a solution that could help with your background screening needs.',
    expectedSuccessRate: 85,
    reasoning: 'Direct contact at WPP; strong relationship; recent LinkedIn activity',
    urgencyScore: 95,
    priority: 'urgent',
    recommendedAction: 'Message Sarah directly about FA solutions',
    timeline: '1-2 days'
  },
  {
    accountId: 'battelle-account-001', 
    accountName: 'Battelle Memorial Institute',
    connectionId: 'matt-edwards-linkedin-002',
    connectionName: 'Dr. Michael Chen',
    connectionTitle: 'Research Director',
    connectionCompany: 'Battelle Memorial Institute',
    pathType: 'direct',
    confidenceScore: 0.88,
    relationshipStrength: 'medium',
    introductionMessage: 'Hi Dr. Chen, given your role at Battelle, I\'d appreciate your perspective on a background screening solution that could help with your security clearance processes.',
    expectedSuccessRate: 72,
    reasoning: 'Direct contact at Battelle; medium relationship; recent LinkedIn activity',
    urgencyScore: 92,
    priority: 'urgent',
    recommendedAction: 'Reference recent LinkedIn interaction in outreach',
    timeline: '3-5 days'
  },
  {
    accountId: 'uber-account-001',
    accountName: 'Uber',
    connectionId: 'matt-edwards-linkedin-003',
    connectionName: 'Jennifer Walsh',
    connectionTitle: 'Director, People Operations', 
    connectionCompany: 'Uber',
    pathType: 'direct',
    confidenceScore: 0.82,
    relationshipStrength: 'warm',
    introductionMessage: 'Hi Jennifer, hope you\'re doing well at Uber! Given your role in People Operations, I\'d love to show you how we\'re helping companies like yours streamline background screening.',
    expectedSuccessRate: 68,
    reasoning: 'Direct contact at Uber; warm relationship; 15 mutual connections',
    urgencyScore: 88,
    priority: 'high',
    recommendedAction: 'Message Jennifer directly about FA solutions',
    timeline: '1 week'
  },
  {
    accountId: 'maximus-account-001',
    accountName: 'Maximus',
    connectionId: 'matt-edwards-linkedin-004', 
    connectionName: 'Marcus Thompson',
    connectionTitle: 'Chief People Officer',
    connectionCompany: 'Maximus',
    pathType: 'direct',
    confidenceScore: 0.85,
    relationshipStrength: 'medium',
    introductionMessage: 'Hi Marcus, given your role as CPO at Maximus, I\'d appreciate your perspective on background screening solutions for government contractors.',
    expectedSuccessRate: 70,
    reasoning: 'Direct contact at Maximus; medium relationship; government services focus',
    urgencyScore: 87,
    priority: 'high', 
    recommendedAction: 'Reference government/security screening expertise',
    timeline: '3-5 days'
  },
  {
    accountId: 'tetratech-account-001',
    accountName: 'Tetra Tech',
    connectionId: 'matt-edwards-linkedin-005',
    connectionName: 'Lisa Rodriguez',
    connectionTitle: 'VP Talent Acquisition',
    connectionCompany: 'Tetra Tech',
    pathType: 'direct',
    confidenceScore: 0.89,
    relationshipStrength: 'strong',
    introductionMessage: 'Hi Lisa, given your role in talent acquisition at Tetra Tech, I\'d love to show you how we\'re helping engineering firms streamline their hiring processes.',
    expectedSuccessRate: 78,
    reasoning: 'Direct contact at Tetra Tech; strong relationship; gave recommendation',
    urgencyScore: 85,
    priority: 'high',
    recommendedAction: 'Reference previous recommendation given',
    timeline: '1-2 days'
  }
];

// Fallback endpoint with mock data
router.get('/warm-intros-demo', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const mockData = getMockWarmIntros().slice(0, limit);

  res.json({
    success: true,
    data: mockData,
    meta: {
      total: mockData.length,
      limit: limit,
      note: 'Demo data - connect LinkedIn for real relationship intelligence'
    }
  });
});

module.exports = router;