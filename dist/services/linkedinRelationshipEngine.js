"use strict";
/**
 * LinkedIn-Enhanced Relationship Engine for TheSalesSherpa
 *
 * Extends the existing relationship engine with LinkedIn-specific
 * relationship scoring, connection mapping, and warm intro intelligence.
 *
 * Integrates with LinkedInService to provide real relationship data
 * and advanced scoring based on LinkedIn interaction patterns.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedInRelationshipEngine = void 0;
const relationshipEngine_1 = __importDefault(require("./relationshipEngine"));
/**
 * Enhanced relationship engine with LinkedIn intelligence
 */
class LinkedInRelationshipEngine extends relationshipEngine_1.default {
    linkedinService;
    userLinkedInProfile;
    connectionCache;
    interactionAnalytics;
    constructor(userId, linkedinService, userLinkedInProfile) {
        super(userId);
        this.linkedinService = linkedinService;
        this.userLinkedInProfile = userLinkedInProfile;
        this.connectionCache = new Map();
        this.interactionAnalytics = new Map();
    }
    /**
     * Import user's LinkedIn network and build relationship graph
     */
    async importLinkedInNetwork(userLinkedInUrl, options = {}) {
        const { includeSecondDegree = false, maxConnections = 1000, minConnectionStrength = 0.1 } = options;
        const errors = [];
        let nodesImported = 0;
        let edgesImported = 0;
        let secondDegreeNodes = 0;
        try {
            // Get user's profile
            this.userLinkedInProfile = await this.linkedinService.getProfile(userLinkedInUrl);
            // Add user node
            const userNode = {
                id: this.userId,
                type: 'user',
                name: this.userLinkedInProfile.fullName,
                title: this.userLinkedInProfile.headline,
                company: this.userLinkedInProfile.currentCompany?.name,
                email: undefined, // User's own email not from LinkedIn
                linkedinId: this.userLinkedInProfile.linkedinId,
                linkedinProfile: this.userLinkedInProfile,
                profileCompleteness: this.calculateProfileCompleteness(this.userLinkedInProfile)
            };
            this.addNode(userNode);
            nodesImported++;
            // Get user's connections
            const connections = await this.linkedinService.getConnections(this.userLinkedInProfile.id);
            this.connectionCache.set(this.userId, connections);
            // Add first-degree connections
            for (const connection of connections.slice(0, maxConnections)) {
                if (connection.relationshipStrength < minConnectionStrength) {
                    continue;
                }
                try {
                    // Get full profile for each connection
                    const profile = await this.linkedinService.getProfile(connection.profileId);
                    const connectionNode = {
                        id: connection.id,
                        type: 'connection',
                        name: profile.fullName,
                        title: profile.headline,
                        company: profile.currentCompany?.name,
                        linkedinId: profile.linkedinId,
                        linkedinProfile: profile,
                        mutualConnections: connection.mutualConnections,
                        lastActivity: connection.lastInteraction,
                        profileCompleteness: this.calculateProfileCompleteness(profile),
                        responseRate: this.estimateResponseRate(connection),
                        preferredContactMethod: this.determinePreferredContact(profile, connection)
                    };
                    this.addNode(connectionNode);
                    nodesImported++;
                    // Create relationship edge
                    const relationshipType = this.inferRelationshipType(connection);
                    const edge = {
                        sourceId: this.userId,
                        targetId: connection.id,
                        relationshipType,
                        strength: this.calculateLinkedInRelationshipStrength(connection, profile),
                        context: this.generateRelationshipContext(connection, profile),
                        lastInteraction: connection.lastInteraction,
                        mutualConnections: connection.mutualConnections || 0,
                        verified: true,
                        linkedinConnectionData: connection,
                        endorsementCount: connection.endorsements?.length || 0
                    };
                    this.addEdge(edge);
                    edgesImported++;
                    // Add to interaction analytics
                    this.analyzeConnectionInteractions(connection);
                }
                catch (error) {
                    errors.push(`Failed to import connection ${connection.id}: ${error.message}`);
                }
            }
            // Import second-degree connections if requested
            if (includeSecondDegree) {
                secondDegreeNodes = await this.importSecondDegreeConnections(connections, minConnectionStrength);
            }
        }
        catch (error) {
            errors.push(`Failed to import LinkedIn network: ${error.message}`);
        }
        return {
            nodesImported,
            edgesImported,
            secondDegreeNodes,
            errors: errors.length > 0 ? errors : undefined
        };
    }
    /**
     * Find warm introduction opportunities for a target
     */
    async findWarmIntroOpportunities(targetLinkedInUrl, options = {}) {
        const { maxPaths = 3, includeWeakConnections = false, contextRequired = true } = options;
        try {
            // Get target profile
            const targetProfile = await this.linkedinService.getProfile(targetLinkedInUrl);
            // Add target as temporary node if not exists
            if (!this.nodes.has(targetProfile.id)) {
                const targetNode = {
                    id: targetProfile.id,
                    type: 'contact',
                    name: targetProfile.fullName,
                    title: targetProfile.headline,
                    company: targetProfile.currentCompany?.name,
                    linkedinId: targetProfile.linkedinId,
                    linkedinProfile: targetProfile,
                    isTarget: true,
                    profileCompleteness: this.calculateProfileCompleteness(targetProfile)
                };
                this.addNode(targetNode);
            }
            // Find all paths to target
            const pathResult = this.findPaths(targetProfile.id, 7, maxPaths);
            if (!pathResult) {
                return [];
            }
            // Enhance path result with LinkedIn intelligence
            const enhancedPathResult = await this.enhancePathWithLinkedInIntel(pathResult, targetProfile);
            // Calculate opportunity scores
            const urgencyScore = this.calculateUrgencyScore(targetProfile, enhancedPathResult);
            const contextScore = this.calculateContextScore(enhancedPathResult);
            // Generate suggested approach
            const suggestedApproach = await this.generateIntroductionStrategy(enhancedPathResult, targetProfile);
            // Predict outcomes
            const expectedOutcome = this.predictIntroOutcome(enhancedPathResult, targetProfile);
            const opportunity = {
                targetProfile,
                pathResult: enhancedPathResult,
                urgencyScore,
                contextScore,
                timingSensitivity: this.analyzeTimingSensitivity(targetProfile),
                suggestedApproach,
                expectedOutcome
            };
            return [opportunity];
        }
        catch (error) {
            console.error('Error finding warm intro opportunities:', error);
            return [];
        }
    }
    /**
     * Analyze relationship strength using LinkedIn-specific factors
     */
    calculateLinkedInRelationshipStrength(connection, profile) {
        let strength = 0;
        // Base connection strength from LinkedIn data
        strength += connection.relationshipStrength * 0.4;
        // Mutual connections boost (network effect)
        if (connection.mutualConnections) {
            const mutualBoost = Math.min(connection.mutualConnections / 50, 0.3);
            strength += mutualBoost;
        }
        // Recency of interaction
        if (connection.lastInteraction) {
            const daysSinceInteraction = (Date.now() - connection.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceInteraction < 30) {
                strength += 0.2; // Recent interaction
            }
            else if (daysSinceInteraction < 90) {
                strength += 0.1; // Somewhat recent
            }
            // No boost for interactions > 90 days old
        }
        // Endorsements (professional validation)
        if (connection.endorsements && connection.endorsements.length > 0) {
            strength += Math.min(connection.endorsements.length * 0.02, 0.1);
        }
        // Shared experiences (stronger professional bond)
        if (connection.sharedExperiences && connection.sharedExperiences.length > 0) {
            for (const experience of connection.sharedExperiences) {
                if (experience.type === 'company') {
                    strength += 0.15; // Worked together
                }
                else if (experience.type === 'school') {
                    strength += 0.1; // Went to school together
                }
                else {
                    strength += 0.05; // Other shared experiences
                }
            }
        }
        // Profile completeness indicates engagement level
        const completeness = this.calculateProfileCompleteness(profile);
        strength += (completeness / 100) * 0.1;
        return Math.min(strength, 1.0);
    }
    /**
     * Enhanced path finding with LinkedIn intelligence
     */
    async enhancePathWithLinkedInIntel(pathResult, targetProfile) {
        // Generate LinkedIn-specific intro template
        const linkedinIntroTemplate = this.generateLinkedInIntroTemplate(pathResult, targetProfile);
        // Estimate response time based on connection patterns
        const estimatedResponseTime = this.estimateResponseTime(pathResult);
        // Determine best contact timing
        const bestContactTime = this.determineBestContactTime(pathResult);
        // Generate intro context
        const introContext = this.generateIntroContext(pathResult, targetProfile);
        // Identify risk factors
        const riskFactors = this.identifyRiskFactors(pathResult);
        // Identify success indicators
        const successIndicators = this.identifySuccessIndicators(pathResult);
        return {
            ...pathResult,
            linkedinIntroTemplate,
            estimatedResponseTime,
            bestContactTime,
            introContext,
            riskFactors,
            successIndicators
        };
    }
    /**
     * Calculate profile completeness score
     */
    calculateProfileCompleteness(profile) {
        let score = 0;
        let maxScore = 0;
        // Profile picture
        maxScore += 10;
        if (profile.profilePictureUrl)
            score += 10;
        // Headline
        maxScore += 15;
        if (profile.headline && profile.headline.length > 10)
            score += 15;
        // Summary
        maxScore += 10;
        if (profile.summary && profile.summary.length > 50)
            score += 10;
        // Current experience
        maxScore += 20;
        if (profile.currentCompany)
            score += 20;
        // Past experience
        maxScore += 15;
        if (profile.previousExperience && profile.previousExperience.length > 0) {
            score += Math.min(profile.previousExperience.length * 5, 15);
        }
        // Education
        maxScore += 10;
        if (profile.education && profile.education.length > 0)
            score += 10;
        // Skills
        maxScore += 10;
        if (profile.skills && profile.skills.length >= 5)
            score += 10;
        // Location
        maxScore += 5;
        if (profile.location)
            score += 5;
        // Industry
        maxScore += 5;
        if (profile.industry)
            score += 5;
        return Math.round((score / maxScore) * 100);
    }
    /**
     * Estimate response rate based on connection data
     */
    estimateResponseRate(connection) {
        let rate = 0.3; // Base 30% response rate
        // Adjust based on relationship strength
        rate += connection.relationshipStrength * 0.4;
        // Adjust based on recent activity
        if (connection.lastInteraction) {
            const daysSince = (Date.now() - connection.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince < 30) {
                rate += 0.2;
            }
            else if (daysSince > 365) {
                rate -= 0.1;
            }
        }
        // Adjust based on mutual connections
        if (connection.mutualConnections && connection.mutualConnections > 10) {
            rate += 0.1;
        }
        return Math.min(Math.max(rate, 0.05), 0.95);
    }
    /**
     * Determine preferred contact method
     */
    determinePreferredContact(profile, connection) {
        // Default to LinkedIn for professional contacts
        if (profile.industry && this.isProfessionalIndustry(profile.industry)) {
            return 'linkedin';
        }
        // Use email for closer connections
        if (connection.relationshipStrength > 0.7) {
            return 'email';
        }
        return 'linkedin';
    }
    /**
     * Infer relationship type from LinkedIn connection data
     */
    inferRelationshipType(connection) {
        // Use shared experiences to infer relationship type
        if (connection.sharedExperiences) {
            for (const experience of connection.sharedExperiences) {
                if (experience.type === 'company') {
                    if (experience.overlap && experience.overlap > 12) {
                        return 'colleague';
                    }
                    else {
                        return 'former_colleague';
                    }
                }
                else if (experience.type === 'school') {
                    return 'classmate';
                }
            }
        }
        // Default based on connection strength
        if (connection.relationshipStrength > 0.8) {
            return 'friend';
        }
        else if (connection.relationshipStrength > 0.5) {
            return 'colleague';
        }
        else {
            return 'acquaintance';
        }
    }
    /**
     * Generate relationship context description
     */
    generateRelationshipContext(connection, profile) {
        const contexts = [];
        // Add shared experience context
        if (connection.sharedExperiences) {
            for (const experience of connection.sharedExperiences) {
                if (experience.type === 'company') {
                    contexts.push(`Worked together at ${experience.name}`);
                }
                else if (experience.type === 'school') {
                    contexts.push(`Classmates at ${experience.name}`);
                }
            }
        }
        // Add mutual connection context
        if (connection.mutualConnections && connection.mutualConnections > 5) {
            contexts.push(`${connection.mutualConnections} mutual connections`);
        }
        // Add recent interaction context
        if (connection.lastInteraction) {
            const daysSince = Math.floor((Date.now() - connection.lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince < 30) {
                contexts.push(`Recent interaction (${daysSince} days ago)`);
            }
        }
        return contexts.join(', ') || 'Professional connection';
    }
    /**
     * Generate LinkedIn-specific introduction template
     */
    generateLinkedInIntroTemplate(pathResult, target) {
        const connector = pathResult.path[1];
        if (!connector)
            return '';
        const templates = [
            `Hi ${connector.name}! Hope you're doing well. I'm reaching out about connecting with ${target.fullName} at ${target.currentCompany?.name}. Given your background at ${connector.company}, I thought you might know each other. Would you be open to making a brief introduction? I think there could be some interesting synergies to explore.`,
            `Hey ${connector.name}! Quick favor - I'm looking to connect with ${target.headline.toLowerCase()} leaders and saw your connection with ${target.fullName}. Would it make sense for you to facilitate an intro? Happy to keep it high-level and make it easy for you.`,
            `${connector.name}, hope all is well! I remember our work at ${connector.company} and wanted to reach out. I'm exploring some partnerships with companies like ${target.currentCompany?.name} and noticed you're connected with ${target.fullName}. Any chance you'd be comfortable with a soft intro?`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }
    /**
     * Import second-degree connections
     */
    async importSecondDegreeConnections(firstDegreeConnections, minStrength) {
        let imported = 0;
        // Sample of first-degree connections to explore (avoid rate limits)
        const sampleConnections = firstDegreeConnections
            .filter(c => c.relationshipStrength >= minStrength)
            .slice(0, 50); // Limit to avoid API overuse
        for (const connection of sampleConnections) {
            try {
                const secondDegree = await this.linkedinService.getConnections(connection.profileId);
                for (const secondConnection of secondDegree.slice(0, 20)) {
                    if (!this.nodes.has(secondConnection.profileId)) {
                        try {
                            const profile = await this.linkedinService.getProfile(secondConnection.profileId);
                            const node = {
                                id: secondConnection.profileId,
                                type: 'contact',
                                name: profile.fullName,
                                title: profile.headline,
                                company: profile.currentCompany?.name,
                                linkedinId: profile.linkedinId,
                                linkedinProfile: profile
                            };
                            this.addNode(node);
                            // Add edge from first-degree to second-degree
                            const edge = {
                                sourceId: connection.id,
                                targetId: secondConnection.profileId,
                                relationshipType: this.inferRelationshipType(secondConnection),
                                strength: secondConnection.relationshipStrength * 0.8, // Discount for being 2nd degree
                                verified: false,
                                linkedinConnectionData: secondConnection
                            };
                            this.addEdge(edge);
                            imported++;
                        }
                        catch (error) {
                            // Skip if can't get profile
                            continue;
                        }
                    }
                }
            }
            catch (error) {
                // Skip if can't get connections
                continue;
            }
        }
        return imported;
    }
    analyzeConnectionInteractions(connection) {
        // Analyze interaction patterns for future response predictions
        const analytics = {
            connectionId: connection.id,
            averageResponseTime: this.calculateAverageResponseTime(connection),
            engagementLevel: this.calculateEngagementLevel(connection),
            preferredTimeOfDay: this.identifyPreferredResponseTime(connection),
            topicPreferences: this.identifyTopicPreferences(connection)
        };
        this.interactionAnalytics.set(connection.id, analytics);
    }
    calculateUrgencyScore(profile, pathResult) {
        // Implementation would analyze profile for urgency signals
        return 75; // Placeholder
    }
    calculateContextScore(pathResult) {
        // Implementation would score available context for introduction
        return 85; // Placeholder
    }
    async generateIntroductionStrategy(pathResult, target) {
        // Implementation would generate personalized approach strategies
        return {
            primaryMessage: pathResult.linkedinIntroTemplate || '',
            backupMessages: [],
            contextPoints: [],
            valuePropositions: []
        };
    }
    predictIntroOutcome(pathResult, target) {
        return {
            responseRate: pathResult.introSuccessRate,
            meetingRate: pathResult.introSuccessRate * 0.7,
            timeToResponse: pathResult.estimatedResponseTime || 3
        };
    }
    // Helper methods for various calculations (implementation details)
    isProfessionalIndustry(industry) {
        const professionalIndustries = [
            'technology', 'software', 'consulting', 'finance', 'healthcare', 'legal'
        ];
        return professionalIndustries.some(prof => industry.toLowerCase().includes(prof));
    }
    estimateResponseTime(pathResult) {
        // Base response time by degree of separation
        const baseTime = Math.pow(pathResult.degrees, 1.5);
        return Math.round(baseTime);
    }
    determineBestContactTime(pathResult) {
        // Analyze connection patterns to suggest timing
        return 'Tuesday-Thursday 10-11 AM';
    }
    generateIntroContext(pathResult, target) {
        return `Professional introduction via ${pathResult.degrees}-degree connection`;
    }
    identifyRiskFactors(pathResult) {
        const factors = [];
        if (pathResult.degrees > 3) {
            factors.push('Long connection path may reduce effectiveness');
        }
        if (pathResult.confidence < 0.5) {
            factors.push('Low confidence in relationship strength');
        }
        return factors;
    }
    identifySuccessIndicators(pathResult) {
        const indicators = [];
        if (pathResult.degrees <= 2) {
            indicators.push('Short connection path increases success rate');
        }
        if (pathResult.confidence > 0.8) {
            indicators.push('High confidence in relationship quality');
        }
        return indicators;
    }
    analyzeTimingSensitivity(profile) {
        return {
            bestTimeToReach: 'Tuesday-Thursday 10-11 AM',
            seasonality: 'Q4 budget planning season'
        };
    }
    calculateAverageResponseTime(connection) {
        // Placeholder - would analyze message history
        return 24; // hours
    }
    calculateEngagementLevel(connection) {
        // Placeholder - would analyze interaction patterns
        return 0.7;
    }
    identifyPreferredResponseTime(connection) {
        // Placeholder - would analyze response timing patterns
        return '10-11 AM';
    }
    identifyTopicPreferences(connection) {
        // Placeholder - would analyze content engagement
        return ['business', 'technology'];
    }
}
exports.LinkedInRelationshipEngine = LinkedInRelationshipEngine;
exports.default = LinkedInRelationshipEngine;
//# sourceMappingURL=linkedinRelationshipEngine.js.map