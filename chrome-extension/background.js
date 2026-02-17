/**
 * TheSalesSherpa Chrome Extension Background Script
 * 
 * Handles extension lifecycle, API communication with TheSalesSherpa,
 * and coordinates between content scripts and popup.
 */

class SherpaBackground {
  constructor() {
    this.baseUrl = 'https://thesalessherpa.ai';
    this.apiEndpoints = {
      analyze: '/api/extension/analyze',
      sync: '/api/extension/sync',
      stats: '/api/extension/stats',
      auth: '/api/extension/auth'
    };
    
    this.init();
  }

  init() {
    // Set up message listeners
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle extension installation/updates
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Handle tab updates (navigation)
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // Handle extension startup
    chrome.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'PROFILE_EXTRACTED':
          await this.handleProfileExtracted(message.data, sender);
          sendResponse({ success: true });
          break;

        case 'CONNECTIONS_EXTRACTED':
          await this.handleConnectionsExtracted(message.data, sender);
          sendResponse({ success: true });
          break;

        case 'SALES_NAV_EXTRACTED':
          await this.handleSalesNavExtracted(message.data, sender);
          sendResponse({ success: true });
          break;

        case 'GET_RELATIONSHIP_INTEL':
          const intel = await this.getRelationshipIntelligence(message.profileData);
          sendResponse(intel);
          break;

        case 'SYNC_CONNECTIONS':
          const syncResult = await this.syncConnections(message.data);
          sendResponse(syncResult);
          break;

        case 'GET_NETWORK_STATS':
          const stats = await this.getNetworkStats(message.userId);
          sendResponse(stats);
          break;

        case 'AUTHENTICATE':
          const authResult = await this.authenticateUser(message.credentials);
          sendResponse(authResult);
          break;

        case 'LOG_EVENT':
          await this.logEvent(message.event, message.data);
          sendResponse({ success: true });
          break;

        default:
          console.warn('Unknown message action:', message.action);
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  async handleInstallation(details) {
    if (details.reason === 'install') {
      // First time installation
      await this.setupExtension();
      
      // Open welcome page
      chrome.tabs.create({
        url: `${this.baseUrl}/extension/welcome`
      });
      
    } else if (details.reason === 'update') {
      // Extension updated
      await this.handleExtensionUpdate(details.previousVersion);
    }
  }

  async setupExtension() {
    // Initialize default settings
    const defaultSettings = {
      autoAnalyze: true,
      syncEnabled: true,
      notificationsEnabled: true,
      sherpaConsent: false,
      sherpaEnabled: false,
      installDate: new Date().toISOString(),
      version: chrome.runtime.getManifest().version
    };

    await chrome.storage.local.set(defaultSettings);

    // Generate unique extension ID for this installation
    const extensionId = this.generateUniqueId();
    await chrome.storage.local.set({ extensionId });

    console.log('TheSalesSherpa extension setup complete');
  }

  async handleTabUpdate(tabId, changeInfo, tab) {
    // Only process complete navigation changes on LinkedIn
    if (changeInfo.status !== 'complete' || !tab.url?.includes('linkedin.com')) {
      return;
    }

    // Check if auto-analyze is enabled
    const settings = await chrome.storage.local.get(['autoAnalyze', 'sherpaEnabled', 'sherpaConsent']);
    
    if (!settings.autoAnalyze || !settings.sherpaEnabled || !settings.sherpaConsent) {
      return;
    }

    // Inject content script if not already present
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/linkedin-parser.js']
      });
    } catch (error) {
      // Content script might already be injected
      console.debug('Content script injection skipped:', error.message);
    }
  }

  async handleProfileExtracted(profileData, sender) {
    // Store extracted profile data
    await this.storeProfileData(profileData);

    // Get relationship intelligence if user is authenticated
    const userId = await this.getUserId();
    if (userId !== 'anonymous') {
      try {
        const intelligence = await this.getRelationshipIntelligence(profileData, userId);
        
        // Send intelligence back to content script
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'RELATIONSHIP_INTEL_READY',
          data: intelligence
        });

        // Show notification if warm intro available
        if (intelligence.warmIntros && intelligence.warmIntros.length > 0) {
          this.showWarmIntroNotification(intelligence.warmIntros[0], profileData);
        }

      } catch (error) {
        console.error('Error processing relationship intelligence:', error);
      }
    }
  }

  async handleConnectionsExtracted(connectionData, sender) {
    // Store connection data temporarily
    const key = `connections_${sender.tab.id}`;
    await chrome.storage.local.set({ [key]: connectionData });

    // If sync is enabled, automatically sync to TheSalesSherpa
    const settings = await chrome.storage.local.get(['syncEnabled']);
    if (settings.syncEnabled) {
      try {
        await this.syncConnections(connectionData);
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }
  }

  async getRelationshipIntelligence(profileData, userId) {
    try {
      const response = await fetch(`${this.baseUrl}${this.apiEndpoints.analyze}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-ID': chrome.runtime.id,
          'X-User-ID': userId || await this.getUserId()
        },
        body: JSON.stringify({
          profileData,
          analysisType: 'full'
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const intelligence = await response.json();
      
      // Cache the result
      const cacheKey = `intel_${profileData.linkedinId}`;
      await chrome.storage.local.set({
        [cacheKey]: {
          data: intelligence,
          timestamp: Date.now()
        }
      });

      return intelligence;

    } catch (error) {
      console.error('Error getting relationship intelligence:', error);
      return {
        warmIntros: [],
        mutualConnections: profileData.mutualConnections || 0,
        networkAnalysis: null,
        error: error.message
      };
    }
  }

  async syncConnections(connectionData) {
    const userId = await this.getUserId();
    
    if (userId === 'anonymous') {
      throw new Error('Authentication required for sync');
    }

    try {
      const response = await fetch(`${this.baseUrl}${this.apiEndpoints.sync}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-ID': chrome.runtime.id,
          'X-User-ID': userId
        },
        body: JSON.stringify({
          connections: connectionData.connections,
          extractedAt: connectionData.extractedAt || new Date().toISOString(),
          source: 'chrome_extension'
        })
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Update sync timestamp
      await chrome.storage.local.set({
        lastSyncTime: new Date().toISOString(),
        lastSyncCount: connectionData.connections.length
      });

      return result;

    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    }
  }

  async getNetworkStats(userId) {
    try {
      const response = await fetch(`${this.baseUrl}${this.apiEndpoints.stats}`, {
        method: 'GET',
        headers: {
          'X-Extension-ID': chrome.runtime.id,
          'X-User-ID': userId || await this.getUserId()
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Stats API error: ${response.status}`);
      }

    } catch (error) {
      console.error('Error getting network stats:', error);
      
      // Return cached/local stats as fallback
      const localStats = await chrome.storage.local.get([
        'lastSyncCount',
        'extractedProfiles'
      ]);

      return {
        connections: localStats.lastSyncCount || 0,
        companies: 0,
        warmPaths: 0,
        lastSync: localStats.lastSyncTime || null
      };
    }
  }

  async storeProfileData(profileData) {
    // Store in local cache with expiration
    const cacheKey = `profile_${profileData.linkedinId}`;
    const cacheData = {
      data: profileData,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    await chrome.storage.local.set({ [cacheKey]: cacheData });

    // Keep track of extracted profiles
    const { extractedProfiles = [] } = await chrome.storage.local.get(['extractedProfiles']);
    
    if (!extractedProfiles.includes(profileData.linkedinId)) {
      extractedProfiles.push(profileData.linkedinId);
      await chrome.storage.local.set({ extractedProfiles });
    }
  }

  showWarmIntroNotification(warmIntro, profileData) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Warm Introduction Available!',
      message: `${warmIntro.degrees}° connection to ${profileData.name} via ${warmIntro.connectorName}`,
      buttons: [
        { title: 'Get Introduction' },
        { title: 'View Details' }
      ]
    });

    // Handle notification clicks
    chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
      if (buttonIndex === 0) {
        // Get Introduction
        chrome.tabs.create({
          url: `${this.baseUrl}/warm-intro/${warmIntro.id}`
        });
      } else {
        // View Details
        chrome.tabs.create({
          url: `${this.baseUrl}/analyze/${profileData.linkedinId}`
        });
      }
      chrome.notifications.clear(notificationId);
    });
  }

  async logEvent(eventType, eventData) {
    // Log analytics events
    try {
      const userId = await this.getUserId();
      const extensionId = await this.getExtensionId();

      const logData = {
        eventType,
        eventData,
        userId,
        extensionId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        extensionVersion: chrome.runtime.getManifest().version
      };

      // Send to analytics endpoint (fire and forget)
      fetch(`${this.baseUrl}/api/extension/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      }).catch(error => {
        console.debug('Analytics logging failed:', error);
      });

    } catch (error) {
      console.debug('Event logging failed:', error);
    }
  }

  async getUserId() {
    try {
      const result = await chrome.storage.local.get(['sherpaUserId']);
      return result.sherpaUserId || 'anonymous';
    } catch (error) {
      return 'anonymous';
    }
  }

  async getExtensionId() {
    try {
      const result = await chrome.storage.local.get(['extensionId']);
      return result.extensionId || chrome.runtime.id;
    } catch (error) {
      return chrome.runtime.id;
    }
  }

  generateUniqueId() {
    return 'ext_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  async handleExtensionUpdate(previousVersion) {
    // Handle extension updates
    console.log(`Extension updated from ${previousVersion} to ${chrome.runtime.getManifest().version}`);
    
    // Clear old cache if major version change
    const [prevMajor] = previousVersion.split('.');
    const [currentMajor] = chrome.runtime.getManifest().version.split('.');
    
    if (prevMajor !== currentMajor) {
      await this.clearOldCache();
    }

    // Update version in storage
    await chrome.storage.local.set({
      version: chrome.runtime.getManifest().version,
      updateDate: new Date().toISOString()
    });
  }

  async clearOldCache() {
    // Clear cached data older than 30 days
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const storage = await chrome.storage.local.get();
    
    const keysToRemove = [];
    
    for (const [key, value] of Object.entries(storage)) {
      if (key.startsWith('profile_') || key.startsWith('intel_')) {
        if (value.timestamp && value.timestamp < cutoff) {
          keysToRemove.push(key);
        }
      }
    }

    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
      console.log(`Cleared ${keysToRemove.length} old cache entries`);
    }
  }

  async handleStartup() {
    // Clean up old data on startup
    await this.clearOldCache();
    
    // Log startup event
    await this.logEvent('extension_startup', {
      version: chrome.runtime.getManifest().version
    });
  }
}

// Initialize background script
new SherpaBackground();