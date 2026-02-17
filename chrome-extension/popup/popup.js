/**
 * TheSalesSherpa Chrome Extension Popup
 * 
 * Handles user interaction, displays relationship intelligence,
 * and manages connection sync with TheSalesSherpa platform.
 */

class SherpaPopup {
  constructor() {
    this.currentTab = null;
    this.isLinkedIn = false;
    this.pageType = null;
    this.profileData = null;
    this.connectionData = null;
    
    this.init();
  }

  async init() {
    // Get current tab information
    await this.getCurrentTab();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Check initial state
    await this.checkPageState();
    
    // Load user preferences
    await this.loadPreferences();
  }

  async getCurrentTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tabs[0];
      this.isLinkedIn = this.currentTab.url.includes('linkedin.com');
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchSection(e.target.dataset.section);
      });
    });

    // Action buttons
    document.getElementById('open-linkedin')?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://www.linkedin.com' });
    });

    document.getElementById('get-intro-btn')?.addEventListener('click', () => {
      this.openTheSalesSherpa('/warm-intro');
    });

    document.getElementById('analyze-network-btn')?.addEventListener('click', () => {
      this.openTheSalesSherpa('/analyze');
    });

    document.getElementById('cold-outreach-btn')?.addEventListener('click', () => {
      this.openTheSalesSherpa('/cold-outreach');
    });

    document.getElementById('sync-connections-btn')?.addEventListener('click', () => {
      this.syncConnections();
    });

    // Settings toggles
    document.getElementById('auto-analyze')?.addEventListener('change', (e) => {
      this.updateSetting('autoAnalyze', e.target.checked);
    });

    document.getElementById('sync-enabled')?.addEventListener('change', (e) => {
      this.updateSetting('syncEnabled', e.target.checked);
    });

    document.getElementById('notifications-enabled')?.addEventListener('change', (e) => {
      this.updateSetting('notificationsEnabled', e.target.checked);
    });

    // Toast close
    document.getElementById('toast-close')?.addEventListener('click', () => {
      this.hideToast();
    });
  }

  async checkPageState() {
    if (!this.isLinkedIn) {
      this.showSection('not-linkedin');
      this.updateStatus('Not on LinkedIn', 'warning');
      return;
    }

    this.updateStatus('Analyzing page...', 'loading');
    
    try {
      // Ask content script about current page
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'CHECK_PAGE_TYPE'
      });

      this.pageType = response.pageType;

      if (response.pageType === 'profile') {
        await this.analyzeProfile();
      } else if (response.pageType === 'connections') {
        this.showSection('connection-sync');
        this.updateStatus('Ready to sync', 'ready');
      } else {
        this.showSection('not-linkedin');
        this.updateStatus('Navigate to a profile', 'warning');
      }
    } catch (error) {
      console.error('Error checking page state:', error);
      this.showSection('not-linkedin');
      this.updateStatus('Extension not active', 'error');
    }
  }

  async analyzeProfile() {
    this.showSection('loading-state');
    
    try {
      // Get profile data from content script
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'EXTRACT_PROFILE'
      });

      if (response.error) {
        throw new Error(response.error);
      }

      this.profileData = response;
      await this.displayProfileAnalysis();
      
    } catch (error) {
      console.error('Error analyzing profile:', error);
      this.showToast('Error analyzing profile: ' + error.message, 'error');
      this.showSection('not-linkedin');
      this.updateStatus('Analysis failed', 'error');
    }
  }

  async displayProfileAnalysis() {
    // Update profile header
    this.updateProfileHeader();
    
    // Get relationship intelligence from TheSalesSherpa
    const intelligence = await this.getRelationshipIntelligence();
    
    // Show appropriate result card
    this.showRelationshipResults(intelligence);
    
    // Switch to analysis view
    this.showSection('profile-analysis');
    this.updateStatus('Analysis complete', 'ready');
  }

  updateProfileHeader() {
    const nameEl = document.getElementById('profile-name');
    const titleEl = document.getElementById('profile-title');
    const picEl = document.getElementById('profile-pic');

    if (nameEl && this.profileData.name) {
      nameEl.textContent = this.profileData.name;
    }

    if (titleEl && this.profileData.headline) {
      titleEl.textContent = this.profileData.headline;
    }

    if (picEl && this.profileData.profilePicture) {
      picEl.src = this.profileData.profilePicture;
      picEl.style.display = 'block';
    }
  }

  async getRelationshipIntelligence() {
    try {
      const response = await fetch('https://thesalessherpa.ai/api/extension/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-ID': chrome.runtime.id
        },
        body: JSON.stringify({
          profileData: this.profileData,
          userId: await this.getUserId()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get intelligence');
      }

      return await response.json();
    } catch (error) {
      console.warn('Error getting relationship intelligence:', error);
      return {
        warmIntros: [],
        mutualConnections: this.profileData.mutualConnections || 0,
        networkAnalysis: null
      };
    }
  }

  showRelationshipResults(intelligence) {
    // Hide all result cards first
    document.querySelectorAll('.result-card').forEach(card => {
      card.classList.add('hidden');
    });

    if (intelligence.warmIntros && intelligence.warmIntros.length > 0) {
      this.showWarmIntroCard(intelligence.warmIntros[0]);
    } else if (intelligence.mutualConnections > 0) {
      this.showMutualConnectionsCard(intelligence.mutualConnections);
    } else {
      this.showNoConnectionsCard();
    }
  }

  showWarmIntroCard(intro) {
    const card = document.getElementById('warm-intro-card');
    const degreesEl = document.getElementById('intro-degrees');
    const connectorEl = document.getElementById('intro-connector');
    const successEl = document.getElementById('intro-success');

    if (degreesEl) degreesEl.textContent = `${intro.degrees}°`;
    if (connectorEl) connectorEl.textContent = intro.connectorName;
    if (successEl) successEl.textContent = `${Math.round(intro.successRate * 100)}%`;

    card.classList.remove('hidden');
  }

  showMutualConnectionsCard(count) {
    const card = document.getElementById('mutual-connections-card');
    const countEl = document.getElementById('mutual-count');

    if (countEl) countEl.textContent = count.toString();
    card.classList.remove('hidden');
  }

  showNoConnectionsCard() {
    const card = document.getElementById('no-connections-card');
    card.classList.remove('hidden');
  }

  async syncConnections() {
    const btn = document.getElementById('sync-connections-btn');
    const progressEl = document.getElementById('sync-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    // Disable button and show progress
    btn.disabled = true;
    btn.textContent = 'Syncing...';
    progressEl.classList.remove('hidden');

    try {
      // Start connection extraction
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'EXTRACT_CONNECTIONS'
      });

      if (response.error) {
        throw new Error(response.error);
      }

      this.connectionData = response;
      
      // Simulate progress for better UX
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        progressFill.style.width = `${progress}%`;
        
        if (progress < 50) {
          progressText.textContent = 'Extracting connections...';
        } else if (progress < 80) {
          progressText.textContent = 'Analyzing relationships...';
        } else {
          progressText.textContent = 'Saving to TheSalesSherpa...';
        }
      }, 200);

      // Send data to TheSalesSherpa
      await this.uploadConnectionData();
      
      // Complete progress
      clearInterval(progressInterval);
      progressFill.style.width = '100%';
      progressText.textContent = 'Sync complete!';
      
      // Update stats
      await this.updateConnectionStats();
      
      this.showToast('Connections synced successfully!', 'success');
      
    } catch (error) {
      console.error('Error syncing connections:', error);
      this.showToast('Sync failed: ' + error.message, 'error');
    } finally {
      // Reset button
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Import Connections';
        progressEl.classList.add('hidden');
      }, 2000);
    }
  }

  async uploadConnectionData() {
    const response = await fetch('https://thesalessherpa.ai/api/extension/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-ID': chrome.runtime.id
      },
      body: JSON.stringify({
        connections: this.connectionData.connections,
        profileData: this.profileData,
        userId: await this.getUserId()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to upload connection data');
    }

    return await response.json();
  }

  async updateConnectionStats() {
    try {
      const stats = await this.getNetworkStats();
      
      document.getElementById('connections-count').textContent = stats.connections.toLocaleString();
      document.getElementById('companies-count').textContent = stats.companies.toLocaleString();
      document.getElementById('warm-paths-count').textContent = stats.warmPaths.toLocaleString();
      
    } catch (error) {
      console.warn('Error updating stats:', error);
    }
  }

  async getNetworkStats() {
    try {
      const response = await fetch('https://thesalessherpa.ai/api/extension/stats', {
        method: 'GET',
        headers: {
          'X-Extension-ID': chrome.runtime.id,
          'X-User-ID': await this.getUserId()
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Error getting network stats:', error);
    }

    // Fallback to local data
    return {
      connections: this.connectionData?.connections.length || 0,
      companies: new Set(this.connectionData?.connections.map(c => c.company)).size || 0,
      warmPaths: 0
    };
  }

  switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.add('hidden');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }

    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }

  showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.add('hidden');
    });

    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.remove('hidden');
    }
  }

  updateStatus(message, type = 'ready') {
    const statusText = document.querySelector('.status-text');
    const statusDot = document.querySelector('.status-dot');

    if (statusText) {
      statusText.textContent = message;
    }

    if (statusDot) {
      statusDot.className = 'status-dot';
      if (type === 'error') {
        statusDot.classList.add('error');
      } else if (type === 'warning') {
        statusDot.classList.add('warning');
      }
    }
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toast-message');

    if (toast && messageEl) {
      messageEl.textContent = message;
      toast.className = `toast ${type}`;
      toast.classList.remove('hidden');

      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.hideToast();
      }, 5000);
    }
  }

  hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.classList.add('hidden');
    }
  }

  openTheSalesSherpa(path = '') {
    const url = `https://thesalessherpa.ai${path}`;
    chrome.tabs.create({ url });
  }

  async updateSetting(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
      
      // Notify content script of setting changes
      if (this.currentTab && this.isLinkedIn) {
        chrome.tabs.sendMessage(this.currentTab.id, {
          action: 'SETTING_UPDATED',
          setting: key,
          value: value
        });
      }
      
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  }

  async loadPreferences() {
    try {
      const result = await chrome.storage.local.get([
        'autoAnalyze',
        'syncEnabled', 
        'notificationsEnabled'
      ]);

      // Update toggle states
      const autoAnalyze = document.getElementById('auto-analyze');
      const syncEnabled = document.getElementById('sync-enabled');
      const notifications = document.getElementById('notifications-enabled');

      if (autoAnalyze) autoAnalyze.checked = result.autoAnalyze || false;
      if (syncEnabled) syncEnabled.checked = result.syncEnabled || false;
      if (notifications) notifications.checked = result.notificationsEnabled || false;

    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  async getUserId() {
    try {
      const result = await chrome.storage.local.get(['sherpaUserId']);
      return result.sherpaUserId || 'anonymous';
    } catch (error) {
      console.warn('Error getting user ID:', error);
      return 'anonymous';
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SherpaPopup();
});