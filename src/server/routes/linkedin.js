/**
 * LinkedIn Integration Routes for TheSalesSherpa
 * 
 * Handles Chrome extension requests, profile analysis,
 * and LinkedIn data processing.
 */

const express = require('express');
const router = express.Router();

// Import services
const LinkedInService = require('../services/linkedinService').default;
const LinkedInRelationshipEngine = require('../services/linkedinRelationshipEngine').default;

// Initialize LinkedIn service with environment variables
const linkedinService = new LinkedInService({
  chromeExtensionUrl: process.env.CHROME_EXTENSION_URL || 'http://localhost:3001',
  chromeExtensionApiKey: process.env.CHROME_EXTENSION_API_KEY,
  proxycurlApiKey: process.env.PROXYCURL_API_KEY,
  peopleDataLabsApiKey: process.env.PEOPLE_DATA_LABS_API_KEY
});

/**
 * Middleware to validate Chrome extension requests
 */
const validateExtensionRequest = (req, res, next) => {
  const extensionId = req.headers['x-extension-id'];
  const allowedExtensions = process.env.ALLOWED_EXTENSION_IDS?.split(',') || [];
  
  if (!extensionId) {
    return res.status(401).json({ error: 'Extension ID required' });
  }
  
  // In development, allow any extension ID
  if (process.env.NODE_ENV !== 'production' || allowedExtensions.includes(extensionId)) {
    req.extensionId = extensionId;
    return next();
  }
  
  return res.status(403).json({ error: 'Extension not authorized' });
};

/**
 * Get user ID from request headers or session
 */
const getUserId = (req) => {
  return req.headers['x-user-id'] || 
         req.session?.userId || 
         req.user?.id || 
         'anonymous';
};

/**
 * POST /api/linkedin/analyze
 * Analyze a LinkedIn profile for relationship intelligence
 */
router.post('/analyze', validateExtensionRequest, async (req, res) => {
  try {
    const { profileData, analysisType = 'basic' } = req.body;
    const userId = getUserId(req);

    if (!profileData || !profileData.url) {
      return res.status(400).json({ error: 'Profile data with URL required' });
    }

    // Create relationship engine for user
    const relationshipEngine = new LinkedInRelationshipEngine(userId, linkedinService);

    // Import user's network if not already done (check cache)
    const networkCacheKey = `network_${userId}`;
    let networkImported = req.session?.[networkCacheKey];
    
    if (!networkImported && userId !== 'anonymous') {
      try {
        // Attempt to load existing network or import from LinkedIn
        await relationshipEngine.importLinkedInNetwork(
          `https://www.linkedin.com/in/${userId}`, // Placeholder - would need real user LinkedIn URL
          {
            includeSecondDegree: analysisType === 'full',
            maxConnections: analysisType === 'full' ? 1000 : 500,
            minConnectionStrength: 0.2
          }
        );
        
        if (req.session) {
          req.session[networkCacheKey] = true;
        }
      } catch (error) {
        console.warn('Network import failed, using cached data:', error.message);
      }
    }

    // Find warm introduction opportunities
    const opportunities = await relationshipEngine.findWarmIntroOpportunities(
      profileData.url,
      {
        maxPaths: analysisType === 'full' ? 5 : 3,
        includeWeakConnections: analysisType === 'full',
        contextRequired: true
      }
    );

    // Get mutual connections count
    const mutualConnections = profileData.mutualConnections || 0;

    // Build response
    const response = {
      profileId: profileData.linkedinId || profileData.url,
      profileName: profileData.name,
      analysisType,
      mutualConnections,
      warmIntros: opportunities.map(opp => ({
        id: `intro_${opp.targetProfile.id}_${Date.now()}`,
        targetId: opp.targetProfile.id,
        targetName: opp.targetProfile.fullName,
        degrees: opp.pathResult.degrees,
        confidence: opp.pathResult.confidence,
        successRate: opp.expectedOutcome.responseRate,
        connectorName: opp.pathResult.path[1]?.name,
        connectorId: opp.pathResult.path[1]?.nodeId,
        introMessage: opp.suggestedApproach.primaryMessage,
        urgencyScore: opp.urgencyScore,
        contextScore: opp.contextScore,
        estimatedResponseTime: opp.expectedOutcome.timeToResponse,
        path: opp.pathResult.path.map(hop => ({
          name: hop.name,
          title: hop.title,
          company: hop.company
        }))
      })),
      networkAnalysis: {
        totalConnections: relationshipEngine.getNetworkStats?.()?.totalNodes || 0,
        reachableContacts: relationshipEngine.getNetworkStats?.()?.secondDegree || 0,
        strongConnections: relationshipEngine.getNetworkStats?.()?.directConnections || 0
      },
      recommendations: generateRecommendations(opportunities, mutualConnections),
      analyzedAt: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    console.error('LinkedIn analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

/**
 * POST /api/linkedin/sync
 * Sync LinkedIn connections from Chrome extension
 */
router.post('/sync', validateExtensionRequest, async (req, res) => {
  try {
    const { connections, profileData, extractedAt } = req.body;
    const userId = getUserId(req);

    if (!connections || !Array.isArray(connections)) {
      return res.status(400).json({ error: 'Connections array required' });
    }

    if (userId === 'anonymous') {
      return res.status(401).json({ error: 'Authentication required for sync' });
    }

    // Process and validate connection data
    const processedConnections = connections
      .filter(conn => conn.name && conn.profileUrl)
      .map(conn => ({
        id: generateConnectionId(conn.profileUrl),
        name: conn.name,
        title: conn.title || '',
        company: extractCompanyName(conn.title),
        location: conn.location || '',
        linkedinUrl: conn.profileUrl,
        linkedinId: extractLinkedInId(conn.profileUrl),
        mutualConnections: conn.mutualConnections || 0,
        extractedAt: extractedAt || new Date().toISOString(),
        source: 'chrome_extension'
      }));

    // Store connections in database (mock implementation)
    const syncResult = await storeConnections(userId, processedConnections);

    // Update user's relationship network
    if (syncResult.success) {
      try {
        const relationshipEngine = new LinkedInRelationshipEngine(userId, linkedinService);
        
        // Import the synced connections into the relationship graph
        const nodes = processedConnections.map(conn => ({
          id: conn.id,
          type: 'connection',
          name: conn.name,
          title: conn.title,
          company: conn.company,
          linkedinId: conn.linkedinId,
          linkedinUrl: conn.linkedinUrl
        }));

        const edges = processedConnections.map(conn => ({
          sourceId: userId,
          targetId: conn.id,
          relationshipType: 'colleague', // Default - could be enhanced
          strength: calculateConnectionStrength(conn),
          context: `LinkedIn connection`,
          verified: true
        }));

        relationshipEngine.loadNetwork(nodes, edges);
        
      } catch (error) {
        console.warn('Relationship engine update failed:', error);
        // Don't fail the sync if relationship engine fails
      }
    }

    // Build response
    const response = {
      success: syncResult.success,
      connectionsProcessed: processedConnections.length,
      connectionsStored: syncResult.stored,
      duplicatesSkipped: syncResult.duplicates,
      errors: syncResult.errors,
      syncId: syncResult.syncId,
      syncedAt: new Date().toISOString(),
      stats: {
        totalConnections: syncResult.totalConnections,
        newConnections: syncResult.newConnections,
        companiesFound: new Set(processedConnections.map(c => c.company)).size
      }
    };

    res.json(response);

  } catch (error) {
    console.error('LinkedIn sync error:', error);
    res.status(500).json({ 
      error: 'Sync failed', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

/**
 * GET /api/linkedin/stats
 * Get user's LinkedIn network statistics
 */
router.get('/stats', validateExtensionRequest, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (userId === 'anonymous') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get stats from database (mock implementation)
    const stats = await getNetworkStats(userId);

    res.json(stats);

  } catch (error) {
    console.error('LinkedIn stats error:', error);
    res.status(500).json({ 
      error: 'Stats retrieval failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

/**
 * POST /api/linkedin/check-intel
 * Check if relationship intelligence is available for a profile
 */
router.post('/check-intel', validateExtensionRequest, async (req, res) => {
  try {
    const { profileUrl, linkedinId } = req.body;
    const userId = getUserId(req);

    if (!profileUrl && !linkedinId) {
      return res.status(400).json({ error: 'Profile URL or LinkedIn ID required' });
    }

    // Quick check if we have intelligence for this profile
    const hasIntelligence = await checkIntelligenceAvailability(userId, profileUrl || linkedinId);

    res.json({
      hasIntelligence,
      profileId: linkedinId || extractLinkedInId(profileUrl),
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Intelligence check error:', error);
    res.status(500).json({ error: 'Check failed' });
  }
});

/**
 * POST /api/linkedin/profile
 * Get enhanced LinkedIn profile data
 */
router.post('/profile', validateExtensionRequest, async (req, res) => {
  try {
    const { linkedinUrl } = req.body;

    if (!linkedinUrl) {
      return res.status(400).json({ error: 'LinkedIn URL required' });
    }

    // Get profile data using LinkedIn service
    const profile = await linkedinService.getProfile(linkedinUrl);

    res.json({
      profile,
      enhancedAt: new Date().toISOString(),
      dataSource: profile.dataSource,
      confidence: profile.confidence
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Profile fetch failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

/**
 * POST /api/linkedin/analytics
 * Log analytics events from Chrome extension
 */
router.post('/analytics', async (req, res) => {
  try {
    const { eventType, eventData, userId, extensionId, timestamp } = req.body;

    // Log analytics event (implement based on your analytics system)
    console.log('Extension Analytics:', {
      eventType,
      eventData,
      userId,
      extensionId,
      timestamp
    });

    // Store in analytics database if needed
    // await logAnalyticsEvent({ eventType, eventData, userId, extensionId, timestamp });

    res.json({ success: true });

  } catch (error) {
    console.error('Analytics logging error:', error);
    res.status(500).json({ error: 'Analytics logging failed' });
  }
});

/**
 * Helper Functions
 */

function generateConnectionId(profileUrl) {
  const linkedinId = extractLinkedInId(profileUrl);
  return linkedinId ? `linkedin_${linkedinId}` : `url_${Buffer.from(profileUrl).toString('base64').substring(0, 16)}`;
}

function extractLinkedInId(url) {
  const match = url.match(/linkedin\.com\/in\/([^/?]+)/);
  return match ? match[1] : null;
}

function extractCompanyName(title) {
  // Extract company name from title like "Software Engineer at Google"
  const match = title?.match(/at\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function calculateConnectionStrength(connection) {
  let strength = 0.5; // Base strength

  // Boost for mutual connections
  if (connection.mutualConnections > 0) {
    strength += Math.min(connection.mutualConnections * 0.02, 0.3);
  }

  // Boost for complete profiles
  if (connection.title && connection.company) {
    strength += 0.1;
  }

  return Math.min(strength, 1.0);
}

function generateRecommendations(opportunities, mutualConnections) {
  const recommendations = [];

  if (opportunities.length > 0) {
    const bestOpp = opportunities[0];
    recommendations.push({
      type: 'warm_intro',
      priority: 'high',
      title: 'Request Warm Introduction',
      description: `You have a ${bestOpp.pathResult.degrees}° connection with ${Math.round(bestOpp.expectedOutcome.responseRate * 100)}% success rate`,
      action: 'get_introduction',
      actionData: { opportunityId: bestOpp.pathResult.targetId }
    });
  } else if (mutualConnections > 0) {
    recommendations.push({
      type: 'mutual_connections',
      priority: 'medium',
      title: 'Explore Mutual Connections',
      description: `${mutualConnections} mutual connections might facilitate an introduction`,
      action: 'analyze_network',
      actionData: { mutualCount: mutualConnections }
    });
  } else {
    recommendations.push({
      type: 'cold_outreach',
      priority: 'low',
      title: 'Consider Cold Outreach',
      description: 'No warm introduction paths found - craft a personalized cold message',
      action: 'cold_outreach_tips',
      actionData: {}
    });
  }

  return recommendations;
}

async function storeConnections(userId, connections) {
  // Mock implementation - replace with actual database operations
  return {
    success: true,
    stored: connections.length,
    duplicates: 0,
    errors: [],
    syncId: `sync_${Date.now()}`,
    totalConnections: connections.length,
    newConnections: connections.length
  };
}

async function getNetworkStats(userId) {
  // Mock implementation - replace with actual database queries
  return {
    connections: 847,
    companies: 156,
    warmPaths: 23,
    lastSync: new Date().toISOString(),
    networkStrength: 0.73,
    topCompanies: [
      { name: 'Microsoft', count: 23 },
      { name: 'Google', count: 18 },
      { name: 'Meta', count: 15 }
    ]
  };
}

async function checkIntelligenceAvailability(userId, profileIdentifier) {
  // Mock implementation - check if we have relationship data for this profile
  // In real implementation, query your relationship database
  return Math.random() > 0.7; // 30% chance of having intelligence
}

module.exports = router;