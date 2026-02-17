"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedInService = exports.PeopleDataLabsProvider = exports.ProxycurlProvider = exports.ChromeExtensionProvider = void 0;
/**
 * Chrome Extension Provider - Direct access to user's LinkedIn data
 */
class ChromeExtensionProvider {
    name = 'Chrome Extension';
    priority = 1; // Highest priority - real user data
    costPerRequest = 0;
    rateLimit = 60; // Conservative limit
    baseUrl;
    apiKey;
    constructor(baseUrl = 'http://localhost:3001', apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }
    async isAvailable() {
        try {
            const response = await fetch(`${this.baseUrl}/api/extension/status`);
            return response.ok;
        }
        catch {
            return false;
        }
    }
    async getProfile(linkedinUrl) {
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
            dataSource: 'chrome_extension',
            lastUpdated: new Date()
        };
    }
    async getConnections(profileId) {
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
    async getCompanyProfile(companyUrl) {
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
    async getCompanyEmployees(companyId, limit = 50) {
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
    async searchProfiles(query) {
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
exports.ChromeExtensionProvider = ChromeExtensionProvider;
/**
 * Proxycurl Provider - High-quality LinkedIn data with GDPR compliance
 */
class ProxycurlProvider {
    name = 'Proxycurl';
    priority = 2;
    costPerRequest = 0.20;
    rateLimit = 300; // Per month on free tier
    apiKey;
    baseUrl = 'https://nubela.co/proxycurl/api/v2';
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async isAvailable() {
        return !!this.apiKey;
    }
    async getProfile(linkedinUrl) {
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
            dataSource: 'proxycurl',
            lastUpdated: new Date()
        };
    }
    async getConnections(profileId) {
        // Proxycurl doesn't provide direct connections - would need separate endpoint
        throw new Error('Proxycurl connections not implemented - use Chrome extension instead');
    }
    async getCompanyProfile(companyUrl) {
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
    async getCompanyEmployees(companyId, limit = 50) {
        // Would need separate Proxycurl endpoint for company employees
        throw new Error('Proxycurl company employees not implemented');
    }
    async searchProfiles(query) {
        // Proxycurl doesn't have search - would need different approach
        throw new Error('Proxycurl search not implemented');
    }
    generateId(url) {
        return Buffer.from(url).toString('base64').substring(0, 16);
    }
    extractLinkedInId(url) {
        const match = url.match(/linkedin\.com\/(?:in|company)\/([^/?]+)/);
        return match ? match[1] : undefined;
    }
    formatDuration(startDate, endDate) {
        if (!startDate)
            return '';
        const start = `${startDate.month}/${startDate.year}`;
        const end = endDate ? `${endDate.month}/${endDate.year}` : 'Present';
        return `${start} - ${end}`;
    }
    mapExperience(experiences) {
        return experiences.map(exp => ({
            company: exp.company || '',
            title: exp.title || '',
            duration: this.formatDuration(exp.starts_at, exp.ends_at),
            description: exp.description
        }));
    }
    mapEducation(education) {
        return education.map(edu => ({
            school: edu.school || '',
            degree: edu.degree_name,
            fieldOfStudy: edu.field_of_study,
            years: this.formatDuration(edu.starts_at, edu.ends_at)
        }));
    }
    parseEmployeeCount(sizeStr) {
        if (!sizeStr)
            return undefined;
        const match = sizeStr.match(/(\d+)/);
        return match ? parseInt(match[1]) : undefined;
    }
}
exports.ProxycurlProvider = ProxycurlProvider;
/**
 * People Data Labs Provider - Comprehensive B2B data beyond LinkedIn
 */
class PeopleDataLabsProvider {
    name = 'People Data Labs';
    priority = 3;
    costPerRequest = 0.015;
    rateLimit = 100;
    apiKey;
    baseUrl = 'https://api.peopledatalabs.com/v5';
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async isAvailable() {
        return !!this.apiKey;
    }
    async getProfile(linkedinUrl) {
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
            dataSource: 'people_data_labs',
            lastUpdated: new Date()
        };
    }
    async getConnections(profileId) {
        // PDL doesn't provide direct connections
        throw new Error('People Data Labs connections not available');
    }
    async getCompanyProfile(companyUrl) {
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
    async getCompanyEmployees(companyId, limit = 50) {
        // Would need company search then person search by company
        throw new Error('People Data Labs company employees not implemented');
    }
    async searchProfiles(query) {
        const params = new URLSearchParams();
        if (query.keywords)
            params.append('title', query.keywords);
        if (query.location)
            params.append('location_country', query.location);
        if (query.currentCompany)
            params.append('current_company', query.currentCompany);
        if (query.industry)
            params.append('industry', query.industry);
        if (query.limit)
            params.append('size', query.limit.toString());
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
            profiles: data.data?.map((person) => this.mapPDLPerson(person)) || [],
            totalResults: data.total || 0,
            hasMore: data.data?.length === (query.limit || 10),
            confidence: 0.75
        };
    }
    generateId(url) {
        return Buffer.from(url).toString('base64').substring(0, 16);
    }
    extractLinkedInId(url) {
        const match = url.match(/linkedin\.com\/(?:in|company)\/([^/?]+)/);
        return match ? match[1] : undefined;
    }
    extractCompanyFromUrl(url) {
        const match = url.match(/linkedin\.com\/company\/([^/?]+)/);
        return match ? match[1].replace(/-/g, ' ') : url;
    }
    formatDateRange(startDate, endDate) {
        if (!startDate)
            return '';
        const start = startDate.substring(0, 7); // YYYY-MM
        const end = endDate ? endDate.substring(0, 7) : 'Present';
        return `${start} - ${end}`;
    }
    mapPDLExperience(experiences) {
        return experiences.map(exp => ({
            company: exp.company?.name || '',
            title: exp.title?.name || '',
            duration: this.formatDateRange(exp.start_date, exp.end_date),
            description: exp.summary
        }));
    }
    mapPDLEducation(education) {
        return education.map(edu => ({
            school: edu.school?.name || '',
            degree: edu.degree?.name,
            fieldOfStudy: edu.major,
            years: this.formatDateRange(edu.start_date, edu.end_date)
        }));
    }
    mapPDLPerson(person) {
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
            dataSource: 'people_data_labs',
            lastUpdated: new Date()
        };
    }
}
exports.PeopleDataLabsProvider = PeopleDataLabsProvider;
/**
 * Main LinkedIn Service - Orchestrates multiple providers
 */
class LinkedInService {
    providers;
    cache;
    requestCount;
    constructor(config) {
        this.providers = [];
        this.cache = new Map();
        this.requestCount = new Map();
        // Initialize providers based on available config
        if (config.chromeExtensionUrl) {
            this.providers.push(new ChromeExtensionProvider(config.chromeExtensionUrl, config.chromeExtensionApiKey));
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
    async getProfile(linkedinUrl, preferredProvider) {
        const cacheKey = `profile:${linkedinUrl}`;
        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        let lastError;
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
            }
            catch (error) {
                lastError = error;
                console.warn(`Provider ${provider.name} failed for profile ${linkedinUrl}:`, error);
                continue;
            }
        }
        throw new Error(`All LinkedIn providers failed. Last error: ${lastError?.message}`);
    }
    /**
     * Get connections with fallback to extension-only
     */
    async getConnections(profileId) {
        const cacheKey = `connections:${profileId}`;
        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
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
        }
        catch (error) {
            throw new Error(`Failed to get connections: ${error.message}`);
        }
    }
    /**
     * Search for profiles across all available providers
     */
    async searchProfiles(query) {
        const cacheKey = `search:${JSON.stringify(query)}`;
        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        let bestResult = null;
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
            }
            catch (error) {
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
    async getCompanyProfile(companyUrl) {
        const cacheKey = `company:${companyUrl}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        let lastError;
        for (const provider of this.providers) {
            if (!await this.canMakeRequest(provider)) {
                continue;
            }
            try {
                const company = await provider.getCompanyProfile(companyUrl);
                this.updateRequestCount(provider);
                this.setCache(cacheKey, company);
                return company;
            }
            catch (error) {
                lastError = error;
                console.warn(`Provider ${provider.name} failed for company ${companyUrl}:`, error);
                continue;
            }
        }
        throw new Error(`All LinkedIn providers failed for company. Last error: ${lastError?.message}`);
    }
    /**
     * Get provider statistics
     */
    getProviderStats() {
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
    reset() {
        this.cache.clear();
        this.requestCount.clear();
    }
    getAvailableProviders(preferredProvider) {
        if (preferredProvider) {
            const preferred = this.providers.find(p => p.name.toLowerCase().includes(preferredProvider.toLowerCase()));
            if (preferred) {
                return [preferred, ...this.providers.filter(p => p !== preferred)];
            }
        }
        return this.providers;
    }
    async canMakeRequest(provider) {
        const usage = this.requestCount.get(provider.name);
        if (!usage)
            return true;
        // Check if rate limit reset time has passed
        if (Date.now() > usage.resetTime.getTime()) {
            this.requestCount.delete(provider.name);
            return true;
        }
        return usage.count < provider.rateLimit;
    }
    updateRequestCount(provider) {
        const now = new Date();
        const usage = this.requestCount.get(provider.name);
        if (!usage) {
            this.requestCount.set(provider.name, {
                count: 1,
                resetTime: new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
            });
        }
        else {
            usage.count++;
        }
    }
    getFromCache(key) {
        const item = this.cache.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiry.getTime()) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }
    setCache(key, data, expiryMinutes = 60) {
        this.cache.set(key, {
            data,
            expiry: new Date(Date.now() + expiryMinutes * 60 * 1000)
        });
    }
}
exports.LinkedInService = LinkedInService;
exports.default = LinkedInService;
//# sourceMappingURL=linkedinService.js.map