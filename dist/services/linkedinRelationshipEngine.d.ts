/**
 * LinkedIn-Enhanced Relationship Engine for TheSalesSherpa
 *
 * Extends the existing relationship engine with LinkedIn-specific
 * relationship scoring, connection mapping, and warm intro intelligence.
 *
 * Integrates with LinkedInService to provide real relationship data
 * and advanced scoring based on LinkedIn interaction patterns.
 */
import RelationshipEngine, { NetworkNode, NetworkEdge, PathResult } from './relationshipEngine';
import LinkedInService, { LinkedInProfile, LinkedInConnection } from './linkedinService';
export interface LinkedInNetworkNode extends NetworkNode {
    linkedinProfile?: LinkedInProfile;
    lastActivity?: Date;
    mutualConnections?: number;
    endorsements?: number;
    sharedExperiences?: SharedExperience[];
    profileCompleteness?: number;
    responseRate?: number;
    preferredContactMethod?: 'linkedin' | 'email' | 'phone';
}
export interface LinkedInNetworkEdge extends NetworkEdge {
    linkedinConnectionData?: LinkedInConnection;
    interactionHistory?: LinkedInInteraction[];
    endorsementCount?: number;
    recommendationGiven?: boolean;
    recommendationReceived?: boolean;
    messageHistory?: LinkedInMessage[];
    meetingHistory?: Meeting[];
    sharedContent?: SharedContent[];
}
export interface SharedExperience {
    type: 'company' | 'school' | 'group' | 'event';
    name: string;
    startDate?: Date;
    endDate?: Date;
    overlap?: number;
    context?: string;
}
export interface LinkedInInteraction {
    type: 'like' | 'comment' | 'share' | 'message' | 'connection_request' | 'endorsement';
    date: Date;
    content?: string;
    direction: 'sent' | 'received';
    engagementScore: number;
}
export interface LinkedInMessage {
    id: string;
    date: Date;
    from: string;
    to: string;
    content: string;
    responseTime?: number;
    threadLength?: number;
    sentiment?: 'positive' | 'neutral' | 'negative';
}
export interface Meeting {
    date: Date;
    duration?: number;
    type: 'video' | 'in_person' | 'phone';
    context?: string;
    followUpActions?: string[];
}
export interface SharedContent {
    type: 'article' | 'post' | 'comment';
    date: Date;
    title?: string;
    engagementCount?: number;
    sentiment?: 'positive' | 'neutral' | 'negative';
}
export interface LinkedInPathResult extends PathResult {
    linkedinIntroTemplate?: string;
    estimatedResponseTime?: number;
    bestContactTime?: string;
    introContext?: string;
    riskFactors?: string[];
    successIndicators?: string[];
}
export interface WarmIntroOpportunity {
    targetProfile: LinkedInProfile;
    pathResult: LinkedInPathResult;
    urgencyScore: number;
    contextScore: number;
    timingSensitivity?: {
        bestTimeToReach: string;
        urgentDeadline?: Date;
        seasonality?: string;
    };
    suggestedApproach: {
        primaryMessage: string;
        backupMessages: string[];
        contextPoints: string[];
        valuePropositions: string[];
    };
    expectedOutcome: {
        responseRate: number;
        meetingRate: number;
        closeRate?: number;
        timeToResponse: number;
    };
}
/**
 * Enhanced relationship engine with LinkedIn intelligence
 */
export declare class LinkedInRelationshipEngine extends RelationshipEngine {
    private linkedinService;
    private userLinkedInProfile?;
    private connectionCache;
    private interactionAnalytics;
    constructor(userId: string, linkedinService: LinkedInService, userLinkedInProfile?: LinkedInProfile);
    /**
     * Import user's LinkedIn network and build relationship graph
     */
    importLinkedInNetwork(userLinkedInUrl: string, options?: {
        includeSecondDegree?: boolean;
        maxConnections?: number;
        minConnectionStrength?: number;
    }): Promise<{
        nodesImported: number;
        edgesImported: number;
        secondDegreeNodes?: number;
        errors?: string[];
    }>;
    /**
     * Find warm introduction opportunities for a target
     */
    findWarmIntroOpportunities(targetLinkedInUrl: string, options?: {
        maxPaths?: number;
        includeWeakConnections?: boolean;
        contextRequired?: boolean;
    }): Promise<WarmIntroOpportunity[]>;
    /**
     * Analyze relationship strength using LinkedIn-specific factors
     */
    private calculateLinkedInRelationshipStrength;
    /**
     * Enhanced path finding with LinkedIn intelligence
     */
    private enhancePathWithLinkedInIntel;
    /**
     * Calculate profile completeness score
     */
    private calculateProfileCompleteness;
    /**
     * Estimate response rate based on connection data
     */
    private estimateResponseRate;
    /**
     * Determine preferred contact method
     */
    private determinePreferredContact;
    /**
     * Infer relationship type from LinkedIn connection data
     */
    private inferRelationshipType;
    /**
     * Generate relationship context description
     */
    private generateRelationshipContext;
    /**
     * Generate LinkedIn-specific introduction template
     */
    private generateLinkedInIntroTemplate;
    /**
     * Import second-degree connections
     */
    private importSecondDegreeConnections;
    private analyzeConnectionInteractions;
    private calculateUrgencyScore;
    private calculateContextScore;
    private generateIntroductionStrategy;
    private predictIntroOutcome;
    private isProfessionalIndustry;
    private estimateResponseTime;
    private determineBestContactTime;
    private generateIntroContext;
    private identifyRiskFactors;
    private identifySuccessIndicators;
    private analyzeTimingSensitivity;
    private calculateAverageResponseTime;
    private calculateEngagementLevel;
    private identifyPreferredResponseTime;
    private identifyTopicPreferences;
}
export default LinkedInRelationshipEngine;
//# sourceMappingURL=linkedinRelationshipEngine.d.ts.map