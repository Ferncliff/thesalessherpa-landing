/**
 * LinkedIn Integration Service for TheSalesSherpa
 * 
 * Multi-provider LinkedIn data integration supporting:
 * - Chrome Extension (direct user data)
 * - Proxycurl API (profile enrichment)
 * - People Data Labs (company intelligence)
 * - Fresh LinkedIn Scraper (fallback)
 * 
 * Provides unified interface for LinkedIn data with confidence scoring
 * and intelligent fallback between providers.
 */

export interface LinkedInProfile {
  id: string;
  linkedinId?: string;
  linkedinUrl: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string;
  summary?: string;
  location: string;
  industry?: string;
  currentCompany?: {
    name: string;
    title: string;
    duration?: string;
    companyId?: string;
  };
  previousExperience: Array<{
    company: string;
    title: string;
    duration: string;
    description?: string;
  }>;
  education: Array<{
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    years?: string;
  }>;
  skills: string[];
  recommendations?: number;
  connections?: number;
  profilePictureUrl?: string;
  backgroundImageUrl?: string;
  lastUpdated: Date;
  confidence: number; // 0.0-1.0 data quality score
  dataSource: 'chrome_extension' | 'proxycurl' | 'people_data_labs' | 'fresh_scraper';
}

export interface LinkedInConnection {
  id: string;
  profileId: string;
  connectedAt: Date;
  connectionDegree: number; // 1 = direct, 2 = 2nd degree, etc.
  mutualConnections?: number;
  relationshipStrength: number; // 0.0-1.0
  context?: string;
  lastInteraction?: Date;
  interactionCount?: number;
  endorsements?: Array<{
    skill: string;
    endorsedAt: Date;
  }>;
  sharedExperiences?: Array<{
    type: 'company' | 'school' | 'group';
    name: string;
    overlap?: string;
  }>;
}

export interface LinkedInCompany {
  id: string;
  name: string;
  linkedinId?: string;
  linkedinUrl?: string;
  description?: string;
  website?: string;
  industry: string;
  size: string;
  headquarters: string;
  founded?: number;
  specialties: string[];
  logoUrl?: string;
  coverImageUrl?: string;
  employeeCount?: number;
  recentUpdates?: Array<{
    type: string;
    title: string;
    date: Date;
    url?: string;
  }>;
  dataSource: string;
  confidence: number;
}

export interface LinkedInEmployee {
  profileId: string;
  companyId: string;
  title: string;
  department?: string;
  startDate?: Date;
  isCurrent: boolean;
  profile: LinkedInProfile;
}

export interface LinkedInSearchQuery {
  keywords?: string;
  location?: string;
  industry?: string;
  currentCompany?: string;
  pastCompany?: string;
  title?: string;
  seniority?: string;
  function?: string;
  limit?: number;
}

export interface LinkedInSearchResult {
  profiles: LinkedInProfile[];
  totalResults: number;
  hasMore: boolean;
  searchId?: string;
  confidence: number;
}

export interface LinkedInDataProvider {
  name: string;
  priority: number; // Lower = higher priority
  costPerRequest: number;
  rateLimit: number; // requests per minute
  
  getProfile(linkedinUrl: string): Promise<LinkedInProfile>;
  getConnections(profileId: string): Promise<LinkedInConnection[]>;
  getCompanyProfile(companyUrl: string): Promise<LinkedInCompany>;
  getCompanyEmployees(companyId: string, limit?: number): Promise<LinkedInEmployee[]>;
  searchProfiles(query: LinkedInSearchQuery): Promise<LinkedInSearchResult>;
  isAvailable(): Promise<boolean>;
}

/**
 * Chrome Extension Provider - Direct access to user's LinkedIn data
 */
export class ChromeExtensionProvider implements LinkedInDataProvider {
  name = 'Chrome Extension';
  priority = 1; // Highest priority - real user data
  costPerRequest = 0;
  rateLimit = 60; // Conservative limit
  
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = 'http://localhost:3001', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/extension/status`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getProfile(linkedinUrl: string): Promise<LinkedInProfile> {
    const response = await fetch(`${this.baseUrl}/api/extension/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey })
      },
      body: JSON.stringify({ linkedinUrl })
    });

    if (!response.ok) {
      throw new Error(`Chrome extension error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ...data,
      confidence: 0.95, // Very high confidence for direct user data
      dataSource: 'chrome_extension' as const,
      lastUpdated: new Date()
    };
  }

  async getConnections(profileId: string): Promise<LinkedInConnection[]> {
    const response = await fetch(`${this.baseUrl}/api/extension/connections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey })
      },
      body: JSON.stringify({ profileId })
    });

    if (!response.ok) {
      throw new Error(`Chrome extension error: ${response.statusText}`);
    }

    return response.json();
  }

  async getCompanyProfile(companyUrl: string): Promise<LinkedInCompany> {
    const response = await fetch(`${this.baseUrl}/api/extension/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey })
      },
      body: JSON.stringify({ companyUrl })
    });

    if (!response.ok) {
      throw new Error(`Chrome extension error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ...data,
      confidence: 0.9,
      dataSource: 'chrome_extension'
    };
  }

  async getCompanyEmployees(companyId: string, limit = 50): Promise<LinkedInEmployee[]> {
    const response = await fetch(`${this.baseUrl}/api/extension/company-employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey })
      },
      body: JSON.stringify({ companyId, limit })
    });

    if (!response.ok) {
      throw new Error(`Chrome extension error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchProfiles(query: LinkedInSearchQuery): Promise<LinkedInSearchResult> {
    const response = await fetch(`${this.baseUrl}/api/extension/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey })
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`Chrome extension error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ...data,
      confidence: 0.9
    };
  }
}

/**
 * Proxycurl Provider - High-quality LinkedIn data with GDPR compliance
 */
export class ProxycurlProvider implements LinkedInDataProvider {
  name = 'Proxycurl';
  priority = 2;
  costPerRequest = 0.20;
  rateLimit = 300; // Per month on free tier

  private apiKey: string;
  private baseUrl = 'https://nubela.co/proxycurl/api/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async getProfile(linkedinUrl: string): Promise<LinkedInProfile> {
    const response = await fetch(`${this.baseUrl}/linkedin`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      params: new URLSearchParams({ url: linkedinUrl })
    });

    if (!response.ok) {
      throw new Error(`Proxycurl error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      id: this.generateId(linkedinUrl),
      linkedinUrl,
      linkedinId: this.extractLinkedInId(linkedinUrl),
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      fullName: data.full_name || `${data.first_name} ${data.last_name}`.trim(),
      headline: data.headline || '',
      summary: data.summary,
      location: data.country_full_name || data.city || '',
      industry: data.industry,
      currentCompany: data.experiences?.[0] ? {
        name: data.experiences[0].company,
        title: data.experiences[0].title,
        duration: this.formatDuration(data.experiences[0].starts_at, data.experiences[0].ends_at),
        companyId: data.experiences[0].company_linkedin_profile_url
      } : undefined,
      previousExperience: this.mapExperience(data.experiences?.slice(1) || []),
      education: this.mapEducation(data.education || []),
      skills: data.skills || [],
      connections: data.connections,
      profilePictureUrl: data.profile_pic_url,
      confidence: 0.85, // High confidence for Proxycurl
      dataSource: 'proxycurl' as const,
      lastUpdated: new Date()
    };
  }

  async getConnections(profileId: string): Promise<LinkedInConnection[]> {
    // Proxycurl doesn't provide direct connections - would need separate endpoint
    throw new Error('Proxycurl connections not implemented - use Chrome extension instead');
  }

  async getCompanyProfile(companyUrl: string): Promise<LinkedInCompany> {
    const response = await fetch(`${this.baseUrl}/linkedin/company`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      params: new URLSearchParams({ url: companyUrl })
    });

    if (!response.ok) {
      throw new Error(`Proxycurl error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      id: this.generateId(companyUrl),
      name: data.name,
      linkedinUrl: companyUrl,
      linkedinId: this.extractLinkedInId(companyUrl),
      description: data.description,
      website: data.website,
      industry: data.industry,
      size: data.company_size_on_linkedin || data.company_size || '',
      headquarters: `${data.hq?.city || ''}, ${data.hq?.country || ''}`.trim(),
      founded: data.founded_year,
      specialties: data.specialities || [],
      logoUrl: data.logo_url,
      employeeCount: this.parseEmployeeCount(data.company_size_on_linkedin),
      confidence: 0.85,
      dataSource: 'proxycurl'
    };
  }

  async getCompanyEmployees(companyId: string, limit = 50): Promise<LinkedInEmployee[]> {
    // Would need separate Proxycurl endpoint for company employees
    throw new Error('Proxycurl company employees not implemented');
  }

  async searchProfiles(query: LinkedInSearchQuery): Promise<LinkedInSearchResult> {
    // Proxycurl doesn't have search - would need different approach
    throw new Error('Proxycurl search not implemented');
  }

  private generateId(url: string): string {
    return Buffer.from(url).toString('base64').substring(0, 16);
  }

  private extractLinkedInId(url: string): string | undefined {
    const match = url.match(/linkedin\.com\/(?:in|company)\/([^/?]+)/);
    return match ? match[1] : undefined;
  }

  private formatDuration(startDate: any, endDate: any): string {
    if (!startDate) return '';
    const start = `${startDate.month}/${startDate.year}`;
    const end = endDate ? `${endDate.month}/${endDate.year}` : 'Present';
    return `${start} - ${end}`;
  }

  private mapExperience(experiences: any[]): Array<{
    company: string;
    title: string;
    duration: string;
    description?: string;
  }> {
    return experiences.map(exp => ({
      company: exp.company || '',
      title: exp.title || '',
      duration: this.formatDuration(exp.starts_at, exp.ends_at),
      description: exp.description
    }));
  }

  private mapEducation(education: any[]): Array<{
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    years?: string;
  }> {
    return education.map(edu => ({
      school: edu.school || '',
      degree: edu.degree_name,
      fieldOfStudy: edu.field_of_study,
      years: this.formatDuration(edu.starts_at, edu.ends_at)
    }));
  }

  private parseEmployeeCount(sizeStr?: string): number | undefined {
    if (!sizeStr) return undefined;
    const match = sizeStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : undefined;
  }
}

/**
 * People Data Labs Provider - Comprehensive B2B data beyond LinkedIn
 */
export class PeopleDataLabsProvider implements LinkedInDataProvider {
  name = 'People Data Labs';
  priority = 3;
  costPerRequest = 0.015;
  rateLimit = 100;

  private apiKey: string;
  private baseUrl = 'https://api.peopledatalabs.com/v5';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }

  async getProfile(linkedinUrl: string): Promise<LinkedInProfile> {
    const response = await fetch(`${this.baseUrl}/person/enrich`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
      },
      params: new URLSearchParams({ profile: linkedinUrl })
    });

    if (!response.ok) {
      throw new Error(`People Data Labs error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map PDL data structure to our format
    return {
      id: data.id || this.generateId(linkedinUrl),
      linkedinUrl,
      linkedinId: this.extractLinkedInId(linkedinUrl),
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      fullName: data.full_name || `${data.first_name} ${data.last_name}`.trim(),
      headline: data.headline || data.summary || '',
      summary: data.summary,
      location: `${data.location_country || ''} ${data.location_region || ''}`.trim(),
      industry: data.industry,
      currentCompany: data.experience?.[0] ? {
        name: data.experience[0].company?.name || '',
        title: data.experience[0].title?.name || '',
        duration: this.formatDateRange(data.experience[0].start_date, data.experience[0].end_date)
      } : undefined,
      previousExperience: this.mapPDLExperience(data.experience?.slice(1) || []),
      education: this.mapPDLEducation(data.education || []),
      skills: data.skills || [],
      profilePictureUrl: data.profile_pic_url,
      confidence: 0.75, // Good confidence for PDL
      dataSource: 'people_data_labs' as const,
      lastUpdated: new Date()
    };
  }

  async getConnections(profileId: string): Promise<LinkedInConnection[]> {
    // PDL doesn't provide direct connections
    throw new Error('People Data Labs connections not available');
  }

  async getCompanyProfile(companyUrl: string): Promise<LinkedInCompany> {
    const companyName = this.extractCompanyFromUrl(companyUrl);
    
    const response = await fetch(`${this.baseUrl}/company/enrich`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
      },
      params: new URLSearchParams({ name: companyName })
    });

    if (!response.ok) {
      throw new Error(`People Data Labs error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      id: data.id || this.generateId(companyUrl),
      name: data.name,
      linkedinUrl: companyUrl,
      linkedinId: this.extractLinkedInId(companyUrl),
      description: data.summary,
      website: data.website,
      industry: data.industry,
      size: data.size || '',
      headquarters: `${data.location?.city || ''}, ${data.location?.country || ''}`.trim(),
      founded: data.founded,
      specialties: data.tags || [],
      logoUrl: data.logo_url,
      employeeCount: data.employee_count,
      confidence: 0.75,
      dataSource: 'people_data_labs'
    };
  }

  async getCompanyEmployees(companyId: string, limit = 50): Promise<LinkedInEmployee[]> {
    // Would need company search then person search by company
    throw new Error('People Data Labs company employees not implemented');
  }

  async searchProfiles(query: LinkedInSearchQuery): Promise<LinkedInSearchResult> {
    const params = new URLSearchParams();
    
    if (query.keywords) params.append('title', query.keywords);
    if (query.location) params.append('location_country', query.location);
    if (query.currentCompany) params.append('current_company', query.currentCompany);
    if (query.industry) params.append('industry', query.industry);
    if (query.limit) params.append('size', query.limit.toString());

    const response = await fetch(`${this.baseUrl}/person/search`, {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
      },
      params
    });

    if (!response.ok) {
      throw new Error(`People Data Labs error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      profiles: data.data?.map((person: any) => this.mapPDLPerson(person)) || [],
      totalResults: data.total || 0,
      hasMore: data.data?.length === (query.limit || 10),
      confidence: 0.75
    };
  }

  private generateId(url: string): string {
    return Buffer.from(url).toString('base64').substring(0, 16);
  }

  private extractLinkedInId(url: string): string | undefined {
    const match = url.match(/linkedin\.com\/(?:in|company)\/([^/?]+)/);
    return match ? match[1] : undefined;
  }

  private extractCompanyFromUrl(url: string): string {
    const match = url.match(/linkedin\.com\/company\/([^/?]+)/);
    return match ? match[1].replace(/-/g, ' ') : url;
  }

  private formatDateRange(startDate?: string, endDate?: string): string {
    if (!startDate) return '';
    const start = startDate.substring(0, 7); // YYYY-MM
    const end = endDate ? endDate.substring(0, 7) : 'Present';
    return `${start} - ${end}`;
  }

  private mapPDLExperience(experiences: any[]): Array<{
    company: string;
    title: string;
    duration: string;
    description?: string;
  }> {
    return experiences.map(exp => ({
      company: exp.company?.name || '',
      title: exp.title?.name || '',
      duration: this.formatDateRange(exp.start_date, exp.end_date),
      description: exp.summary
    }));
  }

  private mapPDLEducation(education: any[]): Array<{
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    years?: string;
  }> {
    return education.map(edu => ({
      school: edu.school?.name || '',
      degree: edu.degree?.name,
      fieldOfStudy: edu.major,
      years: this.formatDateRange(edu.start_date, edu.end_date)
    }));
  }

  private mapPDLPerson(person: any): LinkedInProfile {
    return {
      id: person.id || this.generateId(person.linkedin_url || ''),
      linkedinUrl: person.linkedin_url || '',
      linkedinId: this.extractLinkedInId(person.linkedin_url || ''),
      firstName: person.first_name || '',
      lastName: person.last_name || '',
      fullName: person.full_name || `${person.first_name} ${person.last_name}`.trim(),
      headline: person.headline || '',
      summary: person.summary,
      location: `${person.location_country || ''} ${person.location_region || ''}`.trim(),
      industry: person.industry,
      currentCompany: person.experience?.[0] ? {
        name: person.experience[0].company?.name || '',
        title: person.experience[0].title?.name || ''
      } : undefined,
      previousExperience: this.mapPDLExperience(person.experience?.slice(1) || []),
      education: this.mapPDLEducation(person.education || []),
      skills: person.skills || [],
      profilePictureUrl: person.profile_pic_url,
      confidence: 0.75,
      dataSource: 'people_data_labs' as const,
      lastUpdated: new Date()
    };
  }
}

/**
 * Main LinkedIn Service - Orchestrates multiple providers
 */
export class LinkedInService {
  private providers: LinkedInDataProvider[];
  private cache: Map<string, { data: any; expiry: Date }>;
  private requestCount: Map<string, { count: number; resetTime: Date }>;
  
  constructor(config: {
    chromeExtensionUrl?: string;
    chromeExtensionApiKey?: string;
    proxycurlApiKey?: string;
    peopleDataLabsApiKey?: string;
    cacheExpiryMinutes?: number;
  }) {
    this.providers = [];
    this.cache = new Map();
    this.requestCount = new Map();

    // Initialize providers based on available config
    if (config.chromeExtensionUrl) {
      this.providers.push(new ChromeExtensionProvider(
        config.chromeExtensionUrl,
        config.chromeExtensionApiKey
      ));
    }

    if (config.proxycurlApiKey) {
      this.providers.push(new ProxycurlProvider(config.proxycurlApiKey));
    }

    if (config.peopleDataLabsApiKey) {
      this.providers.push(new PeopleDataLabsProvider(config.peopleDataLabsApiKey));
    }

    // Sort by priority (lower number = higher priority)
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get LinkedIn profile with intelligent provider fallback
   */
  async getProfile(linkedinUrl: string, preferredProvider?: string): Promise<LinkedInProfile> {
    const cacheKey = `profile:${linkedinUrl}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let lastError: Error | undefined;
    
    // Try providers in priority order
    for (const provider of this.getAvailableProviders(preferredProvider)) {
      if (!await this.canMakeRequest(provider)) {
        continue; // Rate limited
      }

      try {
        const profile = await provider.getProfile(linkedinUrl);
        this.updateRequestCount(provider);
        this.setCache(cacheKey, profile);
        return profile;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Provider ${provider.name} failed for profile ${linkedinUrl}:`, error);
        continue;
      }
    }

    throw new Error(`All LinkedIn providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Get connections with fallback to extension-only
   */
  async getConnections(profileId: string): Promise<LinkedInConnection[]> {
    const cacheKey = `connections:${profileId}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Only Chrome extension provides connections currently
    const extensionProvider = this.providers.find(p => p.name === 'Chrome Extension');
    if (!extensionProvider || !await this.canMakeRequest(extensionProvider)) {
      throw new Error('Chrome extension required for connection data');
    }

    try {
      const connections = await extensionProvider.getConnections(profileId);
      this.updateRequestCount(extensionProvider);
      this.setCache(cacheKey, connections);
      return connections;
    } catch (error) {
      throw new Error(`Failed to get connections: ${(error as Error).message}`);
    }
  }

  /**
   * Search for profiles across all available providers
   */
  async searchProfiles(query: LinkedInSearchQuery): Promise<LinkedInSearchResult> {
    const cacheKey = `search:${JSON.stringify(query)}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let bestResult: LinkedInSearchResult | null = null;
    let highestConfidence = 0;

    // Try all providers that support search
    for (const provider of this.providers) {
      if (!await this.canMakeRequest(provider)) {
        continue;
      }

      try {
        const result = await provider.searchProfiles(query);
        this.updateRequestCount(provider);
        
        if (result.confidence > highestConfidence) {
          highestConfidence = result.confidence;
          bestResult = result;
        }
      } catch (error) {
        console.warn(`Provider ${provider.name} search failed:`, error);
        continue;
      }
    }

    if (!bestResult) {
      throw new Error('No search providers available');
    }

    this.setCache(cacheKey, bestResult);
    return bestResult;
  }

  /**
   * Get company profile with provider fallback
   */
  async getCompanyProfile(companyUrl: string): Promise<LinkedInCompany> {
    const cacheKey = `company:${companyUrl}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let lastError: Error | undefined;

    for (const provider of this.providers) {
      if (!await this.canMakeRequest(provider)) {
        continue;
      }

      try {
        const company = await provider.getCompanyProfile(companyUrl);
        this.updateRequestCount(provider);
        this.setCache(cacheKey, company);
        return company;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Provider ${provider.name} failed for company ${companyUrl}:`, error);
        continue;
      }
    }

    throw new Error(`All LinkedIn providers failed for company. Last error: ${lastError?.message}`);
  }

  /**
   * Get provider statistics
   */
  getProviderStats(): Array<{
    name: string;
    priority: number;
    available: boolean;
    requestsUsed: number;
    rateLimit: number;
    resetTime: Date | null;
  }> {
    return this.providers.map(provider => {
      const usage = this.requestCount.get(provider.name);
      return {
        name: provider.name,
        priority: provider.priority,
        available: true, // Would need async check
        requestsUsed: usage?.count || 0,
        rateLimit: provider.rateLimit,
        resetTime: usage?.resetTime || null
      };
    });
  }

  /**
   * Clear cache and reset rate limits (for testing)
   */
  reset(): void {
    this.cache.clear();
    this.requestCount.clear();
  }

  private getAvailableProviders(preferredProvider?: string): LinkedInDataProvider[] {
    if (preferredProvider) {
      const preferred = this.providers.find(p => p.name.toLowerCase().includes(preferredProvider.toLowerCase()));
      if (preferred) {
        return [preferred, ...this.providers.filter(p => p !== preferred)];
      }
    }
    return this.providers;
  }

  private async canMakeRequest(provider: LinkedInDataProvider): Promise<boolean> {
    const usage = this.requestCount.get(provider.name);
    if (!usage) return true;

    // Check if rate limit reset time has passed
    if (Date.now() > usage.resetTime.getTime()) {
      this.requestCount.delete(provider.name);
      return true;
    }

    return usage.count < provider.rateLimit;
  }

  private updateRequestCount(provider: LinkedInDataProvider): void {
    const now = new Date();
    const usage = this.requestCount.get(provider.name);

    if (!usage) {
      this.requestCount.set(provider.name, {
        count: 1,
        resetTime: new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
      });
    } else {
      usage.count++;
    }
  }

  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry.getTime()) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  private setCache(key: string, data: any, expiryMinutes = 60): void {
    this.cache.set(key, {
      data,
      expiry: new Date(Date.now() + expiryMinutes * 60 * 1000)
    });
  }
}

export default LinkedInService;