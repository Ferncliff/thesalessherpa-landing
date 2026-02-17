/**
 * LinkedIn Data Parser for TheSalesSherpa Chrome Extension
 * 
 * Extracts profile and connection data from LinkedIn pages
 * with privacy-first approach and user consent.
 */

class LinkedInParser {
  constructor() {
    this.baseUrl = 'https://thesalessherpa.ai'; // Production URL
    this.isEnabled = false;
    this.userConsent = false;
    
    this.init();
  }

  async init() {
    // Check if user has given consent
    const result = await chrome.storage.local.get(['sherpaConsent', 'sherpaEnabled']);
    this.userConsent = result.sherpaConsent || false;
    this.isEnabled = result.sherpaEnabled || false;

    if (this.isEnabled && this.userConsent) {
      this.setupPageAnalysis();
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open
    });
  }

  setupPageAnalysis() {
    // Detect current page type
    const currentPage = this.detectPageType();
    
    if (currentPage) {
      this.analyzePage(currentPage);
    }

    // Watch for navigation changes (LinkedIn is SPA)
    this.observeNavigation();
  }

  detectPageType() {
    const url = window.location.href;
    const path = window.location.pathname;

    if (path.includes('/in/')) {
      return 'profile';
    } else if (path.includes('/company/')) {
      return 'company';
    } else if (path.includes('/mynetwork/')) {
      return 'connections';
    } else if (path.includes('/search/results/people/')) {
      return 'people_search';
    } else if (url.includes('/sales/')) {
      return 'sales_navigator';
    }

    return null;
  }

  async analyzePage(pageType) {
    try {
      switch (pageType) {
        case 'profile':
          await this.analyzeProfile();
          break;
        case 'company':
          await this.analyzeCompany();
          break;
        case 'connections':
          await this.analyzeConnections();
          break;
        case 'people_search':
          await this.analyzeSearchResults();
          break;
        case 'sales_navigator':
          await this.analyzeSalesNavigator();
          break;
      }
    } catch (error) {
      console.error('TheSalesSherpa: Error analyzing page:', error);
    }
  }

  async analyzeProfile() {
    // Wait for page to load
    await this.waitForElement('[data-generated-suggestion-target]');

    const profileData = {
      url: window.location.href,
      linkedinId: this.extractLinkedInId(window.location.href),
      name: this.extractProfileName(),
      headline: this.extractHeadline(),
      location: this.extractLocation(),
      connections: this.extractConnectionCount(),
      mutualConnections: this.extractMutualConnections(),
      currentExperience: this.extractCurrentExperience(),
      education: this.extractEducation(),
      skills: this.extractSkills(),
      about: this.extractAbout(),
      profilePicture: this.extractProfilePicture(),
      isConnected: this.checkConnectionStatus(),
      extractedAt: new Date().toISOString()
    };

    // Show Sherpa widget for this profile
    await this.showSherpaWidget(profileData);

    // Send to background for processing
    chrome.runtime.sendMessage({
      action: 'PROFILE_EXTRACTED',
      data: profileData
    });

    return profileData;
  }

  async analyzeConnections() {
    // Extract visible connections from My Network page
    const connections = [];
    const connectionCards = document.querySelectorAll('[data-test-component="search-result"]');

    for (const card of connectionCards) {
      try {
        const connection = {
          name: card.querySelector('span[aria-hidden="true"]')?.textContent?.trim(),
          title: card.querySelector('.entity-result__primary-subtitle')?.textContent?.trim(),
          location: card.querySelector('.entity-result__secondary-subtitle')?.textContent?.trim(),
          profileUrl: card.querySelector('a[href*="/in/"]')?.href,
          mutualConnections: this.extractMutualConnectionsFromCard(card),
          extractedAt: new Date().toISOString()
        };

        if (connection.name && connection.profileUrl) {
          connections.push(connection);
        }
      } catch (error) {
        console.warn('Error extracting connection:', error);
      }
    }

    chrome.runtime.sendMessage({
      action: 'CONNECTIONS_EXTRACTED',
      data: { connections, totalFound: connections.length }
    });

    return connections;
  }

  async analyzeSalesNavigator() {
    // Extract Sales Navigator specific data if user has access
    const salesNavData = {
      isActivated: this.checkSalesNavigatorAccess(),
      searchResults: this.extractSalesNavSearchResults(),
      savedLeads: this.extractSavedLeads(),
      teamLink: this.extractTeamLinkData()
    };

    chrome.runtime.sendMessage({
      action: 'SALES_NAV_EXTRACTED',
      data: salesNavData
    });

    return salesNavData;
  }

  // Extraction helper methods
  extractLinkedInId(url) {
    const match = url.match(/linkedin\.com\/in\/([^/?]+)/);
    return match ? match[1] : null;
  }

  extractProfileName() {
    return document.querySelector('h1')?.textContent?.trim() || 
           document.querySelector('[data-generated-suggestion-target] h1')?.textContent?.trim();
  }

  extractHeadline() {
    return document.querySelector('[data-generated-suggestion-target] .text-body-medium')?.textContent?.trim() ||
           document.querySelector('.top-card-layout__headline')?.textContent?.trim();
  }

  extractLocation() {
    return document.querySelector('.top-card-layout__first-subline')?.textContent?.trim() ||
           document.querySelector('[data-generated-suggestion-target] .text-body-small')?.textContent?.trim();
  }

  extractConnectionCount() {
    const connectionText = document.querySelector('a[href*="/search/results/people/"]')?.textContent;
    if (connectionText) {
      const match = connectionText.match(/(\d+[\d,]*)\s*connection/i);
      return match ? parseInt(match[1].replace(/,/g, '')) : null;
    }
    return null;
  }

  extractMutualConnections() {
    const mutualText = document.querySelector('[href*="facetNetwork"]')?.textContent;
    if (mutualText) {
      const match = mutualText.match(/(\d+)\s*mutual/i);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  }

  extractCurrentExperience() {
    const experienceSection = document.querySelector('#experience');
    if (!experienceSection) return null;

    const firstJob = experienceSection.closest('.pvs-list__container')?.querySelector('.pvs-list__item--line-separated');
    if (!firstJob) return null;

    return {
      title: firstJob.querySelector('.mr1.t-bold')?.textContent?.trim(),
      company: firstJob.querySelector('.t-14.t-normal span')?.textContent?.trim(),
      duration: firstJob.querySelector('.t-14.t-normal.t-black--light span')?.textContent?.trim()
    };
  }

  extractEducation() {
    const educationSection = document.querySelector('#education');
    if (!educationSection) return [];

    const schools = [];
    const educationItems = educationSection.closest('.pvs-list__container')?.querySelectorAll('.pvs-list__item--line-separated') || [];

    for (const item of educationItems) {
      schools.push({
        school: item.querySelector('.mr1.t-bold')?.textContent?.trim(),
        degree: item.querySelector('.t-14.t-normal span')?.textContent?.trim(),
        years: item.querySelector('.t-14.t-normal.t-black--light span')?.textContent?.trim()
      });
    }

    return schools;
  }

  extractSkills() {
    const skillsSection = document.querySelector('#skills');
    if (!skillsSection) return [];

    const skills = [];
    const skillItems = skillsSection.closest('.pvs-list__container')?.querySelectorAll('.mr1.t-bold') || [];

    for (const skill of skillItems) {
      skills.push(skill.textContent?.trim());
    }

    return skills.filter(Boolean);
  }

  extractAbout() {
    const aboutSection = document.querySelector('#about');
    return aboutSection?.closest('.pvs-list__container')?.querySelector('.full-width')?.textContent?.trim();
  }

  extractProfilePicture() {
    return document.querySelector('.pv-top-card-profile-picture__image')?.src ||
           document.querySelector('img[data-ghost-classes]')?.src;
  }

  checkConnectionStatus() {
    // Check if "Connect" button exists
    const connectButton = document.querySelector('[aria-label*="Connect"]');
    const messageButton = document.querySelector('[aria-label*="Message"]');
    
    if (messageButton) return 'connected';
    if (connectButton) return 'not_connected';
    return 'unknown';
  }

  extractMutualConnectionsFromCard(card) {
    const mutualText = card.querySelector('[href*="facetNetwork"]')?.textContent;
    if (mutualText) {
      const match = mutualText.match(/(\d+)\s*mutual/i);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  }

  checkSalesNavigatorAccess() {
    return document.querySelector('[href*="/sales/"]') !== null;
  }

  extractSalesNavSearchResults() {
    // Extract results from Sales Navigator search if available
    const results = [];
    const resultCards = document.querySelectorAll('.search-results__result-item');

    for (const card of resultCards) {
      // Sales Navigator specific extraction logic
      results.push({
        name: card.querySelector('.result-lockup__name')?.textContent?.trim(),
        title: card.querySelector('.result-lockup__highlight-keyword')?.textContent?.trim(),
        company: card.querySelector('.result-lockup__position-company')?.textContent?.trim()
      });
    }

    return results;
  }

  extractSavedLeads() {
    // Extract saved leads data if on saved leads page
    return [];
  }

  extractTeamLinkData() {
    // Extract TeamLink data if available (shared leads/accounts)
    return {};
  }

  async showSherpaWidget(profileData) {
    // Only show widget if we have relationship intelligence to display
    const hasIntelligence = await this.checkForRelationshipIntel(profileData);
    
    if (!hasIntelligence) return;

    // Create floating widget
    const widget = document.createElement('div');
    widget.id = 'sherpa-widget';
    widget.innerHTML = `
      <div class="sherpa-widget-container">
        <div class="sherpa-widget-header">
          <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="Sherpa" />
          <span>TheSalesSherpa</span>
          <button class="sherpa-close" aria-label="Close">×</button>
        </div>
        <div class="sherpa-widget-content">
          <div class="sherpa-loading">Analyzing connections...</div>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(widget);

    // Load relationship intelligence
    this.loadRelationshipIntel(profileData, widget);

    // Handle close button
    widget.querySelector('.sherpa-close').onclick = () => widget.remove();
  }

  async checkForRelationshipIntel(profileData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/linkedin/check-intel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-ID': chrome.runtime.id
        },
        body: JSON.stringify({
          profileUrl: profileData.url,
          linkedinId: profileData.linkedinId
        })
      });

      const result = await response.json();
      return result.hasIntelligence || false;
    } catch (error) {
      console.warn('Error checking for relationship intelligence:', error);
      return false;
    }
  }

  async loadRelationshipIntel(profileData, widget) {
    try {
      const response = await fetch(`${this.baseUrl}/api/linkedin/relationship-intel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-ID': chrome.runtime.id
        },
        body: JSON.stringify({
          profileData,
          userId: await this.getUserId()
        })
      });

      const intel = await response.json();
      this.displayRelationshipIntel(intel, widget);
      
    } catch (error) {
      console.error('Error loading relationship intelligence:', error);
      widget.querySelector('.sherpa-widget-content').innerHTML = `
        <div class="sherpa-error">Unable to load relationship data</div>
      `;
    }
  }

  displayRelationshipIntel(intel, widget) {
    const content = widget.querySelector('.sherpa-widget-content');
    
    if (intel.warmIntros && intel.warmIntros.length > 0) {
      const intro = intel.warmIntros[0];
      content.innerHTML = `
        <div class="sherpa-intro-available">
          <h4>🔥 Warm Introduction Available!</h4>
          <div class="sherpa-path">
            <strong>${intro.degrees}° connection</strong> via ${intro.connector}
          </div>
          <div class="sherpa-success-rate">
            ${Math.round(intro.successRate * 100)}% success rate
          </div>
          <button class="sherpa-btn sherpa-btn-primary" onclick="window.open('${this.baseUrl}/warm-intro/${intro.id}')">
            Get Introduction
          </button>
        </div>
      `;
    } else if (intel.mutualConnections > 0) {
      content.innerHTML = `
        <div class="sherpa-mutual-connections">
          <h4>👥 ${intel.mutualConnections} Mutual Connections</h4>
          <p>Find warm introduction paths</p>
          <button class="sherpa-btn" onclick="window.open('${this.baseUrl}/analyze/${profileData.linkedinId}')">
            Analyze Network
          </button>
        </div>
      `;
    } else {
      content.innerHTML = `
        <div class="sherpa-no-connections">
          <h4>📊 Profile Analysis</h4>
          <p>No direct connections found</p>
          <button class="sherpa-btn" onclick="window.open('${this.baseUrl}/cold-outreach/${profileData.linkedinId}')">
            Cold Outreach Strategy
          </button>
        </div>
      `;
    }
  }

  async getUserId() {
    const result = await chrome.storage.local.get(['sherpaUserId']);
    return result.sherpaUserId || 'anonymous';
  }

  observeNavigation() {
    // LinkedIn is a single-page app, so we need to watch for URL changes
    let lastUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        // Debounce to avoid multiple rapid calls
        setTimeout(() => {
          const pageType = this.detectPageType();
          if (pageType) {
            this.analyzePage(pageType);
          }
        }, 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'EXTRACT_PROFILE':
        this.analyzeProfile().then(sendResponse).catch(error => {
          sendResponse({ error: error.message });
        });
        break;
        
      case 'EXTRACT_CONNECTIONS':
        this.analyzeConnections().then(sendResponse).catch(error => {
          sendResponse({ error: error.message });
        });
        break;
        
      case 'CHECK_PAGE_TYPE':
        sendResponse({ pageType: this.detectPageType() });
        break;
        
      case 'TOGGLE_ENABLED':
        this.isEnabled = message.enabled;
        chrome.storage.local.set({ sherpaEnabled: message.enabled });
        if (this.isEnabled && this.userConsent) {
          this.setupPageAnalysis();
        }
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new LinkedInParser();
  });
} else {
  new LinkedInParser();
}