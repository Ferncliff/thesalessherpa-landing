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
    confidence: number;
    dataSource: 'chrome_extension' | 'proxycurl' | 'people_data_labs' | 'fresh_scraper';
}
export interface LinkedInConnection {
    id: string;
    profileId: string;
    connectedAt: Date;
    connectionDegree: number;
    mutualConnections?: number;
    relationshipStrength: number;
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
    priority: number;
    costPerRequest: number;
    rateLimit: number;
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
export declare class ChromeExtensionProvider implements LinkedInDataProvider {
    name: string;
    priority: number;
    costPerRequest: number;
    rateLimit: number;
    private baseUrl;
    private apiKey?;
    constructor(baseUrl?: string, apiKey?: string);
    isAvailable(): Promise<boolean>;
    getProfile(linkedinUrl: string): Promise<LinkedInProfile>;
    getConnections(profileId: string): Promise<LinkedInConnection[]>;
    getCompanyProfile(companyUrl: string): Promise<LinkedInCompany>;
    getCompanyEmployees(companyId: string, limit?: number): Promise<LinkedInEmployee[]>;
    searchProfiles(query: LinkedInSearchQuery): Promise<LinkedInSearchResult>;
}
/**
 * Proxycurl Provider - High-quality LinkedIn data with GDPR compliance
 */
export declare class ProxycurlProvider implements LinkedInDataProvider {
    name: string;
    priority: number;
    costPerRequest: number;
    rateLimit: number;
    private apiKey;
    private baseUrl;
    constructor(apiKey: string);
    isAvailable(): Promise<boolean>;
    getProfile(linkedinUrl: string): Promise<LinkedInProfile>;
    getConnections(profileId: string): Promise<LinkedInConnection[]>;
    getCompanyProfile(companyUrl: string): Promise<LinkedInCompany>;
    getCompanyEmployees(companyId: string, limit?: number): Promise<LinkedInEmployee[]>;
    searchProfiles(query: LinkedInSearchQuery): Promise<LinkedInSearchResult>;
    private generateId;
    private extractLinkedInId;
    private formatDuration;
    private mapExperience;
    private mapEducation;
    private parseEmployeeCount;
}
/**
 * People Data Labs Provider - Comprehensive B2B data beyond LinkedIn
 */
export declare class PeopleDataLabsProvider implements LinkedInDataProvider {
    name: string;
    priority: number;
    costPerRequest: number;
    rateLimit: number;
    private apiKey;
    private baseUrl;
    constructor(apiKey: string);
    isAvailable(): Promise<boolean>;
    getProfile(linkedinUrl: string): Promise<LinkedInProfile>;
    getConnections(profileId: string): Promise<LinkedInConnection[]>;
    getCompanyProfile(companyUrl: string): Promise<LinkedInCompany>;
    getCompanyEmployees(companyId: string, limit?: number): Promise<LinkedInEmployee[]>;
    searchProfiles(query: LinkedInSearchQuery): Promise<LinkedInSearchResult>;
    private generateId;
    private extractLinkedInId;
    private extractCompanyFromUrl;
    private formatDateRange;
    private mapPDLExperience;
    private mapPDLEducation;
    private mapPDLPerson;
}
/**
 * Main LinkedIn Service - Orchestrates multiple providers
 */
export declare class LinkedInService {
    private providers;
    private cache;
    private requestCount;
    constructor(config: {
        chromeExtensionUrl?: string;
        chromeExtensionApiKey?: string;
        proxycurlApiKey?: string;
        peopleDataLabsApiKey?: string;
        cacheExpiryMinutes?: number;
    });
    /**
     * Get LinkedIn profile with intelligent provider fallback
     */
    getProfile(linkedinUrl: string, preferredProvider?: string): Promise<LinkedInProfile>;
    /**
     * Get connections with fallback to extension-only
     */
    getConnections(profileId: string): Promise<LinkedInConnection[]>;
    /**
     * Search for profiles across all available providers
     */
    searchProfiles(query: LinkedInSearchQuery): Promise<LinkedInSearchResult>;
    /**
     * Get company profile with provider fallback
     */
    getCompanyProfile(companyUrl: string): Promise<LinkedInCompany>;
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
    }>;
    /**
     * Clear cache and reset rate limits (for testing)
     */
    reset(): void;
    private getAvailableProviders;
    private canMakeRequest;
    private updateRequestCount;
    private getFromCache;
    private setCache;
}
export default LinkedInService;
//# sourceMappingURL=linkedinService.d.ts.map